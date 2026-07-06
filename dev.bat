@echo off
:: Change directory to the root where this batch file is located
cd /d "%~dp0"

echo ==============================================================
echo   DecorAI Development Launcher
echo ==============================================================
echo   Configuring current directory to: %CD%
echo   Bypassing execution policy to launch development servers...
echo ==============================================================

:: Execute npm using cmd execution to bypass PowerShell restrictions
call npm.cmd run dev

if %ERRORLEVEL% neq 0 (
    echo.
    echo [ERROR] The development servers failed to start.
    echo Please make sure you ran 'npm install' in this folder first.
    echo.
    pause
)
