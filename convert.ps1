$caminhoDoArquivo = "./videos/big-buck-bunny/aula-1.avi"
$destino = "./temp"
$slugDoCurso = "big-buck-bunny"
$slugDaAula = "aula-1"

# Deletar destino
if (Test-Path -Path $destino) {
    Remove-Item -Path $destino -Recurse -Force
}

# Criar destino
New-Item -Path $destino -ItemType Directory

if (-not (Get-Command ffmpeg -ErrorAction SilentlyContinue)) {
    Write-Host "ffmpeg não encontrado. Por favor, instale-o ou adicione-o ao PATH do sistema." -ForegroundColor Red
    exit
}

function Invoke-Converter-ParaHLS {
    param (
        [string]$resolucao,
        [string]$prefixo,
        [string]$bitrate
    )

    $dimensao = $resolucao.Split(":")
    $largura = $dimensao[0]
    $altura = $dimensao[1]

    ffmpeg -i $caminhoDoArquivo -vf "scale=w=${largura}:h=${altura}:force_original_aspect_ratio=decrease" `
        -c:v libx264 -preset veryfast -crf 23 -c:a aac -b:a $bitrate -hls_time 6 -hls_playlist_type vod `
        -hls_segment_filename "${destino}/${slugDoCurso}-${slugDaAula}-${prefixo}-%03d.ts" -f hls "${destino}/${slugDoCurso}-${slugDaAula}-${prefixo}.m3u8"

        if ($?) {
        Write-Host "Conversão para $prefixo realizada com sucesso!" -ForegroundColor Green
    } else {
        Write-Host "Erro ao executar o ffmpeg para $prefixo" -ForegroundColor Red
    }

    return @{ prefixo = $prefixo; resolucao = "${largura}x${altura}"; bandwidth = $bitrate }
}

if (-not (Test-Path $caminhoDoArquivo)) {
    Write-Host "Arquivo de vídeo não encontrado: $caminhoDoArquivo" -ForegroundColor Red
    exit
}

$resolucoes = @(
    @{resolucao="426:360"; prefixo="low"; bitrate="96k"}
    # @{resolucao="640:480"; prefixo="medium"; bitrate="128k"},
    # @{resolucao="854:720"; prefixo="high"; bitrate="160k"},
    # @{resolucao="1920:1080"; prefixo="full"; bitrate="192k"}
)

$streamInfo = @()
foreach ($resolucao in $resolucoes) {
    $streamInfo += Invoke-Converter-ParaHLS -resolucao $resolucao.resolucao -prefixo $resolucao.prefixo -bitrate $resolucao.bitrate
}

$masterPlaylist = "#EXTM3U`n"

foreach ($stream in $streamInfo) {
    if ($stream.bandwidth -and $stream.resolucao -and $stream.prefixo) {
        $masterPlaylist += "#EXT-X-STREAM-INF:BANDWIDTH=$($stream.bandwidth),RESOLUTION=$($stream.resolucao)`n"
        $masterPlaylist += "${slugDoCurso}-${slugDaAula}-${stream.prefixo}.m3u8`n"
    } else {
        Write-Host "Erro: Falta informação em algum campo para o stream com resolução $($stream.resolucao)"
    }
}

$masterPlaylistPath = Join-Path -Path $destino -ChildPath "${slugDoCurso}-${slugDaAula}.m3u8"
Set-Content -Path $masterPlaylistPath -Value $masterPlaylist

Write-Host "Conversão para HLS concluída. Arquivos disponíveis na pasta ${destino}/${slugDoCurso}/${slugDaAula}." -ForegroundColor Green
Write-Host "Arquivo master.m3u8 disponível em ${destinoCompleto}/master.m3u8." -ForegroundColor Green
