$files = Get-ChildItem -Path "pages\*.html"
$fontLink = "<link href=`"https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=Outfit:wght@500;600;700;800&display=swap`" rel=`"stylesheet`">`r`n</head>"
$chartJs = "<script src=`"https://cdn.jsdelivr.net/npm/chart.js`"></script>`r`n</body>"

foreach ($f in $files) {
    $c = Get-Content $f.FullName -Raw
    if ($c -notmatch "fonts\.googleapis") {
        $c = $c -replace "</head>", $fontLink
    }
    if ($c -notmatch "chart\.js") {
        $c = $c -replace "</body>", $chartJs
    }
    [IO.File]::WriteAllText($f.FullName, $c, [System.Text.Encoding]::UTF8)
}

# Also do it for index.html if necessary, though it just redirects
$index = "index.html"
if (Test-Path $index) {
    $c = Get-Content $index -Raw
    if ($c -notmatch "fonts\.googleapis") {
        $c = $c -replace "</head>", $fontLink
    }
    [IO.File]::WriteAllText($index, $c, [System.Text.Encoding]::UTF8)
}

Write-Output "Dependencies injected."
