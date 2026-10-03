@echo off
:: Change directory to the root where this batch file is located
cd /d "%~dp0"

echo ==============================================================
echo   DecorAI Production Launcher (Super Fast Mode)
echo ==============================================================
echo   Configuring current directory to: %CD%
echo   Launching optimized production servers...
echo ==============================================================

:: Execute npm start using cmd execution to bypass PowerShell restrictions
call npm.cmd start

if %ERRORLEVEL% neq 0 (
    echo.
    echo [ERROR] The production servers failed to start.
    echo Please make sure you ran 'npm run build' first.
    echo.
    pause
)
