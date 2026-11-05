# Publica este repositorio en GitHub.
# 1. Inicia sesion en github.com con la cuenta Vitahealth05.
# 2. Crea un repositorio publico y VACIO llamado vitahealth-sueno (sin README ni .gitignore).
# 3. Desde la carpeta del proyecto, ejecuta:
#    powershell -ExecutionPolicy Bypass -File herramientas\publicar-en-github.ps1

$url = "https://github.com/Vitahealth05/vitahealth-sueno.git"
if (git remote | Select-String -Quiet "origin") { git remote set-url origin $url } else { git remote add origin $url }
git push -u origin main develop feature/sueno-frontend
if ($LASTEXITCODE -eq 0) { Write-Host "Publicado en https://github.com/Vitahealth05/vitahealth-sueno" } else { Write-Host "No se pudo publicar. Revisa que el repositorio exista y que hayas iniciado sesion." }
