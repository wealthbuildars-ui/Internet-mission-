// Lightweight Web Audio API synthesizer for tactile cyber sounds, hatching FX, and ambient game music

class SoundEffects {
  private ctx: AudioContext | null = null;
  public enabled: boolean = true;
  public musicEnabled: boolean = false;

  // Background music state
  private musicIntervalId: any = null;
  private musicGainNode: GainNode | null = null;
  private isMusicPlaying: boolean = false;
  private musicVolume: number = 0.65;
  private customAudio: HTMLAudioElement | null = null;
  private customAudioBlobUrl: string | null = null;
  public trackTitle: string = "I'm Only Human";
  public trackArtist: string = "Chizi Wave";
  public isCustomTrackLoaded: boolean = false;

  constructor() {
    if (typeof window !== 'undefined') {
      this.initStoredAudio();
    }
  }

  // Check IndexedDB or /game-theme.mp3 on boot
  private async initStoredAudio() {
    try {
      const blob = await this.getStoredAudioBlob();
      if (blob) {
        this.setupCustomAudio(blob);
        this.isCustomTrackLoaded = true;
        return;
      }

      // Check if /game-theme.mp3 exists on server
      fetch('/game-theme.mp3', { method: 'HEAD' })
        .then((res) => {
          if (res.ok) {
            this.setupCustomAudio('/game-theme.mp3');
            this.isCustomTrackLoaded = true;
          }
        })
        .catch(() => {});
    } catch {}
  }

  private setupCustomAudio(source: Blob | string) {
    if (this.customAudio) {
      try {
        this.customAudio.pause();
        this.customAudio.src = '';
      } catch {}
    }

    if (this.customAudioBlobUrl) {
      try {
        URL.revokeObjectURL(this.customAudioBlobUrl);
      } catch {}
      this.customAudioBlobUrl = null;
    }

    const audio = new Audio();
    audio.loop = true;
    audio.volume = this.musicVolume;

    if (typeof source === 'string') {
      audio.src = source;
    } else {
      this.customAudioBlobUrl = URL.createObjectURL(source);
      audio.src = this.customAudioBlobUrl;
    }

    this.customAudio = audio;
  }

  // IndexedDB operations for permanent offline song storage
  private openDB(): Promise<IDBDatabase> {
    return new Promise((resolve, reject) => {
      const request = indexedDB.open('InternetMissionAudioDB', 1);
      request.onupgradeneeded = () => {
        const db = request.result;
        if (!db.objectStoreNames.contains('music')) {
          db.createObjectStore('music');
        }
      };
      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    });
  }

  private async saveAudioBlob(blob: Blob): Promise<void> {
    const db = await this.openDB();
    return new Promise((resolve, reject) => {
      const tx = db.transaction('music', 'readwrite');
      const store = tx.objectStore('music');
      const req = store.put(blob, 'theme_song');
      req.onsuccess = () => resolve();
      req.onerror = () => reject(req.error);
    });
  }

  private async getStoredAudioBlob(): Promise<Blob | null> {
    try {
      const db = await this.openDB();
      return new Promise((resolve) => {
        const tx = db.transaction('music', 'readonly');
        const store = tx.objectStore('music');
        const req = store.get('theme_song');
        req.onsuccess = () => resolve(req.result || null);
        req.onerror = () => resolve(null);
      });
    } catch {
      return null;
    }
  }

