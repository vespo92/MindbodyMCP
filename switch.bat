@echo off
echo === Mindbody MCP Runtime Switcher ===
echo.

if "%1"=="bun" goto switch_to_bun
if "%1"=="node" goto switch_to_node
if "%1"=="benchmark" goto run_benchmark
goto show_usage

:switch_to_bun
echo Switching to Bun...
copy package.bun.json package.json >nul 2>&1
echo ✅ Switched to Bun
echo.
echo Run 'bun install' to install dependencies
echo Then 'bun run dev' to start the server
goto end

:switch_to_node
echo Switching to Node.js...
copy package.node.json package.json >nul 2>&1
if not exist package.node.json (
    echo ⚠️  package.node.json not found. Using current package.json
) else (
    echo ✅ Switched to Node.js
)
echo.
echo Run 'npm install' to install dependencies
echo Then 'npm run build' and 'npm start' to run
goto end

:run_benchmark
echo Running performance comparison...
echo.
echo === Node.js Performance ===
call npm run benchmark
echo.
echo === Bun Performance ===
call bun run benchmark
goto end

:show_usage
echo Usage: switch.bat [command]
echo.
echo Commands:
echo   bun        - Switch to Bun runtime
echo   node       - Switch to Node.js runtime
echo   benchmark  - Compare performance between runtimes
echo.
echo Current package.json is configured for: 
findstr /C:"tsx" package.json >nul 2>&1
if %errorlevel%==0 (
    echo Node.js
) else (
    echo Bun
)

:end
