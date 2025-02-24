export interface VideoFile {
  slug: string;
  session: string;
  title: string;
}

export interface Resolution {
  width: string;
  height: string;
}

export interface CreateHLSParams {
  input: string;
  bitrate: string;
  outputPath: string;
  baseUrl: string;
  hls_time: string;
  hls_list_size: string;
  slug: string;
  session: string;
  resolution: Resolution;
}

export interface VideoProgress {
  slug?: string;
  session?: string;
  resolution?: Resolution;
  frames: number;
  currentFps: number;
  currentKbps: number;
  targetSize: number;
  timemark: string;
  percent?: number | undefined;
}
