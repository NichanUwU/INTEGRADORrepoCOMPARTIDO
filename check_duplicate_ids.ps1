$htmlFiles = Get-ChildItem -Path "C:\Users\Salazar\Music\INTEGRADORrepoCOMPARTIDO\pages\*.html"
foreach ($file in $htmlFiles) {
    $content = Get-Content -Path $file.FullName -Raw
    # Find all id="..." occurrences
    $ids = [regex]::Matches($content, 'id="([^"]+)"') | ForEach-Object { $_.Groups[1].Value }
    $duplicates = $ids | Group-Object | Where-Object { $_.Count -gt 1 }
    if ($duplicates) {
        Write-Output "File: $($file.Name)"
        foreach ($dup in $duplicates) {
            Write-Output "  Duplicate ID: '$($dup.Name)' (found $($dup.Count) times)"
        }
    }
}
