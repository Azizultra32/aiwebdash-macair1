const MIN_DECIBELS = -55;
let audioCtx = new (window.AudioContext || window.webkitAudioContext)();
let analyser = audioCtx.createAnalyser();
let soundDetected = false;

const AudioContext  = {

  getAudioContext() {
    return audioCtx;
  },

  getAnalyser() {
    analyser.minDecibels = MIN_DECIBELS;
    return analyser;
  },

  resetAudioContext() {
    audioCtx = new (window.AudioContext || window.webkitAudioContext)();
    this.resetAnalyser();
    return audioCtx;
  },

  resetAnalyser() {
    analyser = audioCtx.createAnalyser();
  },

  setSoundDetected(s) {
    soundDetected = s;
  },

  getSoundDetected() {
    return soundDetected;
  },

}

export default AudioContext;
