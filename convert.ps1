$curso = "big-buck-bunny"
$aula = "aula-2"
$inputFile = "./videos/$curso/$aula.avi"
$outputDir = "./temp/$curso/$aula"

# Remove all contents of $outputDir
Remove-Item -Path "${outputDir}/*" -Recurse -Force

# Verifica e cria o diretório de saída, se necessário
if (!(Test-Path -Path $outputDir)) {
    New-Item -ItemType Directory -Path $outputDir -Force
}

# Cria diretórios de resoluções
New-Item -ItemType Directory -Path "${outputDir}/low"
New-Item -ItemType Directory -Path "${outputDir}/medium"
New-Item -ItemType Directory -Path "${outputDir}/high"
New-Item -ItemType Directory -Path "${outputDir}/full"

# Comando ffmpeg para múltiplas resoluções
ffmpeg -i $inputFile `
-vf "scale=w=426:h=360:force_original_aspect_ratio=decrease" `
-c:v libx264 -preset veryfast -crf 23 -c:a aac -b:a 96k -hls_time 6 -hls_list_size 5 -hls_playlist_type vod `
-hls_segment_filename "${outputDir}/low/%03d.ts" "${outputDir}/low/master.m3u8"

ffmpeg -i $inputFile `
-vf "scale=w=640:h=480:force_original_aspect_ratio=decrease" `
-c:v libx264 -preset veryfast -crf 23 -c:a aac -b:a 128k -hls_time 6 -hls_list_size 5 -hls_playlist_type vod `
-hls_segment_filename "${outputDir}/medium/%03d.ts" "${outputDir}/medium/master.m3u8"

ffmpeg -i $inputFile `
-vf "scale=w=854:h=720:force_original_aspect_ratio=decrease" `
-c:v libx264 -preset veryfast -crf 23 -c:a aac -b:a 160k -hls_time 6 -hls_list_size 5 -hls_playlist_type vod `
-hls_segment_filename "${outputDir}/high/%03d.ts" "${outputDir}/high/master.m3u8"

ffmpeg -i $inputFile `
-vf "scale=w=1920:h=1080:force_original_aspect_ratio=decrease" `
-c:v libx264 -preset veryfast -crf 23 -c:a aac -b:a 192k -hls_time 6 -hls_list_size 5 -hls_playlist_type vod `
-hls_segment_filename "${outputDir}/full/%03d.ts" "${outputDir}/full/master.m3u8"

# Criação do master playlist
$masterPlaylist = @"
#EXTM3U
#EXT-X-STREAM-INF:BANDWIDTH=400000,RESOLUTION=426x360
http://127.0.0.1:3000/stream/$curso/$aula/low/
#EXT-X-STREAM-INF:BANDWIDTH=800000,RESOLUTION=640x480
http://127.0.0.1:3000/stream/$curso/$aula/medium/
#EXT-X-STREAM-INF:BANDWIDTH=1400000,RESOLUTION=854x720
http://127.0.0.1:3000/stream/$curso/$aula/high/
#EXT-X-STREAM-INF:BANDWIDTH=4000000,RESOLUTION=1920x1080
http://127.0.0.1:3000/stream/$curso/$aula/full/
"@

Set-Content -Path "${outputDir}/master.m3u8" -Value $masterPlaylist

Write-Host "Conversão para HLS concluída. Arquivos disponíveis na pasta $outputDir."
