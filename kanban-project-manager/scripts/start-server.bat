@echo off
setlocal enabledelayedexpansion

if exist .env (
  for /f "usebackq tokens=1,* delims==" %%A in (".env") do (
    set "%%A=%%B"
  )
)

if "%PORT%"=="" set PORT=3001

docker compose up -d --build

echo Backend starting on http://localhost:%PORT%
endlocal
