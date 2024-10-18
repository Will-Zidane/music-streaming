// utils/AudioManager.js
import { Howl } from 'howler';

const AudioManager = {
  currentSound: null,
  init(track, onEnd) {
    if (this.currentSound) {
      this.currentSound.stop();
      this.currentSound.unload();
    }

    this.currentSound = new Howl({
      src: [track.url],
      html5: true,
      onend: onEnd
    });

    return this.currentSound;
  },
  play() {
    if (this.currentSound) {
      this.currentSound.play();
    }
  },
  pause() {
    if (this.currentSound) {
      this.currentSound.pause();
    }
  },
  stop() {
    if (this.currentSound) {
      this.currentSound.stop();
    }
  }
};

export default AudioManager;