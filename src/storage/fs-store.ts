import { MetaData, Output } from "../core/types";
import { DEFAULT_OUTPUT_DIR } from "../core/constants";
import { mkdir } from "fs/promises";

export async function saveData(now: number = Date.now(), metadata: MetaData, outputDir: string = DEFAULT_OUTPUT_DIR, chunkIndex?: number): Promise<Output> {
  const timestampDir = `${outputDir}/${now}`;

  await mkdir(outputDir, { recursive: true });
  await mkdir(timestampDir, { recursive: true });

  const textFilePath = `${timestampDir}/text-data.txt`;
  await Bun.write(textFilePath, metadata.input);
  await metadata.audio.save(`${timestampDir}/audio-data-${chunkIndex ?? 0}.wav`);
  return {
    dir: timestampDir,
  };
}
