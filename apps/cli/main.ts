// import { generateAudio, loadModel } from "../../src/tts/tts-engine";
// import { saveData } from "../../src/storage/fs-store";
import { chunkText } from "../../src/core/chunking";

// const text: string = "Hello, world! This is a test of the Kokoro TTS system.";
// const tts = await loadModel();
// const audio = await generateAudio(tts, text, "af_bella");
// await saveData(audio);


const text = await Bun.file("./temp.txt").text();
console.log(chunkText(text));
console.log(chunkText(text).length);
