$content = Get-Content -Raw -Encoding utf8 "C:\Users\Salazar\Music\INTEGRADORrepoCOMPARTIDO\plantilla_temp\word\document.xml"
$plain = $content -replace '<[^>]+>', ''
Write-Output "Has FECFHA: $($plain.Contains('FECFHA'))"
Write-Output "Has FECHA: $($plain.Contains('FECHA'))"
Write-Output "Has FIRMA: $($plain.Contains('FIRMA'))"
Write-Output "Has TESTIGO: $($plain.Contains('TESTIGO'))"
# Let's print all words matching 'FECFHA' or 'FECHA' or 'FIRMA' or 'TESTIGO'
$words = [regex]::Matches($plain, '\b\w*(FECHA|FECFHA|FIRMA|TESTIGO)\w*\b', 'IgnoreCase') | ForEach-Object { $_.Value } | Sort-Object -Unique
Write-Output "Matches:"
$words
