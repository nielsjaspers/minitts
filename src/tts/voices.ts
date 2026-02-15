import "@ungap/compression-stream/poly";
import { KokoroTTS } from "kokoro-js";
import { loadModel } from "./tts-engine";

export async function getVoices(): Promise<void> {
    const tts = await loadModel();
    tts.list_voices();
}