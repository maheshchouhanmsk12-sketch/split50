@echo off
echo ==============================================
echo   Push Split50 to GitHub for Codemagic
echo ==============================================
echo.
set /p REPO_URL="Enter your GitHub Repository URL (e.g. https://github.com/maheshchouhanmsk12-sketch/split50.git): "
if "%REPO_URL%"=="" goto error

git remote remove origin 2>nul
git remote add origin %REPO_URL%
git branch -M main
echo.
echo Pushing to GitHub...
git push -u origin main
if %errorlevel% equ 0 (
    echo.
    echo [SUCCESS] Code pushed successfully!
    echo Now open https://codemagic.io and start the build.
) else (
    echo.
    echo [ERROR] Git push failed. Please verify repository URL and your credentials.
)
pause
exit /b

:error
echo [ERROR] No URL entered.
pause
