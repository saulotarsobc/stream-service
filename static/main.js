const video = document.getElementById("video");

document.addEventListener("DOMContentLoaded", () => {
  const source = "http://192.168.1.181:3000/stream/big-buck-bunny/aula-1";
  const defaultOptions = {};

  if (Hls.isSupported()) {
    const hls = new Hls();
    hls.loadSource(source);
    hls.attachMedia(video);

    hls.on(Hls.Events.MANIFEST_PARSED, () => {
      const availableQualities = hls.levels.map((level) => level.height);

      defaultOptions.controls = [
        "captions",
        "play-large",
        "rewind",
        "fullscreen",
        "current-time",
        "play",
        "fast-forward",
        "progress",
        "duration",
        "mute",
        // "download",
        "volume",
        "captions",
        "settings",
        "restart",
        "pip",
        "airplay",
        "chapters",
        "descriptions",
      ];

      defaultOptions.quality = {
        default: availableQualities[0],
        options: availableQualities,
        forced: true,
        onChange: (newQuality) => changeQuality(newQuality),
      };

      new Plyr(video, defaultOptions);
    });

    hls.on(Hls.Events.ERROR, (event, data) => {
      console.error("HLS Error:", data);
    });

    window.hls = hls;
  } else {
    console.error("HLS is not supported in this browser.");
  }

  function changeQuality(newQuality) {
    const levels = window.hls.levels;
    levels.forEach((level, levelIndex) => {
      if (level.height === newQuality) {
        window.hls.currentLevel = levelIndex;
      }
    });
  }
});
