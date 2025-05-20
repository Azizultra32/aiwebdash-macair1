import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"
 
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function getAllSupportedMimeTypes(...mediaTypes: string[]) {
  if (!mediaTypes.length) mediaTypes.push('video', 'audio')
  const CONTAINERS = ['webm', 'ogg', 'mp3', 'mp4', 'x-matroska', '3gpp', '3gpp2', '3gp2', 'quicktime', 'mpeg', 'aac', 'flac', 'x-flac', 'wave', 'wav', 'x-wav', 'x-pn-wav', 'not-supported']
  const CODECS = ['vp9', 'vp9.0', 'vp8', 'vp8.0', 'avc1', 'av1', 'h265', 'h.265', 'h264', 'h.264', 'opus', 'vorbis', 'pcm', 'aac', 'mpeg', 'mp4a', 'rtx', 'red', 'ulpfec', 'g722', 'pcmu', 'pcma', 'cn', 'telephone-event', 'not-supported']
  
  return [...new Set(
    CONTAINERS.flatMap(ext =>
        mediaTypes.flatMap(mediaType => [
          `${mediaType}/${ext}`,
        ]),
    ),
  ), ...new Set(
    CONTAINERS.flatMap(ext =>
      CODECS.flatMap(codec =>
        mediaTypes.flatMap(mediaType => [
          // NOTE: 'codecs:' will always be true (false positive)
          `${mediaType}/${ext};codecs=${codec}`,
        ]),
      ),
    ),
  ), ...new Set(
    CONTAINERS.flatMap(ext =>
      CODECS.flatMap(codec1 =>
      CODECS.flatMap(codec2 =>
        mediaTypes.flatMap(mediaType => [
          `${mediaType}/${ext};codecs="${codec1}, ${codec2}"`,
        ]),
      ),
      ),
    ),
  )].filter(variation => MediaRecorder.isTypeSupported(variation))
}

export const getAllSupportedAudioMimeTypes = () => getAllSupportedMimeTypes('audio');

export function isSafari(): boolean {
  const isSafari = /^((?!chrome|android).)*safari/i.test(navigator.userAgent);
  return isSafari;
}

export function getAudioMimeType(): string {
  return 'audio/mp3';
  const priorities: string[] = ['webm', 'm4a', 'mp4', 'mp3', 'mpeg', 'mpga', 'wav'];
  const allAudioMimeTypes = getAllSupportedAudioMimeTypes();
  const map = priorities.reduce((accum : any, p : string) => {
    const mimeType = allAudioMimeTypes.filter(x => x && x.length).find(x => x.indexOf(p) > -1);
    if (mimeType && mimeType.length && accum[p] === undefined) {
      accum[p] = mimeType;
    }
    return accum;
  }, {});
  let audioMimeType = null;
  for(let i in priorities) {
    if (map[priorities[i]] !== undefined) {
      audioMimeType = map[priorities[i]];
      break;
    }
  }
  return audioMimeType ?? 'audio/wav';
}


// https://stackoverflow.com/a/2117523/2800218
export function uuidv4() {
  if (crypto && typeof crypto.randomUUID === "function") {
    return crypto.randomUUID();
  }
  return "10000000-1000-4000-8000-100000000000".replace(/[018]/g, c =>
    (parseInt(c) ^ crypto.getRandomValues(new Uint8Array(1))[0] & 15 >> parseInt(c) / 4).toString(16)
  );
}

export async function checkMicrophonePermissions(): Promise<boolean> {
  let hasMicrophoneAccess = false;

  await navigator.mediaDevices.getUserMedia({ audio: true })
    .then(_ => hasMicrophoneAccess = true)
    .catch(_ => hasMicrophoneAccess = false);

  return hasMicrophoneAccess;
}
