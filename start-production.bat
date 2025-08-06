@echo off
echo Building and starting the Content Management System...
call npm run build
if %ERRORLEVEL% NEQ 0 (
  echo Build failed with error code %ERRORLEVEL%
  exit /b %ERRORLEVEL%
)

echo Starting server on port 3000...
call npm start
