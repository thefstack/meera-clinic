// public/audio-processor.js
class PCMProcessor extends AudioWorkletProcessor {
  constructor() {
    super();
  }

  process(inputs) {
    const input = inputs[0];
    if (input.length > 0) {
      const samples = input[0]; // mono audio
      const int16Samples = new Int16Array(samples.length);

      for (let i = 0; i < samples.length; i++) {
        let s = Math.max(-1, Math.min(1, samples[i]));
        int16Samples[i] = s < 0 ? s * 0x8000 : s * 0x7FFF;
      }

      this.port.postMessage(int16Samples.buffer, [int16Samples.buffer]);
    }

    return true;
  }
}

registerProcessor('pcm-processor', PCMProcessor);
