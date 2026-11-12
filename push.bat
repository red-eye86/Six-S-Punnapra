@echo off
setlocal enabledelayedexpansion
title Punnapra Sixes - Git Push

echo ===================================================
echo         PUNNAPRA SIXES - GITHUB PUSH SCRIPT
echo ===================================================
echo.

:: Ensure we are in the script's directory
cd /d "%~dp0"

:: 1. Check git status
echo [1/4] Checking repository status...
git status -s
echo.

:: Check if there are any changes to commit
git status --porcelain > "%TEMP%\git_status.txt"
set /p STATUS=<"%TEMP%\git_status.txt"
del "%TEMP%\git_status.txt" 2>nul

if "%STATUS%"=="" (
    echo No changes detected to commit!
    echo Checking if there are any unpushed commits...
    git log origin/main..HEAD --oneline 2>nul | findstr /r "^" >nul
    if errorlevel 1 (
        echo Everything is already up to date with GitHub!
        goto end
    ) else (
        echo Found unpushed commits. Proceeding to push...
        goto push_only
    )
)

:: 2. Prompt for commit message (optional)
echo [2/4] Preparing commit...
set "MSG="
set /p "MSG=Enter commit message (Press Enter for default 'Update website'): "
if "%MSG%"=="" set "MSG=Update website"

:: 3. Stage and commit
echo.
echo Staging all changes...
git add -A

echo Committing with message: "%MSG%"
git commit -m "%MSG%"
if errorlevel 1 (
    echo.
    echo [ERROR] Commit failed! Check above for details.
    goto end
)

:push_only
:: 4. Push to remote
echo.
echo [3/4] Pushing to GitHub (origin)...
git push origin HEAD
if errorlevel 1 (
    echo.
    echo [ERROR] Push failed!
    echo Please check your internet connection or git credentials.
    goto end
)

echo.
echo [4/4] =============================================
echo       SUCCESS: All changes pushed to GitHub!
echo ===================================================

:end
echo.
echo Press any key to exit...
pause >nul

