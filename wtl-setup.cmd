@echo off
node "%~dp0.SYSTEMX\cli\systemx.mjs" setup %*
exit /b %ERRORLEVEL%
