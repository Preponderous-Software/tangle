@echo off
setlocal
rem Plays Tangle, the strange-loops game, in its own window on this PC.
rem No GitHub or sign-in: it copies the current files from the folder in WSL (or runs the last
rem copy if WSL is not available), serves them on this PC only, and opens them in a Microsoft Edge
rem app window (no tabs or address bar, its own taskbar entry, its own profile so your progress
rem stays). Closing the game window stops everything.
rem Options:
rem   play-tangle.bat fullscreen   start full screen (F11 toggles it any time)
rem   play-tangle.bat new          forget progress and start over
rem   play-tangle.bat browser      open in your normal browser instead of an app window

set "TG_DIR=%USERPROFILE%\tangle-play"
if not defined TG_SRC set "TG_SRC=\\wsl$\Ubuntu\root\tangle"
set "TG_PROFILE=%LOCALAPPDATA%\Tangle\window"
if not defined TG_PORT set "TG_PORT=8786"
set "QUERY="
set "FULL="
set "BROWSER="
for %%a in (%*) do (
    if /i "%%~a"=="fullscreen" set "FULL=--start-fullscreen"
    if /i "%%~a"=="new" set "QUERY=?new=1"
    if /i "%%~a"=="browser" set "BROWSER=1"
)
set "URL=http://127.0.0.1:%TG_PORT%/%QUERY%"

where py >nul 2>nul || (
    echo Tangle needs Python 3 to serve its files. Installing it with winget ...
    winget install --id Python.Python.3.13 -e --accept-source-agreements --accept-package-agreements || (echo Install it from https://www.python.org/downloads/ & pause & exit /b 1)
    echo Python installed. Close this window and run the script again.
    pause
    exit /b 0
)

if exist "%TG_SRC%\index.html" (
    echo Copying the latest Tangle from WSL ...
    robocopy "%TG_SRC%" "%TG_DIR%" /MIR /XD .git node_modules shots /NFL /NDL /NJH /NJS /NP >nul
    if errorlevel 8 (echo Copying failed. & pause & exit /b 1)
) else (
    echo WSL is not available, using the last copy.
)
if not exist "%TG_DIR%\index.html" (echo No copy of Tangle yet. Start WSL and run this again. & pause & exit /b 1)

set "EDGE="
for %%e in ("%ProgramFiles(x86)%\Microsoft\Edge\Application\msedge.exe" "%ProgramFiles%\Microsoft\Edge\Application\msedge.exe") do (
    if not defined EDGE if exist "%%~e" set "EDGE=%%~e"
)
if defined BROWSER set "EDGE="

rem Start the server unless one is already running (the copy above is fresh and the server never
rem caches, so a running one serves the new files).
set "STARTED="
curl.exe -s -o NUL "http://127.0.0.1:%TG_PORT%/index.html"
if errorlevel 1 (
    start "Tangle server" /min py -3 "%TG_DIR%\tools\serve.py" "%TG_DIR%" %TG_PORT%
    set "STARTED=1"
    for /l %%i in (1,1,40) do (
        curl.exe -s -o NUL "http://127.0.0.1:%TG_PORT%/index.html" && goto :ready
        ping -n 1 -w 250 127.0.0.1 >nul
    )
    echo The game server did not start. & pause & exit /b 1
)
:ready

if defined TG_DRYRUN (
    echo DRYRUN url=%URL%
    curl.exe -s -o NUL -w "DRYRUN index %%{http_code} " "http://127.0.0.1:%TG_PORT%/index.html"
    curl.exe -s -o NUL -w "game.js %%{http_code} %%{content_type} " "http://127.0.0.1:%TG_PORT%/src/game.js"
    curl.exe -s -o NUL -w "wasm %%{http_code} %%{content_type}" "http://127.0.0.1:%TG_PORT%/engine/tangle-engine.wasm"
    echo.
    if defined EDGE (echo DRYRUN app="%EDGE%" --app=%URL% --user-data-dir="%TG_PROFILE%" %FULL%) else (echo DRYRUN browser=%URL%)
    goto :stop
)

if not defined EDGE (
    start "" "%URL%"
    echo Tangle is open in your browser. Close this window to stop the game's server.
    pause >nul
    goto :stop
)

rem Wait for the game window to close (its own profile makes it a separate process), then stop
rem the server this script started.
start "" /wait "%EDGE%" --app=%URL% --user-data-dir="%TG_PROFILE%" --window-size=1280,800 %FULL% --no-first-run --no-default-browser-check --disable-features=Translate

:stop
if defined STARTED taskkill /fi "WINDOWTITLE eq Tangle server*" /t /f >nul 2>nul
exit /b 0
