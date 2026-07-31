@echo off
node "%~dp0.SYSTEMX\cli\systemx.mjs" sync %*
exit /b %ERRORLEVEL%
