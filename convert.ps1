$inputFile = "./videos/big_buck_bunny/intro.avi"
$outputDir = "./temp/big_buck_bunny/intro"

if (!(Test-Path -Path $outputDir)) {
    New-Item -ItemType Directory -Path $outputDir
}

ffmpeg -i $inputFile `
-vf "scale=w=426:h=360:force_original_aspect_ratio=decrease,pad=426:360:(ow-iw)/2:(oh-ih)/2" -c:v libx264 -preset veryfast -crf 23 -c:a aac -b:a 96k -hls_time 6 -hls_playlist_type vod -hls_segment_filename "$outputDir/360p_%03d.ts" "$outputDir/360p.m3u8" `
-vf "scale=w=640:h=480:force_original_aspect_ratio=decrease" -c:v libx264 -preset veryfast -crf 23 -c:a aac -b:a 128k -hls_time 6 -hls_playlist_type vod -hls_segment_filename "$outputDir/480p_%03d.ts" "$outputDir/480p.m3u8" `
-vf "scale=w=854:h=720:force_original_aspect_ratio=decrease" -c:v libx264 -preset veryfast -crf 23 -c:a aac -b:a 160k -hls_time 6 -hls_playlist_type vod -hls_segment_filename "$outputDir/720p_%03d.ts" "$outputDir/720p.m3u8" `
-vf "scale=w=1920:h=1080:force_original_aspect_ratio=decrease" -c:v libx264 -preset veryfast -crf 23 -c:a aac -b:a 192k -hls_time 6 -hls_playlist_type vod -hls_segment_filename "$outputDir/1080p_%03d.ts" "$outputDir/1080p.m3u8"

$masterPlaylist = @"
#EXTM3U
#EXT-X-STREAM-INF:BANDWIDTH=400000,RESOLUTION=426x360
360p.m3u8
#EXT-X-STREAM-INF:BANDWIDTH=800000,RESOLUTION=640x480
480p.m3u8
#EXT-X-STREAM-INF:BANDWIDTH=1400000,RESOLUTION=854x720
720p.m3u8
#EXT-X-STREAM-INF:BANDWIDTH=4000000,RESOLUTION=1920x1080
1080p.m3u8
"@

Set-Content -Path "$outputDir/master.m3u8" -Value $masterPlaylist

Write-Host "Conversão para HLS concluída. Arquivos disponíveis na pasta $outputDir."
