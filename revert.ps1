$content = Get-Content 'home-redesign.css' -Raw
$parts = $content -split '/\* ==========================================================================\r?\n\s*FULL SCREEN LAYOUT & HEADER ENHANCEMENTS'
if ($parts.Length -gt 1) {
    Set-Content 'home-redesign.css' $parts[0].TrimEnd() -Encoding UTF8
    Write-Output "Reverted successfully."
} else {
    Write-Output "Marker not found."
}
