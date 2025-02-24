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

interface Resolution {
  width: string;
  height: string;
}
