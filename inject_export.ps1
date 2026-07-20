$files = Get-ChildItem -Path "pages\*.html"
foreach ($f in $files) {
    $c = Get-Content $f.FullName -Raw
    $c = $c -replace '<button class="btn-accent" onclick="abrirModal', '<button class="btn-outline" style="margin-right:12px;" onclick="if(window.exportCurrentTable) window.exportCurrentTable()">⬇️ Exportar CSV</button><button class="btn-accent" onclick="abrirModal'
    [IO.File]::WriteAllText($f.FullName, $c, [System.Text.Encoding]::UTF8)
}
Write-Output "Export button injected."
