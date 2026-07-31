@echo off
node "%~dp0.SYSTEMX\cli\systemx.mjs" menu %*
exit /b %ERRORLEVEL%
