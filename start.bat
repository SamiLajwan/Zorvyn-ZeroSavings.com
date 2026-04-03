@echo off
echo ============================================
echo  Finance Dashboard - Startup Script
echo ============================================

echo.
echo [1/2] Starting Spring Boot backend...
start "Finance Backend" powershell -NoExit -Command "$env:JAVA_HOME = 'C:\Program Files\Java\jdk-25'; Set-Location '%~dp0backend'; & 'D:\maven\apache-maven-3.9.6\bin\mvn.cmd' spring-boot:run"

echo Waiting for backend to start (15s)...
timeout /t 15 /nobreak >nul

echo.
echo [2/2] Starting React frontend...
start "Finance Frontend" cmd /k "cd /d %~dp0frontend && npm start"

echo.
echo ============================================
echo  Backend:  http://localhost:8080
echo  Frontend: http://localhost:3000
echo  H2 Console: http://localhost:8080/h2-console
echo ============================================
