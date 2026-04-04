@echo off
echo Iniciando Backend y Frontend de WSP1...

start cmd /k "cd backend && npm start"
start cmd /k "cd frontend && npm run dev"

echo Servicios iniciados en ventanas separadas.
