import { generateAudio, loadModel } from "../../src/tts/tts-engine";
import { saveData } from "../../src/storage/fs-store";

const text: string = "Hello, world! This is a test of the Kokoro TTS system.";
const tts = await loadModel();
const audio = await generateAudio(tts, text, "af_bella");
await saveData(audio);
