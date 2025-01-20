const video = document.getElementById("video");
const qualitySelector = document.getElementById("qualitySelector");

const videoSrc = "http://localhost:3000/stream/big-buck-bunny/aula-1";

function initializeHls() {
  const hls = new Hls({
    capLevelToPlayerSize: true,
    startLevel: -1,
  });

  hls.loadSource(videoSrc);
  hls.attachMedia(video);

  hls.on(Hls.Events.MANIFEST_PARSED, () => {
    populateQualitySelector(hls.levels);
    video.play();
  });

  hls.on(Hls.Events.ERROR, handleHlsError);

  return hls;
}

function populateQualitySelector(levels) {
  levels.forEach((level, index) => {
    const option = document.createElement("option");
    option.value = index;
    option.text = `${level.height}p`;
    qualitySelector.appendChild(option);
  });
}

function handleQualityChange(hls) {
  qualitySelector.addEventListener("change", (event) => {
    const value = event.target.value;
    video.pause();
    hls.currentLevel = value === "auto" ? -1 : parseInt(value, 10);
  });
}

function handleHlsError(_event, data) {
  if (data.fatal) {
    switch (data.type) {
      case Hls.ErrorTypes.NETWORK_ERROR:
        console.error("Network error encountered.", data);
        hls.startLoad();
        break;
      case Hls.ErrorTypes.MEDIA_ERROR:
        console.error("Media error encountered.", data);
        hls.recoverMediaError();
        break;
      default:
        console.error("An unrecoverable error occurred.", data);
        hls.destroy();
        break;
    }
  }
}

if (Hls.isSupported()) {
  const hls = initializeHls();
  handleQualityChange(hls);
} else if (video.canPlayType("application/vnd.apple.mpegurl")) {
  video.src = videoSrc;
  video.addEventListener("loadedmetadata", () => {
    video.play();
  });
} else {
  alert("Seu navegador não suporta HLS.");
}
