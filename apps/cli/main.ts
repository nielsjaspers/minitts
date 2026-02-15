import { generateAudio, loadModel } from "../../src/tts/tts-engine";
import { saveData } from "../../src/storage/fs-store";
import { chunkText } from "../../src/core/chunking";
import { DEFAULT_OUTPUT_DIR } from "../../src/core/constants";

// const text: string = "Hello, world! This is a test of the Kokoro TTS system.";
const text = await Bun.file("./temp.txt").text();
const tts = await loadModel();

const now = Date.now();
// print all chunks
console.log(chunkText(text));
console.log("Total chunks:", chunkText(text).length);

console.log("=====================\n\n");

for (const [index, chunk] of chunkText(text).entries()) {

    console.log(`Processing chunk ${index+1}/${chunkText(text).length}: ${chunk}`);

    const audio = await generateAudio(tts, chunk);
    await saveData(now, audio, DEFAULT_OUTPUT_DIR, index);
}
