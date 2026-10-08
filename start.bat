@echo off
title Alidea - Plataforma de Automatizacion WhatsApp y CRM
color 0B
echo ========================================================
echo        ALIDEA - Plataforma de Automatizacion
echo        WhatsApp Bot Inteligente + CRM de Clientes
echo ========================================================
echo.

set PATH=%LOCALAPPDATA%\Programs\nodejs;%PATH%
set NODE_TLS_REJECT_UNAUTHORIZED=0

echo [1/2] Iniciando Servidor Backend (API, Base de Datos, Baileys)...
start "Alidea Backend" cmd /k "set PATH=%LOCALAPPDATA%\Programs\nodejs;%%PATH%% && cd /d "%~dp0backend" && npm start"

timeout /t 3 /nobreak >nul

echo [2/2] Iniciando Frontend de Alidea (Vite + React)...
start "Alidea Frontend" cmd /k "set PATH=%LOCALAPPDATA%\Programs\nodejs;%%PATH%% && cd /d "%~dp0frontend" && npm run dev"

echo.
echo Todo listo! Puedes acceder en tu navegador a:
echo  - Aplicacion Web: http://localhost:5173
echo  - Servidor API:   http://localhost:3000
echo  - Clave de Administrador: 2732
echo.
pause
