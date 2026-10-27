@echo off
setlocal
cd /d "%~dp0"
where py >nul 2>nul
if not errorlevel 1 (
    py -3 main.py
) else (
    where python >nul 2>nul
    if errorlevel 1 (
        echo Instala Python 3.11 o posterior desde https://www.python.org/downloads/
        echo Luego vuelve a ejecutar INICIAR.cmd.
        pause
        exit /b 1
    )
    python main.py
)
if errorlevel 1 pause
