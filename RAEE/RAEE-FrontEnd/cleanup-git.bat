@echo off
echo ========================================
echo LIMPIEZA DE ARCHIVOS RASTREADOS POR GIT
echo ========================================
echo.
echo Este script eliminara del indice de Git los archivos que
echo ya no deben ser rastreados segun el .gitignore actualizado
echo.
echo IMPORTANTE: Los archivos NO se borraran del disco,
echo solo dejaran de ser rastreados por Git.
echo.
pause

echo.
echo 1. Eliminando node_modules del indice de Git...
git rm -r --cached node_modules/ 2>nul
if %errorlevel% equ 0 (
    echo    ✓ node_modules eliminado del indice
) else (
    echo    - node_modules no estaba en el indice o ya fue eliminado
)

echo.
echo 2. Eliminando archivos .expo del indice de Git...
git rm -r --cached .expo/ 2>nul
if %errorlevel% equ 0 (
    echo    ✓ .expo eliminado del indice
) else (
    echo    - .expo no estaba en el indice o ya fue eliminado
)

git rm -r --cached .expo-shared/ 2>nul
if %errorlevel% equ 0 (
    echo    ✓ .expo-shared eliminado del indice
) else (
    echo    - .expo-shared no estaba en el indice o ya fue eliminado
)

echo.
echo 3. Eliminando otros archivos comunes del indice...
git rm --cached package-lock.json 2>nul
git rm --cached yarn.lock 2>nul
git rm --cached *.log 2>nul
git rm -r --cached .vscode/ 2>nul
git rm -r --cached .idea/ 2>nul

echo.
echo 4. Agregando cambios al staging area...
git add .gitignore
git add .

echo.
echo 5. Verificando el estado de Git...
git status

echo.
echo 6. Haciendo commit automaticamente...
git commit -m "Actualizar .gitignore y limpiar archivos no deseados"

echo.
echo ========================================
echo LIMPIEZA COMPLETADA
echo ========================================
echo.
echo El commit se ha realizado automaticamente.
echo.
echo Ahora puedes hacer push para subir los cambios:
echo   git push origin main
echo.
echo Los archivos de node_modules y .expo ya no seran
echo rastreados por Git ni subidos a GitHub.
echo.
echo Archivos que se agregaron al repositorio:
echo - Controladores del BackEnd
echo - Modelos del BackEnd  
echo - Nuevas pantallas del FrontEnd
echo - Archivos de configuracion actualizados
echo.
pause