// Call ringtone and vibration utilities for NEOHI

class CallRingtone {
  private audioContext: AudioContext | null = null;
  private oscillator: OscillatorNode | null = null;
  private gainNode: GainNode | null = null;
  private isPlaying = false;
  private vibrateInterval: NodeJS.Timeout | null = null;

  // Create a pleasant ringtone using Web Audio API
  private createRingtone(): void {
    if (this.audioContext) return;

    this.audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
    this.gainNode = this.audioContext.createGain();
    this.gainNode.connect(this.audioContext.destination);
    this.gainNode.gain.value = 0;
  }

  // Play a two-tone ringtone pattern
  private playTone(frequency1: number, frequency2: number, duration: number): void {
    if (!this.audioContext || !this.gainNode) return;

    const osc1 = this.audioContext.createOscillator();
    const osc2 = this.audioContext.createOscillator();
    const gainNode = this.audioContext.createGain();

    osc1.type = 'sine';
    osc2.type = 'sine';
    osc1.frequency.value = frequency1;
    osc2.frequency.value = frequency2;

    osc1.connect(gainNode);
    osc2.connect(gainNode);
    gainNode.connect(this.audioContext.destination);

    const now = this.audioContext.currentTime;
    gainNode.gain.setValueAtTime(0, now);
    gainNode.gain.linearRampToValueAtTime(0.3, now + 0.05);
    gainNode.gain.setValueAtTime(0.3, now + duration - 0.05);
    gainNode.gain.linearRampToValueAtTime(0, now + duration);

    osc1.start(now);
    osc2.start(now);
    osc1.stop(now + duration);
    osc2.stop(now + duration);
  }

  // Play ringtone pattern continuously
  async start(): Promise<void> {
    if (this.isPlaying) return;
    this.isPlaying = true;

    try {
      this.createRingtone();

      // Play ringtone pattern
      const playPattern = () => {
        if (!this.isPlaying) return;
        
        // Play two tones with a pause (classic phone ringtone pattern)
        this.playTone(440, 480, 0.4); // First ring
        setTimeout(() => {
          if (this.isPlaying) this.playTone(440, 480, 0.4); // Second ring
        }, 500);
      };

      // Initial play
      playPattern();
      
      // Repeat every 2.5 seconds
      this.vibrateInterval = setInterval(playPattern, 2500);

      // Start vibration pattern if supported
      this.startVibration();
    } catch (error) {
      console.error('Error starting ringtone:', error);
    }
  }

  // Start vibration pattern
  private startVibration(): void {
    if (!('vibrate' in navigator)) return;

    const vibrate = () => {
      if (!this.isPlaying) return;
      // Vibrate pattern: 200ms on, 100ms off, 200ms on, then 2 second pause
      navigator.vibrate([200, 100, 200, 2000]);
    };

    vibrate();
    // Keep vibrating
    if (this.vibrateInterval) {
      // Already have interval, it will handle timing
    }
  }

  // Stop ringtone and vibration
  stop(): void {
    this.isPlaying = false;

    if (this.vibrateInterval) {
      clearInterval(this.vibrateInterval);
      this.vibrateInterval = null;
    }

    if (this.oscillator) {
      try {
        this.oscillator.stop();
      } catch (e) { }
      this.oscillator = null;
    }

    if (this.audioContext) {
      this.audioContext.close();
      this.audioContext = null;
    }

    // Stop vibration
    if ('vibrate' in navigator) {
      navigator.vibrate(0);
    }
  }
}

// Singleton instance
export const callRingtone = new CallRingtone();

// Vibrate once for notifications
export const vibrateOnce = (): void => {
  if ('vibrate' in navigator) {
    navigator.vibrate(200);
  }
};

// Vibrate pattern for messages
export const vibrateMessage = (): void => {
  if ('vibrate' in navigator) {
    navigator.vibrate([100, 50, 100]);
  }
};
