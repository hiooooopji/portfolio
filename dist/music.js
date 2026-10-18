// “After Hours”: an original, slow ambient arrangement, generated locally.
// Soft keys over sustained chords; no percussion or external audio requests.
export function createCalmMusic(context) {
  const master = context.createGain();
  master.gain.value = 0;
  master.connect(context.destination);
  const filter = context.createBiquadFilter();
  filter.type = 'lowpass'; filter.frequency.value = 1800; filter.Q.value = .4;
  filter.connect(master);

  const reverb = context.createConvolver();
  const impulse = context.createBuffer(2, context.sampleRate * 3, context.sampleRate);
  for (let channel = 0; channel < 2; channel++) {
    const samples = impulse.getChannelData(channel);
    let smooth = 0;
    for (let i = 0; i < samples.length; i++) {
      smooth = smooth * .65 + (Math.random() * 2 - 1) * .35;
      samples[i] = smooth * Math.pow(1 - i / samples.length, 3);
    }
  }
  reverb.buffer = impulse;
  const wet = context.createGain(); wet.gain.value = .2;
  filter.connect(reverb); reverb.connect(wet); wet.connect(master);

  const chords = [
    [48, 55, 59, 64], [45, 52, 55, 60],
    [41, 48, 57, 64], [43, 50, 57, 62],
    [48, 55, 59, 64], [45, 52, 59, 64],
    [41, 48, 55, 57], [43, 50, 55, 59],
  ];
  const melodies = [
    [64, 67, 71], [69, 67, 64], [64, 67, 69], [67, 62, null],
    [67, 71, 74], [71, 69, 64], [69, 67, 64], [62, 59, null],
  ];
  const voices = new Set();
  let timer, bar = 0, nextBar = 0, playing = false;

  function note(midi, time, duration, volume, pad = false, pan = 0) {
    const envelope = context.createGain();
    const stereo = context.createStereoPanner(); stereo.pan.value = pan;
    envelope.connect(stereo); stereo.connect(filter);
    envelope.gain.setValueAtTime(0, time);
    envelope.gain.linearRampToValueAtTime(volume, time + (pad ? 1.8 : .06));
    if (pad) envelope.gain.setValueAtTime(volume, time + duration - 2.4);
    else envelope.gain.exponentialRampToValueAtTime(volume * .18, time + 1.5);
    envelope.gain.exponentialRampToValueAtTime(.0001, time + duration);
    envelope.gain.linearRampToValueAtTime(0, time + duration + .1);

    // A quiet second harmonic gives the keys warmth without a sharp attack.
    let remaining = 2;
    for (const [multiple, level] of [[1, 1], [2, pad ? .08 : .16]]) {
      const oscillator = context.createOscillator(), partial = context.createGain();
      oscillator.type = 'sine'; oscillator.frequency.value = 440 * 2 ** ((midi - 69) / 12) * multiple;
      partial.gain.value = level; oscillator.connect(partial); partial.connect(envelope);
      voices.add(oscillator);
      oscillator.onended = () => {
        voices.delete(oscillator); oscillator.disconnect(); partial.disconnect();
        if (--remaining === 0) { envelope.disconnect(); stereo.disconnect(); }
      };
      oscillator.start(time); oscillator.stop(time + duration + .15);
    }
  }
  function schedule() {
    if (!playing || context.state !== 'running') return;
    // Resume gently if a browser throttled timers without suspending audio.
    if (nextBar < context.currentTime) nextBar = context.currentTime + .08;
    while (nextBar < context.currentTime + .6) {
      const phrase = bar % chords.length;
      chords[phrase].forEach((pitch, i) => note(pitch, nextBar + i * .045, 10.4, .025, true, (i - 1.5) * .18));
      melodies[phrase].forEach((pitch, i) => {
        if (pitch !== null) note(pitch, nextBar + [.8, 3.3, 6][i], 4, .075, false, i % 2 ? .12 : -.12);
      });
      nextBar += 8; bar++;
    }
  }
  return {
    start() {
      if (playing) return;
      playing = true; bar = 0; nextBar = context.currentTime + .08;
      master.gain.cancelScheduledValues(context.currentTime);
      master.gain.setTargetAtTime(.5, context.currentTime, .6);
      schedule(); timer = setInterval(schedule, 200);
    },
    stop() {
      playing = false; clearInterval(timer);
      master.gain.cancelScheduledValues(context.currentTime);
      master.gain.setTargetAtTime(0, context.currentTime, .2);
      for (const oscillator of voices) oscillator.stop(context.currentTime + 1);
    },
  };
}
