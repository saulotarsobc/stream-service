ffmpeg -i input.mp4 -c:v h264_nvenc -rc:v vbr -cq:v 23 -b:v 5M -c:a aac output.mp4
