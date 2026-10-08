const FIXED_ENGINE_MODEL = 'qwen2.5:7b';
const sessionQueues = new Map();

// Helper to limit concurrent requests per session to guarantee complete isolation
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
 * Genera respuesta con Alidea Genesis AI™ (Motor Qwen 2.5 7B)
 * Implementa auto-evaluación previa contra alucinaciones y división natural en 1 o 2 mensajes humanos.
 */
async function generateLocalAIResponse({ sessionId, prompt, systemPrompt, conversationHistory = [], endpoint = 'http://127.0.0.1:11434', temperature = 0.35, allowGreeting = true }) {
  return runWithSessionLock(sessionId, async () => {
    let cleanEndpoint = endpoint ? endpoint.replace(/\/$/, '') : 'http://127.0.0.1:11434';
    if (cleanEndpoint.includes('localhost')) {
      cleanEndpoint = cleanEndpoint.replace('localhost', '127.0.0.1');
    }
    
    // Default business context if none provided
    const businessContext = (systemPrompt && systemPrompt.trim()) 
      ? systemPrompt.trim()
      : 'Somos un negocio enfocado en brindar la mejor atención a nuestros clientes.';

    const greetingRule = allowGreeting
      ? '1. SALUDO INICIAL: Puedes iniciar con un saludo breve y cordial (ej: "¡Hola! Con mucho gusto...", "¡Hola! Claro que sí...").'
      : '1. SIN SALUDOS REPETITIVOS: Ya estás conversando con este cliente en el hilo de chat actual. NO saludes con "¡Hola!" ni bienvenidas repetitivas; responde DIRECTAMENTE a su pregunta manteniendo el hilo.';

    const systemInstruction = `Eres Sofia, asesora comercial y ejecutiva de atención al cliente de la empresa.

INFORMACIÓN AUTORIZADA DE LA EMPRESA:
"""
${businessContext}
"""

REGLAS OBLIGATORIAS:
${greetingRule}
2. HABLA COMO HUMANA: Comunícate de tú a tú, con entusiasmo, amabilidad, persuasión comercial y emojis pertinentes (😊, 🙌, ✨, 📲, 💬).
3. CONTINUIDAD CONTEXTUAL: Ten en cuenta el contexto de los mensajes anteriores de la conversación para responder de manera coherente a lo que el cliente te viene preguntando.
4. PROHIBIDO ANÁLISIS METATEXTUAL: NUNCA digas "En el texto se menciona:", "Según la información provista:", "1. Introducción". Habla con naturalidad directa.
5. RESPUESTAS COMPLETAS: Completa SIEMPRE todas las oraciones, listas o explicaciones. NUNCA cortes las respuestas a la mitad.
6. CERO ALUCINACIONES Y CERO PREGUNTAS AJENAS (ESTRICTO):
- Tu función exclusiva es atender y vender lo indicado en la INFORMACIÓN AUTORIZADA.
- NO eres un asistente de conocimientos generales, NO resuelves dudas de ciencia (ej: astronomía, distancia de la Tierra a la Luna), tareas escolares, historia, geografía, recetas de cocina, chistes, poemas, política ni productos que la empresa no vende.
- Si el usuario pregunta o solicita CUALQUIER COSA fuera de la INFORMACIÓN AUTORIZADA, responde ÚNICAMENTE:
[NO_ANSWER_SAFE_TRANSFER]

EJEMPLOS DE DERIVACIÓN:
Usuario: ¿Cuál es la distancia de la Tierra a la Luna?
Asistente: [NO_ANSWER_SAFE_TRANSFER]

Usuario: Dame una receta de cocina / Cuéntame un chiste
Asistente: [NO_ANSWER_SAFE_TRANSFER]

Usuario: ¿Quién ganó la copa mundial?
Asistente: [NO_ANSWER_SAFE_TRANSFER]

7. FORMATO: Responde en 1 o máximo 2 párrafos concisos ideales para WhatsApp. Si deseas enviar 2 mensajes sucesivos, sepáralos con [MSG_SPLIT].`;

    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 120000); // 120s timeout

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

      // Add current message
      messagesPayload.push({ role: 'user', content: prompt });

      const response = await fetch(`${cleanEndpoint}/api/chat`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        signal: controller.signal,
        body: JSON.stringify({
          model: FIXED_ENGINE_MODEL,
          keep_alive: '24h',
          messages: messagesPayload,
          stream: false,
          options: {
            temperature: typeof temperature === 'number' ? temperature : 0.35,
            repeat_penalty: 1.15,
            num_ctx: 1536,
            num_predict: 500
          }
        })
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        const errText = await response.text();
        throw new Error(`Alidea AI Service respondió: ${response.status} ${errText}`);
      }

      const data = await response.json();
      const rawOutput = (data.message?.content || data.response || '').trim();

      // Guardrail Check: Safe transfer if model indicates lack of certainty or refusal
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
        return {
          success: true,
          shouldAnswer: false,
          reason: 'safe_transfer_to_human',
          messages: [],
          rawText: ''
        };
      }

      // Format 1 or 2 messages cleanly
      let parts = [];
      if (rawOutput.includes('[MSG_SPLIT]')) {
        parts = rawOutput.split('[MSG_SPLIT]').map(p => p.trim()).filter(Boolean);
      } else if (rawOutput.includes('\n\n') && rawOutput.length > 120) {
        const splitByParagraph = rawOutput.split(/\n\s*\n/).map(p => p.trim()).filter(Boolean);
        if (splitByParagraph.length >= 2) {
          parts = [splitByParagraph[0], splitByParagraph.slice(1).join('\n\n')];
        } else {
          parts = [rawOutput];
        }
      } else {
        parts = [rawOutput];
      }

      // Limit to maximum 2 messages
      const finalMessages = parts.slice(0, 2);

      return {
        success: true,
        shouldAnswer: true,
        messages: finalMessages,
        rawText: rawOutput,
        engine: 'Alidea Genesis AI™'
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

async function checkLocalAIStatus(endpoint = 'http://localhost:11434') {
  const cleanEndpoint = endpoint ? endpoint.replace(/\/$/, '') : 'http://localhost:11434';
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 3500);

    const res = await fetch(`${cleanEndpoint}/api/tags`, { signal: controller.signal });
    clearTimeout(timeoutId);

    if (!res.ok) return { connected: false, message: 'Alidea AI Service fuera de línea' };
    return {
      connected: true,
      message: 'Alidea Genesis AI™ activo y listo'
    };
  } catch (e) {
    return { connected: false, message: 'Alidea AI Service no disponible en el puerto local' };
  }
}

module.exports = {
  generateLocalAIResponse,
  checkLocalAIStatus
};

