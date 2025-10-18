@echo off
echo Limpiando cache de Metro y reiniciando el proyecto...
echo.

echo 1. Deteniendo cualquier proceso de Metro en ejecución...
taskkill /f /im node.exe 2>nul

echo 2. Limpiando cache de npm...
npm cache clean --force

echo 3. Eliminando node_modules y reinstalando dependencias...
if exist node_modules rmdir /s /q node_modules
npm install

echo 4. Limpiando cache de Metro...
npx expo start --clear --reset-cache

echo.
echo Cache limpiada y proyecto reiniciado!
pause