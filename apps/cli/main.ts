import { loadModel, streamAudioSegments } from "../../src/tts/tts-engine";
import { saveData } from "../../src/storage/fs-store";
import { DEFAULT_OUTPUT_DIR, DEFAULT_VOICE } from "../../src/core/constants";
import { mergeAudio, MergeAudioOptions } from "../../src/audio/merge-wav";

const text = await Bun.file("./temp.txt").text();
const tts = await loadModel();
const now = Date.now();

let audioIndex = 0;
console.log(`Starting native stream generation for ${text.length} chars...`);

for await (const segment of streamAudioSegments(tts, text, { voice: DEFAULT_VOICE, speed: 1 })) {
  await saveData(now, segment, DEFAULT_OUTPUT_DIR, audioIndex, text);
  audioIndex++;

  if (audioIndex % 10 === 0) {
    console.log(`Saved ${audioIndex} streamed segments...`);
  }
}

console.log(`Done. Saved ${audioIndex} streamed segment(s) to ${DEFAULT_OUTPUT_DIR}/${now}.`);

let options: MergeAudioOptions = {
  keepSegments: false,
  format: "m4a",
  keepIntermediateWav: false,
  bitrate: "192k",
};

await mergeAudio({ dir: `${DEFAULT_OUTPUT_DIR}/${now}` }, options);
console.log("Merged audio saved successfully.");