  // Load user-provided song file into the game audio player
  async loadAudioFile(file: File): Promise<boolean> {
    try {
      this.setupCustomAudio(file);
      this.isCustomTrackLoaded = true;

      // Save locally in IndexedDB for permanent playback
      await this.saveAudioBlob(file);

      // Upload to server asynchronously for persistent /game-theme.mp3
      const reader = new FileReader();
      reader.onload = async () => {
        try {
          const base64 = reader.result as string;
          await fetch('/api/upload-theme', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ audioData: base64 }),
          });
        } catch {}
      };
      reader.readAsDataURL(file);

      // If music is active, start playing the new track immediately
      if (this.isMusicPlaying) {
        this.stopMusic();
        this.startMusic();
      }

      return true;
    } catch (err) {
      console.error('Failed to load game theme:', err);
      return false;
    }
  }

  setMusicVolume(vol: number) {
    this.musicVolume = Math.max(0, Math.min(1, vol));
    if (this.customAudio) {
      this.customAudio.volume = this.musicVolume;
    }
    if (this.musicGainNode && this.ctx) {
      this.musicGainNode.gain.setValueAtTime(this.musicVolume * 0.1, this.ctx.currentTime);
    }
  }

  private initCtx(): AudioContext | null {
    if (!this.ctx && typeof window !== 'undefined') {
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      if (AudioCtx) {
        this.ctx = new AudioCtx();
      }
    }
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume().catch(() => {});
    }
    return this.ctx;
  }

  // Create a quick noise buffer for crunchy cracks & percussive textures
  private createNoiseBuffer(duration: number = 0.1): AudioBuffer | null {
    if (!this.ctx) return null;
    const bufferSize = Math.floor(this.ctx.sampleRate * duration);
    const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
      data[i] = Math.random() * 2 - 1;
    }
    return buffer;
  }

  // Tactical UI Click
  playClick() {
    if (!this.enabled) return;
    try {
      const ctx = this.initCtx();
      if (!ctx) return;
      const now = ctx.currentTime;

      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(800, now);
      osc.frequency.exponentialRampToValueAtTime(400, now + 0.05);

      gain.gain.setValueAtTime(0.06, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.05);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start(now);
      osc.stop(now + 0.06);
    } catch {}
  }

  // Mission / Drill Success Fanfare
  playSuccess() {
    if (!this.enabled) return;
    try {
      const ctx = this.initCtx();
      if (!ctx) return;
      const now = ctx.currentTime;

      // Uplifting arpeggio: C5 -> E5 -> G5 -> C6
      const notes = [523.25, 659.25, 783.99, 1046.5];
      notes.forEach((freq, idx) => {
        if (!ctx) return;
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();

        osc.type = 'triangle';
        osc.frequency.setValueAtTime(freq, now + idx * 0.08);

        gain.gain.setValueAtTime(0.001, now + idx * 0.08);
        gain.gain.exponentialRampToValueAtTime(0.18, now + idx * 0.08 + 0.02);
        gain.gain.exponentialRampToValueAtTime(0.001, now + idx * 0.08 + 0.35);

        osc.connect(gain);
        gain.connect(ctx.destination);

        osc.start(now + idx * 0.08);
        osc.stop(now + idx * 0.08 + 0.36);
      });
    } catch {}
  }

  // Error / Mistake Buzz
  playFail() {
    if (!this.enabled) return;
    try {
      const ctx = this.initCtx();
      if (!ctx) return;
      const now = ctx.currentTime;

      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(160, now);
      osc.frequency.exponentialRampToValueAtTime(110, now + 0.28);

      gain.gain.setValueAtTime(0.12, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.28);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start(now);
      osc.stop(now + 0.29);
    } catch {}
  }

  playError() {
    this.playFail();
  }

  playFanfare() {
    this.playLevelUp();
  }

  // Level Up Cosmic Chime
  playLevelUp() {
    if (!this.enabled) return;
    try {
      const ctx = this.initCtx();
      if (!ctx) return;
      const now = ctx.currentTime;

      const notes = [440, 554.37, 659.25, 880, 1108.73];
      notes.forEach((freq, idx) => {
        if (!ctx) return;
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();

        osc.type = 'sine';
        osc.frequency.setValueAtTime(freq, now + idx * 0.07);

        gain.gain.setValueAtTime(0.001, now + idx * 0.07);
        gain.gain.exponentialRampToValueAtTime(0.2, now + idx * 0.07 + 0.02);
        gain.gain.exponentialRampToValueAtTime(0.001, now + idx * 0.07 + 0.4);

        osc.connect(gain);
        gain.connect(ctx.destination);

        osc.start(now + idx * 0.07);
        osc.stop(now + idx * 0.07 + 0.42);
      });
    } catch {}
  }

  // Single Egg Shell Crack / Fracture Sound
  playEggCrack(pitchOffset: number = 1.0) {
    if (!this.enabled) return;
    try {
      const ctx = this.initCtx();
      if (!ctx) return;
      const now = ctx.currentTime;

      // 1. Resonant shell ping
      const ping = ctx.createOscillator();
      const pingGain = ctx.createGain();
      ping.type = 'sine';
      ping.frequency.setValueAtTime(1200 * pitchOffset, now);
      ping.frequency.exponentialRampToValueAtTime(320 * pitchOffset, now + 0.04);

      pingGain.gain.setValueAtTime(0.18, now);
      pingGain.gain.exponentialRampToValueAtTime(0.001, now + 0.045);

      ping.connect(pingGain);
      pingGain.connect(ctx.destination);

      ping.start(now);
      ping.stop(now + 0.05);

      // 2. High-pass textured crunch noise
      const noiseBuffer = this.createNoiseBuffer(0.06);
      if (noiseBuffer) {
        const noise = ctx.createBufferSource();
        noise.buffer = noiseBuffer;

        const filter = ctx.createBiquadFilter();
        filter.type = 'bandpass';
        filter.frequency.setValueAtTime(3200 * pitchOffset, now);
        filter.Q.setValueAtTime(3.5, now);

        const noiseGain = ctx.createGain();
        noiseGain.gain.setValueAtTime(0.22, now);
        noiseGain.gain.exponentialRampToValueAtTime(0.001, now + 0.055);

        noise.connect(filter);
        filter.connect(noiseGain);
        noiseGain.connect(ctx.destination);

        noise.start(now);
        noise.stop(now + 0.06);
      }
    } catch {}
  }

  // Complete Iconic Gaming Hatching Sequence:
  // Wobble/Crack 1 -> Wobble/Crack 2 -> Wobble/Crack 3 -> Shell Shatter Pop -> Newborn Fanfare!
  playHatching(onPopCallback?: () => void) {
    if (!this.enabled) return;
    try {
      const ctx = this.initCtx();
      if (!ctx) return;
      const now = ctx.currentTime;

      // --- Stage 1: Wobble & Crack 1 (t = 0.00s) ---
      this.playEggCrack(0.9);

      // --- Stage 2: Wobble & Crack 2 (t = 0.35s) ---
      setTimeout(() => {
        this.playEggCrack(1.15);
      }, 350);

      // --- Stage 3: Intense Wobble & Crack 3 (t = 0.70s) ---
      setTimeout(() => {
        this.playEggCrack(1.35);
      }, 700);

      // --- Stage 4: Burst / Shell Shatter Pop (t = 1.05s) ---
      setTimeout(() => {
        try {
          if (!this.ctx) return;
          const popTime = this.ctx.currentTime;

          if (onPopCallback) {
            onPopCallback();
          }

          // Loud joyful pop
          const popOsc = this.ctx.createOscillator();
          const popGain = this.ctx.createGain();
          popOsc.type = 'triangle';
          popOsc.frequency.setValueAtTime(240, popTime);
          popOsc.frequency.exponentialRampToValueAtTime(1400, popTime + 0.06);
          popOsc.frequency.exponentialRampToValueAtTime(600, popTime + 0.12);

          popGain.gain.setValueAtTime(0.3, popTime);
          popGain.gain.exponentialRampToValueAtTime(0.001, popTime + 0.14);

          popOsc.connect(popGain);
          popGain.connect(this.ctx.destination);

          popOsc.start(popTime);
          popOsc.stop(popTime + 0.15);

          // Shatter noise burst
          const shatterBuffer = this.createNoiseBuffer(0.18);
          if (shatterBuffer) {
            const shatterNoise = this.ctx.createBufferSource();
            shatterNoise.buffer = shatterBuffer;

            const highFilter = this.ctx.createBiquadFilter();
            highFilter.type = 'highpass';
            highFilter.frequency.setValueAtTime(1800, popTime);

            const shatterGain = this.ctx.createGain();
            shatterGain.gain.setValueAtTime(0.28, popTime);
            shatterGain.gain.exponentialRampToValueAtTime(0.001, popTime + 0.16);

            shatterNoise.connect(highFilter);
            highFilter.connect(shatterGain);
            shatterGain.connect(this.ctx.destination);

            shatterNoise.start(popTime);
            shatterNoise.stop(popTime + 0.18);
          }
        } catch {}
      }, 1050);

      // --- Stage 5: Newborn Gaming Fanfare / Victory Melody (t = 1.25s) ---
      // Triumphant 8-bit / 16-bit cute melody: C5 -> E5 -> G5 -> C6 -> E6 -> G6 with sparkle chimes
      setTimeout(() => {
        try {
          if (!this.ctx) return;
          const melodyStart = this.ctx.currentTime;
          const fanfareNotes = [
            { f: 523.25, dur: 0.10, t: 0.00 }, // C5
            { f: 659.25, dur: 0.10, t: 0.09 }, // E5
            { f: 783.99, dur: 0.10, t: 0.18 }, // G5
            { f: 1046.50, dur: 0.12, t: 0.28 }, // C6
            { f: 1318.51, dur: 0.14, t: 0.40 }, // E6
            { f: 1567.98, dur: 0.45, t: 0.54 }, // G6 (long bell sustain)
          ];

          fanfareNotes.forEach((n) => {
            if (!this.ctx) return;
            const osc = this.ctx.createOscillator();
            const gain = this.ctx.createGain();

            osc.type = 'sine';
            osc.frequency.setValueAtTime(n.f, melodyStart + n.t);

            gain.gain.setValueAtTime(0.001, melodyStart + n.t);
            gain.gain.exponentialRampToValueAtTime(0.24, melodyStart + n.t + 0.02);
            gain.gain.exponentialRampToValueAtTime(0.001, melodyStart + n.t + n.dur);

            // Shimmer vibrato on the final note
            if (n.dur > 0.3) {
              const lfo = this.ctx.createOscillator();
              const lfoGain = this.ctx.createGain();
              lfo.frequency.setValueAtTime(6, melodyStart + n.t);
              lfoGain.gain.setValueAtTime(14, melodyStart + n.t);
              lfo.connect(osc.frequency);
              lfo.start(melodyStart + n.t);
              lfo.stop(melodyStart + n.t + n.dur);
            }

            osc.connect(gain);
            gain.connect(this.ctx.destination);

            osc.start(melodyStart + n.t);
            osc.stop(melodyStart + n.t + n.dur + 0.05);
          });
        } catch {}
      }, 1250);
    } catch {}
  }

  // Ambient Game Music Loop ("I'm Only Human" - Chizi Wave Theme)
  startMusic() {
    if (this.isMusicPlaying) return;
    this.isMusicPlaying = true;
    this.musicEnabled = true;

    // 1. If custom audio is loaded (master track from user or server), stream it directly!
    if (this.customAudio) {
      try {
        this.customAudio.currentTime = this.customAudio.currentTime || 0;
        this.customAudio.volume = this.musicVolume;
        this.customAudio.play().catch((err) => {
          console.warn('Audio element play note (user interaction may be needed):', err);
          // Fall back to synth if audio element is blocked
          this.startSynthesizedHumanTheme();
        });
        return;
      } catch (err) {
        console.warn('Custom audio playback error, falling back to synthesizer:', err);
      }
    }

    // 2. Fallback: Procedural Chizi Wave "I'm Only Human" Web Audio synthesizer
    this.startSynthesizedHumanTheme();
  }

  private startSynthesizedHumanTheme() {
    try {
      const ctx = this.initCtx();
      if (!ctx) return;

      // Master music volume bus (gentle background volume)
      this.musicGainNode = ctx.createGain();
      this.musicGainNode.gain.setValueAtTime(0.001, ctx.currentTime);
      this.musicGainNode.gain.exponentialRampToValueAtTime(this.musicVolume * 0.08, ctx.currentTime + 0.8);
      this.musicGainNode.connect(ctx.destination);

      // Low-pass warm filter
      const masterFilter = ctx.createBiquadFilter();
      masterFilter.type = 'lowpass';
      masterFilter.frequency.setValueAtTime(1600, ctx.currentTime);
      masterFilter.connect(this.musicGainNode);

      // Chord progression for "I'm Only Human" by Chizi Wave:
      // F#m -> D -> A -> E
      const chords = [
        {
          name: 'F#m',
          root: 185.00, // F#3
          bass: 92.50,  // F#2
          arps: [369.99, 440.00, 554.37, 739.99, 554.37, 440.00, 369.99, 554.37], // F#4, A4, C#5, F#5
          melody: [554.37, 554.37, 493.88, 440.00], // C#5, C#5, B4, A4 ("I'm only human")
        },
        {
          name: 'D',
          root: 146.83, // D3
          bass: 73.42,  // D2
          arps: [293.66, 369.99, 440.00, 587.33, 440.00, 369.99, 293.66, 440.00], // D4, F#4, A4, D5
          melody: [440.00, 493.88, 554.37, 493.88], // A4, B4, C#5, B4 ("make mistakes sometimes")
        },
        {
          name: 'A',
          root: 220.00, // A3
          bass: 110.00, // A2
          arps: [440.00, 554.37, 659.25, 880.00, 659.25, 554.37, 440.00, 659.25], // A4, C#5, E5, A5
          melody: [554.37, 554.37, 493.88, 440.00], // C#5, C#5, B4, A4 ("trying to get it right")
        },
        {
          name: 'E',
          root: 164.81, // E3
          bass: 82.41,  // E2
          arps: [329.63, 415.30, 493.88, 659.25, 493.88, 415.30, 329.63, 493.88], // E4, G#4, B4, E5
          melody: [440.00, 493.88, 554.37, 369.99], // A4, B4, C#5, F#4 ("learning everyday")
        },
      ];

      const tempoBpm = 96; // Chizi Wave ballad tempo
      const stepDuration = 60 / tempoBpm / 2; // 8th-note steps
      let nextNoteTime = ctx.currentTime + 0.05;
      let currentStep = 0;

      const scheduleNotes = () => {
        if (!this.isMusicPlaying || !this.ctx) return;
        const now = this.ctx.currentTime;

        while (nextNoteTime < now + 0.3) {
          const chordIndex = Math.floor(currentStep / 8) % chords.length;
          const stepInBar = currentStep % 8;
          const chord = chords[chordIndex];
          const time = nextNoteTime;

          // 1. Deep warm piano bass note on beat 1 and beat 5
          if (stepInBar === 0 || stepInBar === 4) {
            const bassOsc = this.ctx.createOscillator();
            const bassGain = this.ctx.createGain();
            bassOsc.type = 'triangle';
            bassOsc.frequency.setValueAtTime(chord.bass, time);

            bassGain.gain.setValueAtTime(0.001, time);
            bassGain.gain.exponentialRampToValueAtTime(0.14, time + 0.03);
            bassGain.gain.exponentialRampToValueAtTime(0.001, time + stepDuration * 3.6);

            bassOsc.connect(bassGain);
            bassGain.connect(masterFilter);

            bassOsc.start(time);
            bassOsc.stop(time + stepDuration * 3.7);
          }

          // 2. Chizi Wave acoustic piano arpeggio
          const arpFreq = chord.arps[stepInBar];
          const arpOsc = this.ctx.createOscillator();
          const arpGain = this.ctx.createGain();

          arpOsc.type = 'sine';
          arpOsc.frequency.setValueAtTime(arpFreq, time);

          arpGain.gain.setValueAtTime(0.001, time);
          arpGain.gain.exponentialRampToValueAtTime(0.045, time + 0.02);
          arpGain.gain.exponentialRampToValueAtTime(0.001, time + stepDuration * 0.95);

          arpOsc.connect(arpGain);
          arpGain.connect(masterFilter);

          arpOsc.start(time);
          arpOsc.stop(time + stepDuration);

          // 3. Subtle vocal-synth lead on half-beats
          if (stepInBar % 2 === 0) {
            const melIdx = Math.floor(stepInBar / 2);
            const melFreq = chord.melody[melIdx];
            const leadOsc = this.ctx.createOscillator();
            const leadGain = this.ctx.createGain();

            leadOsc.type = 'triangle';
            leadOsc.frequency.setValueAtTime(melFreq, time);

            leadGain.gain.setValueAtTime(0.001, time);
            leadGain.gain.exponentialRampToValueAtTime(0.035, time + 0.04);
            leadGain.gain.exponentialRampToValueAtTime(0.001, time + stepDuration * 1.8);

            leadOsc.connect(leadGain);
            leadGain.connect(masterFilter);

            leadOsc.start(time);
            leadOsc.stop(time + stepDuration * 1.9);
          }

          // 4. Subtle rain/shaker texture
          if (stepInBar % 2 === 1) {
            const hatBuffer = this.createNoiseBuffer(0.025);
            if (hatBuffer) {
              const hat = this.ctx.createBufferSource();
              hat.buffer = hatBuffer;

              const hatFilter = this.ctx.createBiquadFilter();
              hatFilter.type = 'highpass';
              hatFilter.frequency.setValueAtTime(5500, time);

              const hatGain = this.ctx.createGain();
              hatGain.gain.setValueAtTime(0.012, time);
              hatGain.gain.exponentialRampToValueAtTime(0.001, time + 0.025);

              hat.connect(hatFilter);
              hatFilter.connect(hatGain);
              hatGain.connect(this.musicGainNode!);

              hat.start(time);
              hat.stop(time + 0.03);
            }
          }

          nextNoteTime += stepDuration;
          currentStep = (currentStep + 1) % 32;
        }
      };

      this.musicIntervalId = setInterval(scheduleNotes, 50);
    } catch (e) {
      console.error('Music play error:', e);
    }
  }

  stopMusic() {
    this.isMusicPlaying = false;
    this.musicEnabled = false;

    // Pause custom audio if playing
    if (this.customAudio) {
      try {
        this.customAudio.pause();
      } catch {}
    }

    if (this.musicIntervalId) {
      clearInterval(this.musicIntervalId);
      this.musicIntervalId = null;
    }

    if (this.musicGainNode && this.ctx) {
      try {
        const now = this.ctx.currentTime;
        this.musicGainNode.gain.setValueAtTime(this.musicGainNode.gain.value, now);
        this.musicGainNode.gain.exponentialRampToValueAtTime(0.0001, now + 0.3);
        setTimeout(() => {
          this.musicGainNode?.disconnect();
          this.musicGainNode = null;
        }, 320);
      } catch {
        this.musicGainNode = null;
      }
    }
  }

  toggleMusic(): boolean {
    if (this.isMusicPlaying) {
      this.stopMusic();
      return false;
    } else {
      this.startMusic();
      return true;
    }
  }
}

export const sound = new SoundEffects();
