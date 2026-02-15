import "@ungap/compression-stream/poly";
import { KokoroTTS } from "kokoro-js";

const model_id = "onnx-community/Kokoro-82M-v1.0-onnx";
const tts = await KokoroTTS.from_pretrained(model_id, {
    dtype: "fp32",
    device: "cpu",
});


let start = performance.now();
const text = "Hello, world! This is a test of the Kokoro TTS system.";
const audio = await tts.generate(text, {
    voice: "af_bella",
});
let end = performance.now();
console.log(`Generation time: ${end - start} ms`);

await audio.save("output.wav");