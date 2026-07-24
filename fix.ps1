$content = Get-Content 'home-redesign.css' -Raw
$content = "body { background-color: #fff !important; }`n" + $content
$content = $content.Replace("max-width: 1400px;", "max-width: 100%; padding-left: 20px; padding-right: 20px;")
Set-Content 'home-redesign.css' $content -Encoding UTF8
