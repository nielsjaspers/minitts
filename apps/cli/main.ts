import { loadModel, streamAudioSegments } from "../../src/tts/tts-engine";
import { saveData } from "../../src/storage/fs-store";
import { DEFAULT_OUTPUT_DIR } from "../../src/core/constants";

const text = await Bun.file("./temp.txt").text();
const tts = await loadModel();
const now = Date.now();

let audioIndex = 0;
console.log(`Starting native stream generation for ${text.length} chars...`);

for await (const segment of streamAudioSegments(tts, text, { voice: "af_bella", speed: 1 })) {
  await saveData(now, segment, DEFAULT_OUTPUT_DIR, audioIndex, text);
  audioIndex++;

  if (audioIndex % 10 === 0) {
    console.log(`Saved ${audioIndex} streamed segments...`);
  }
}

console.log(`Done. Saved ${audioIndex} streamed segment(s) to ${DEFAULT_OUTPUT_DIR}/${now}.`);
