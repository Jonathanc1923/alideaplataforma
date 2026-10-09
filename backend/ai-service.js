const sessionQueues = new Map();

// Helper to limit concurrent requests per session to guarantee complete isolation and zero crosstalk
async function runWithSessionLock(sessionId, fn) {
  const key = sessionId ? String(sessionId) : 'global';
  const prevPromise = sessionQueues.get(key) || Promise.resolve();
  
  const currentPromise = (async () => {
    try {
      await prevPromise;
    } catch (e) {
      // ignore previous errors
    }
    return await fn();
  })();

  sessionQueues.set(key, currentPromise.catch(() => {}));
  return currentPromise;
}

/**
 * Retorna la lista ordenada de proveedores de IA disponibles según las variables de entorno.
 * Prioridad: 1. Groq Cloud (Principal) -> 2. SiliconFlow (Respaldo) -> 3. OpenRouter (Respaldo terciario)
 */
function getActiveProviders() {
  const providers = [];

  const cleanKey = (k) => {
    if (!k) return '';
    let val = String(k).trim().replace(/^["']|["']$/g, '').trim();
    if (val.toLowerCase().startsWith('bearer ')) {
      val = val.slice(7).trim();
    }
    return val;
  };

  // 1. Principal: Groq Cloud LPU
  const groqKey = cleanKey(
    process.env.GROQ_API_KEY || 
    (process.env.AI_API_KEY?.startsWith('gsk_') ? process.env.AI_API_KEY : '') ||
    (process.env.SILICONFLOW_API_KEY?.startsWith('gsk_') ? process.env.SILICONFLOW_API_KEY : '')
  );
  if (groqKey) {
    providers.push({
      id: 'groq',
      name: 'Groq Cloud LPU™',
      apiKey: groqKey,
      apiUrl: (process.env.GROQ_API_URL || 'https://api.groq.com/openai/v1/chat/completions').trim(),
      model: (process.env.GROQ_MODEL || 'qwen/qwen3.8-27b').trim(),
      isPrimary: true
    });
  }

  // 2. Respaldo: SiliconFlow Cloud GPU (si se agotan tokens o falla Groq)
  const rawSilicon = process.env.SILICONFLOW_API_KEY || (process.env.AI_API_KEY && !process.env.AI_API_KEY.startsWith('gsk_') && !process.env.AI_API_KEY.startsWith('sk-or-') ? process.env.AI_API_KEY : '');
  const siliconKey = cleanKey(rawSilicon && !rawSilicon.startsWith('gsk_') && !rawSilicon.startsWith('sk-or-') ? rawSilicon : '');
  if (siliconKey) {
    providers.push({
      id: 'siliconflow',
      name: 'SiliconFlow Cloud GPU',
      apiKey: siliconKey,
      apiUrl: (process.env.SILICONFLOW_API_URL || 'https://api.siliconflow.com/v1/chat/completions').trim(),
      model: (process.env.SILICONFLOW_MODEL || 'Qwen/Qwen2.5-7B-Instruct').trim(),
      isPrimary: providers.length === 0
    });
  }

  // 3. Respaldo Terciario: OpenRouter
  const rawOpenRouter = process.env.OPENROUTER_API_KEY || (process.env.AI_API_KEY?.startsWith('sk-or-') ? process.env.AI_API_KEY : '');
  const openRouterKey = cleanKey(rawOpenRouter);
  if (openRouterKey) {
    providers.push({
      id: 'openrouter',
      name: 'OpenRouter Free/Pro',
      apiKey: openRouterKey,
      apiUrl: (process.env.OPENROUTER_API_URL || 'https://openrouter.ai/api/v1/chat/completions').trim(),
      model: (process.env.OPENROUTER_MODEL || 'openrouter/free').trim(),
      isPrimary: providers.length === 0
    });
  }

  return providers;
}

/**
 * Genera respuesta con Alidea Genesis AI™
 * Conmutación por error automática (Failover): Groq Cloud -> SiliconFlow -> OpenRouter -> Ollama Local
 */
async function generateLocalAIResponse({ 
  sessionId, 
  prompt, 
  systemPrompt, 
  conversationHistory = [], 
  availableTags = [],
  currentTag = null,
  endpoint = null, 
  temperature = 0.35, 
  allowGreeting = true 
}) {
  return runWithSessionLock(sessionId, async () => {
    // Default business context if none provided
    const businessContext = (systemPrompt && systemPrompt.trim()) 
      ? systemPrompt.trim()
      : 'Somos un negocio enfocado en brindar la mejor atención a nuestros clientes.';

    const greetingRule = allowGreeting
      ? '1. SALUDO INICIAL: Puedes iniciar con un saludo breve y cordial (ej: "¡Hola! Con mucho gusto...", "¡Hola! Claro que sí...").'
      : '1. SIN SALUDOS REPETITIVOS: Ya estás conversando con este cliente en el hilo de chat actual. NO saludes con "¡Hola!" ni bienvenidas repetitivas; responde DIRECTAMENTE a su pregunta manteniendo el hilo.';

    const tagListStr = (Array.isArray(availableTags) && availableTags.length > 0)
      ? availableTags.map(t => typeof t === 'string' ? t.trim() : t.name.trim()).filter(Boolean).join(' | ')
      : 'Nuevo Contacto | Interesado | Catálogo Enviado | Cotización Pendiente | Cliente Caliente | Cerrado / Ganado';

    const systemInstruction = `Eres Sofia, asesora comercial y ejecutiva de atención al cliente de la empresa.

INFORMACIÓN AUTORIZADA DE LA EMPRESA:
"""
${businessContext}
"""

ETIQUETAS COMERCIALES DISPONIBLES EN EL SISTEMA:
[ ${tagListStr} ]
${currentTag ? `Etiqueta actual del cliente en CRM: "${currentTag}"` : ''}

REGLAS OBLIGATORIAS:
${greetingRule}
2. HABLA COMO HUMANA: Comunícate de tú a tú, con entusiasmo, amabilidad, persuasión comercial y emojis pertinentes (😊, 🙌, ✨, 📲, 💬).
3. CONTINUIDAD CONTEXTUAL: Ten en cuenta el contexto de los mensajes anteriores de la conversación para responder de manera coherente a lo que el cliente te viene preguntando.
4. PROHIBIDO ANÁLISIS METATEXTUAL: NUNCA digas "En el texto se menciona:", "Según la información provista:". Habla con naturalidad directa.
5. CERO ALUCINACIONES Y CERO PREGUNTAS AJENAS (ESTRICTO):
- Tu función exclusiva es atender y vender lo indicado en la INFORMACIÓN AUTORIZADA.
- NO eres un asistente de conocimientos generales, NO resuelves dudas de ciencia, tareas escolares, historia, geografía, recetas de cocina, chistes, poemas ni productos que la empresa no vende. Si el usuario pregunta algo fuera de lugar o no debes responder, coloca "should_answer": false.

FORMATO OBLIGATORIO DE RESPUESTA:
Debes responder SIEMPRE con un objeto JSON válido con la siguiente estructura exacta (sin texto extra antes ni después):
{
  "should_answer": true,
  "messages": [
    "Texto del primer mensaje de respuesta...",
    "Texto del segundo mensaje opcional si es necesario..."
  ],
  "assigned_tag": "Nombre_De_La_Etiqueta_Adecuada"
}

REGLAS PARA "assigned_tag":
- Selecciona una de las ETIQUETAS COMERCIALES DISPONIBLES según el estado de la conversación.
- Si el cliente solo saluda o hace una consulta inicial, asigna la etiqueta de contacto/interés inicial.
- Si pide catálogo, productos o cotización de precios, asigna la etiqueta de catálogo/cotización.
- Si confirma pedido, pago o desea cerrar la compra, asigna la etiqueta de cierre/ganado.
- Si no debes responder por ser una pregunta fuera de lugar:
{
  "should_answer": false,
  "messages": [],
  "assigned_tag": null
}`;

    try {
      // Assemble chat messages with system prompt, recent history context, and current user prompt
      const messagesPayload = [
        { role: 'system', content: systemInstruction }
      ];

      // Add up to last 10 turns (5 user questions + 5 assistant replies)
      if (Array.isArray(conversationHistory) && conversationHistory.length > 0) {
        const historySlice = conversationHistory.slice(-10);
        for (const item of historySlice) {
          if (item && item.content && typeof item.content === 'string') {
            const cleanContent = item.content.trim();
            if (cleanContent && !cleanContent.startsWith('[') && !cleanContent.startsWith('🛡️')) {
              messagesPayload.push({
                role: item.role === 'assistant' ? 'assistant' : 'user',
                content: cleanContent
              });
            }
          }
        }
      }

      // Add current user prompt
      if (prompt && typeof prompt === 'string' && prompt.trim()) {
        messagesPayload.push({
          role: 'user',
          content: prompt.trim()
        });
      }

      let rawOutput = '';
      let tokensUsed = 0;
      let usageDetails = null;
      let engineName = 'Alidea Genesis AI™';
      let providerSuccess = false;

      const activeProviders = getActiveProviders();

      // =========================================================================
      // MOTOR MULTI-PROVEEDOR: Intentar en orden de prioridad con Failover automático
      // =========================================================================
      if (activeProviders.length > 0) {
        for (let idx = 0; idx < activeProviders.length; idx++) {
          const prov = activeProviders[idx];
          const isLast = idx === activeProviders.length - 1;
          const nextProv = !isLast ? activeProviders[idx + 1] : null;

          try {
            console.log(`[Alidea AI Engine] Enviando solicitud a ${prov.name} (Modelo: ${prov.model})...`);
            const controller = new AbortController();
            const timeoutId = setTimeout(() => controller.abort(), 45000); // 45s timeout

            const response = await fetch(prov.apiUrl, {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${prov.apiKey}`,
                'HTTP-Referer': 'https://alidea.com',
                'X-Title': 'Alidea Platform'
              },
              signal: controller.signal,
              body: JSON.stringify({
                model: prov.model,
                messages: messagesPayload,
                temperature: typeof temperature === 'number' ? temperature : 0.35,
                max_tokens: 600,
                stream: false
              })
            });

            clearTimeout(timeoutId);

            if (!response.ok) {
              const errText = await response.text();
              console.warn(`[Alidea AI Failover] ⚠️ ${prov.name} respondió con código HTTP ${response.status}: ${errText.slice(0, 150)}`);
              
              if (nextProv) {
                console.log(`[Alidea AI Failover] 🔄 Conmutando automáticamente a proveedor de respaldo: ${nextProv.name} (Modelo: ${nextProv.model})...`);
              }
              continue; // Probar siguiente proveedor
            }

            const data = await response.json();
            rawOutput = (data.choices?.[0]?.message?.content || '').trim();
            tokensUsed = data.usage?.total_tokens || 0;
            usageDetails = data.usage || null;
            engineName = `${prov.name} (${prov.model})`;
            providerSuccess = true;
            console.log(`[Alidea AI Engine] ✓ Respuesta generada exitosamente vía ${prov.name} (${tokensUsed} tokens)`);
            break; // Éxito: salir del bucle de proveedores

          } catch (provErr) {
            console.warn(`[Alidea AI Failover] ⚠️ Error de red en ${prov.name}: ${provErr.message}`);
            if (nextProv) {
              console.log(`[Alidea AI Failover] 🔄 Conmutando automáticamente a proveedor de respaldo: ${nextProv.name}...`);
            }
          }
        }
      }

      // =========================================================================
      // FALLBACK LOCAL: Ollama Local (Desarrollo / Si ningún proveedor cloud responde)
      // =========================================================================
      if (!providerSuccess) {
        let cleanEndpoint = endpoint ? endpoint.replace(/\/$/, '') : (process.env.AI_ENDPOINT || 'http://127.0.0.1:11434');
        if (cleanEndpoint.includes('localhost')) {
          cleanEndpoint = cleanEndpoint.replace('localhost', '127.0.0.1');
        }

        console.log(`[Alidea AI Engine] Intentando motor local en ${cleanEndpoint}...`);
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 60000);

        const response = await fetch(`${cleanEndpoint}/api/chat`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          signal: controller.signal,
          body: JSON.stringify({
            model: 'qwen2.5:7b',
            keep_alive: '24h',
            messages: messagesPayload,
            stream: false,
            options: {
              temperature: typeof temperature === 'number' ? temperature : 0.35,
              repeat_penalty: 1.15,
              num_ctx: 1536,
              num_predict: 600
            }
          })
        });

        clearTimeout(timeoutId);

        if (!response.ok) {
          const errText = await response.text();
          throw new Error(`Ningún proveedor de IA disponible. Local Ollama: ${response.status} ${errText}`);
        }

        const data = await response.json();
        rawOutput = (data.message?.content || data.response || '').trim();
        tokensUsed = (data.prompt_eval_count || 0) + (data.eval_count || 0);
        engineName = 'Ollama Local (qwen2.5:7b)';
      }

      // =========================================================================
      // PARSEO ROBUSTO DE SALIDA JSON (Separación de Mensajes y Etiqueta)
      // =========================================================================
      let assignedTag = null;
      let shouldAnswer = true;
      let finalMessages = [];

      let parsedJson = null;
      try {
        parsedJson = JSON.parse(rawOutput);
      } catch (e) {
        const jsonMatch = rawOutput.match(/\{[\s\S]*\}/);
        if (jsonMatch) {
          try {
            parsedJson = JSON.parse(jsonMatch[0]);
          } catch(e2) {}
        }
      }

      if (parsedJson && typeof parsedJson === 'object') {
        shouldAnswer = parsedJson.should_answer !== false;
        assignedTag = parsedJson.assigned_tag ? String(parsedJson.assigned_tag).trim() : null;

        if (Array.isArray(parsedJson.messages)) {
          finalMessages = parsedJson.messages.map(m => String(m).trim()).filter(Boolean);
        } else if (parsedJson.message && typeof parsedJson.message === 'string') {
          finalMessages = [parsedJson.message.trim()];
        }
      } else {
        const lowerOut = rawOutput.toLowerCase();
        const isRefusal = !rawOutput || 
          lowerOut.includes('no_answer_safe_transfer') ||
          lowerOut.includes('no voy a responder') ||
          lowerOut.includes('no puedo responder a esa consulta') ||
          lowerOut.includes('no tengo información sobre') ||
          lowerOut.includes('no tengo informacion sobre') ||
          lowerOut.includes('no cuento con información') ||
          lowerOut.includes('no cuento con informacion') ||
          lowerOut.includes('no está en la información autorizada') ||
          lowerOut.includes('no esta en la informacion autorizada');

        if (isRefusal) {
          shouldAnswer = false;
        } else {
          let cleanText = rawOutput
            .replace(/```json[\s\S]*?```/gi, '')
            .replace(/^\{[\s\S]*?\}$/gm, '')
            .trim();
          if (!cleanText) cleanText = rawOutput;

          let parts = [];
          if (cleanText.includes('[MSG_SPLIT]')) {
            parts = cleanText.split('[MSG_SPLIT]').map(p => p.trim()).filter(Boolean);
          } else if (cleanText.includes('\n\n') && cleanText.length > 120) {
            const splitByParagraph = cleanText.split(/\n\s*\n/).map(p => p.trim()).filter(Boolean);
            if (splitByParagraph.length >= 2) {
              parts = [splitByParagraph[0], splitByParagraph.slice(1).join('\n\n')];
            } else {
              parts = [cleanText];
            }
          } else {
            parts = [cleanText];
          }
          finalMessages = parts.slice(0, 2);
        }
      }

      // Sanitizar mensajes para evitar cualquier fuga de JSON o etiquetas hacia el chat de WhatsApp
      finalMessages = finalMessages
        .map(m => {
          let s = m.replace(/^\s*\{\s*"should_answer"[\s\S]*?\}\s*$/, '').trim();
          s = s.replace(/"messages"\s*:\s*\[/g, '').replace(/"assigned_tag"\s*:\s*"[^"]*"/g, '').trim();
          return s;
        })
        .filter(m => m && !m.startsWith('{') && !m.endsWith('}') && !m.includes('assigned_tag'));

      if (finalMessages.length === 0 && shouldAnswer && parsedJson?.messages?.length > 0) {
        finalMessages = parsedJson.messages.map(m => String(m).trim()).filter(Boolean);
      }

      if (!shouldAnswer || finalMessages.length === 0) {
        return {
          success: true,
          shouldAnswer: false,
          reason: 'safe_transfer_to_human',
          messages: [],
          assignedTag: null,
          rawText: rawOutput,
          totalTokens: tokensUsed,
          usage: usageDetails
        };
      }

      return {
        success: true,
        shouldAnswer: true,
        messages: finalMessages.slice(0, 2),
        assignedTag: assignedTag,
        rawText: rawOutput,
        totalTokens: tokensUsed,
        usage: usageDetails,
        engine: engineName
      };
    } catch (err) {
      console.error('[Alidea AI Engine Error]:', err.message);
      return {
        success: false,
        shouldAnswer: false,
        error: err.message
      };
    }
  });
}

async function checkLocalAIStatus(endpoint = null) {
  const activeProviders = getActiveProviders();

  if (activeProviders.length > 0) {
    const primary = activeProviders[0];
    const fallbacks = activeProviders.slice(1).map(p => p.name).join(', ');
    return {
      connected: true,
      provider: primary.name,
      model: primary.model,
      fallback: fallbacks || 'Ninguno (Directo)',
      message: `Alidea Genesis AI™ [Principal: ${primary.name}] ${fallbacks ? `[Respaldo: ${fallbacks}]` : ''} activo y listo`
    };
  }

  const cleanEndpoint = endpoint ? endpoint.replace(/\/$/, '') : (process.env.AI_ENDPOINT || 'http://127.0.0.1:11434');
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 3500);

    const res = await fetch(`${cleanEndpoint}/api/tags`, { signal: controller.signal });
    clearTimeout(timeoutId);

    if (!res.ok) return { connected: false, message: 'Alidea AI Service fuera de línea' };
    return {
      connected: true,
      provider: 'Ollama Local',
      message: 'Alidea Genesis AI™ activo y listo'
    };
  } catch (e) {
    return { connected: false, message: 'Alidea AI Service no disponible' };
  }
}

module.exports = {
  generateLocalAIResponse,
  checkLocalAIStatus,
  getActiveProviders
};
