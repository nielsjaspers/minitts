import "@ungap/compression-stream/poly";
import { KokoroTTS } from "kokoro-js";
import { DEFAULT_DEVICE, DEFAULT_DTYPE, DEFAULT_MODEL } from "../core/constants";
import { MetaData } from "../core/types";

export async function loadModel(modelId: string = DEFAULT_MODEL): Promise<KokoroTTS> {
    const tts = await KokoroTTS.from_pretrained(modelId, {
        dtype: DEFAULT_DTYPE,
        device: DEFAULT_DEVICE,
    });
    return tts;
}

export async function generateAudio(tts: KokoroTTS, text: string, voice: string = "af_bella"): Promise<MetaData> {
    const audio = await tts.generate(text, {
        voice: voice as any,
    });
    return {
        input: text,
        audio: audio,
    };
}

// let start = performance.now();
// const text = "Hello, world! This is a test of the Kokoro TTS system.";
// const audio = await tts.generate(text, {
//     voice: "af_bella",
// });
// let end = performance.now();
// console.log(`Generation time: ${end - start} ms`);

// await audio.save("output.wav");