const video = document.getElementById("video");
const qualitySelector = document.getElementById("qualitySelector");
const loadingIndicator = document.getElementById("loadingIndicator");

const videoSrc = "http://192.168.1.181:3000/stream/big-buck-bunny/aula-3";

/**
 * Inicializa o HLS e configura eventos necessários.
 */
function initializeHls() {
  const hls = new Hls({
    capLevelToPlayerSize: true,
    startLevel: -1,
  });

  hls.loadSource(videoSrc);
  hls.attachMedia(video);

  // Evento quando o manifesto é carregado
  hls.on(Hls.Events.MANIFEST_PARSED, () => {
    console.log("Manifesto HLS carregado com sucesso.");
    populateQualitySelector(hls.levels);
    video.play();
    showLoadingIndicator(false);
  });

  // Evento de erro
  hls.on(Hls.Events.ERROR, (event, data) => {
    handleHlsError(hls, data);
  });

  // Exibir indicador de carregamento durante o carregamento do manifesto
  hls.on(Hls.Events.MANIFEST_LOADING, () => {
    showLoadingIndicator(true);
  });

  return hls;
}

/**
 * Popula o seletor de qualidade com as opções disponíveis.
 * @param {Array} levels - Lista de níveis de qualidade disponíveis.
 */
function populateQualitySelector(levels) {
  qualitySelector.innerHTML = ""; // Limpa opções anteriores
  const autoOption = document.createElement("option");
  autoOption.value = "auto";
  autoOption.text = "Auto";
  qualitySelector.appendChild(autoOption);

  levels.forEach((level, index) => {
    const option = document.createElement("option");
    option.value = index;
    option.text = `${level.height}p`;
    qualitySelector.appendChild(option);
  });
}

/**
 * Configura o evento de mudança de qualidade.
 * @param {Hls} hls - Instância do HLS.
 */
function setupQualityChangeHandler(hls) {
  qualitySelector.addEventListener("change", (event) => {
    const value = event.target.value;
    if (value === "auto") {
      hls.currentLevel = -1; // Qualidade automática
    } else {
      const index = parseInt(value, 10);
      if (index >= 0 && index < hls.levels.length) {
        hls.currentLevel = index;
      } else {
        console.error("Nível de qualidade inválido selecionado:", value);
      }
    }
  });
}

/**
 * Manipula erros do HLS.
 * @param {Hls} hls - Instância do HLS.
 * @param {Object} data - Detalhes do erro.
 */
function handleHlsError(hls, data) {
  if (data.fatal) {
    switch (data.type) {
      case Hls.ErrorTypes.NETWORK_ERROR:
        console.error("Erro de rede encontrado:", data);
        hls.startLoad();
        break;
      case Hls.ErrorTypes.MEDIA_ERROR:
        console.error("Erro de mídia encontrado:", data);
        hls.recoverMediaError();
        break;
      default:
        console.error("Erro irreparável encontrado:", data);
        hls.destroy();
        alert("Um erro crítico ocorreu. Recarregue a página.");
    }
  } else {
    console.warn("Erro HLS não fatal:", data);
  }
}

/**
 * Exibe ou oculta o indicador de carregamento.
 * @param {boolean} show - Exibir (true) ou ocultar (false) o indicador.
 */
function showLoadingIndicator(show) {
  loadingIndicator.style.display = show ? "block" : "none";
}

// Inicialização principal
if (Hls.isSupported()) {
  const hls = initializeHls();
  setupQualityChangeHandler(hls);
} else if (video.canPlayType("application/vnd.apple.mpegurl")) {
  video.src = videoSrc;
  video.addEventListener("loadedmetadata", () => {
    video.play();
  });
} else {
  alert("Seu navegador não suporta HLS.");
  console.warn("HLS não suportado no navegador");
}
