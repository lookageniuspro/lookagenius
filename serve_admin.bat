@echo off
echo Starting LookaGenius Local Server...
echo -----------------------------------
echo.

:: Try Python 3
where python >nul 2>nul
if %ERRORLEVEL% EQU 0 (
    echo [OK] Using Python to serve...
    start http://localhost:8000/admin/
    python -m http.server 8000
    goto end
)

:: Try py launcher
where py >nul 2>nul
if %ERRORLEVEL% EQU 0 (
    echo [OK] Using 'py' launcher to serve...
    start http://localhost:8000/admin/
    py -m http.server 8000
    goto end
)

:: Try npx (Node.js)
where npx >nul 2>nul
if %ERRORLEVEL% EQU 0 (
    echo [OK] Using 'npx http-server' to serve...
    start http://localhost:8080/admin/
    npx http-server ./
    goto end
)

echo [ERROR] No Python or Node.js found in your PATH.
echo Please install Python (python.org) or Node.js (nodejs.org) to run the CMS locally.
pause

:end
