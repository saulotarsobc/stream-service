# Defina o caminho do arquivo de entrada e saída
$inputFile = "aulas/original/js/0001.mp4"
$outputDir = "aulas/js/0001/"

# Crie o diretório de saída, se não existir
if (!(Test-Path -Path $outputDir)) {
    New-Item -ItemType Directory -Path $outputDir
}

# Comando FFmpeg para gerar HLS em múltiplas resoluções
ffmpeg -i $inputFile `
-vf "scale=426:240" -c:v libx264 -preset veryfast -crf 23 -c:a aac -b:a 96k -hls_time 6 -hls_playlist_type vod -hls_segment_filename "$outputDir/240p_%03d.ts" "$outputDir/240p.m3u8" `
-vf "scale=640:360" -c:v libx264 -preset veryfast -crf 23 -c:a aac -b:a 128k -hls_time 6 -hls_playlist_type vod -hls_segment_filename "$outputDir/360p_%03d.ts" "$outputDir/360p.m3u8" `
-vf "scale=854:480" -c:v libx264 -preset veryfast -crf 23 -c:a aac -b:a 160k -hls_time 6 -hls_playlist_type vod -hls_segment_filename "$outputDir/480p_%03d.ts" "$outputDir/480p.m3u8" `
-vf "scale=1920:1080" -c:v libx264 -preset veryfast -crf 23 -c:a aac -b:a 192k -hls_time 6 -hls_playlist_type vod -hls_segment_filename "$outputDir/1080p_%03d.ts" "$outputDir/1080p.m3u8"

# Criar playlist mestre
$masterPlaylist = @"
#EXTM3U
#EXT-X-STREAM-INF:BANDWIDTH=400000,RESOLUTION=426x240
240p.m3u8
#EXT-X-STREAM-INF:BANDWIDTH=800000,RESOLUTION=640x360
360p.m3u8
#EXT-X-STREAM-INF:BANDWIDTH=1400000,RESOLUTION=854x480
480p.m3u8
#EXT-X-STREAM-INF:BANDWIDTH=4000000,RESOLUTION=1920x1080
1080p.m3u8
"@

Set-Content -Path "$outputDir/master.m3u8" -Value $masterPlaylist

Write-Host "Conversão para HLS concluída. Arquivos disponíveis na pasta $outputDir."
