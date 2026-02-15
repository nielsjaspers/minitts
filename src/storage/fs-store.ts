import { MetaData } from "../core/types";
import { DEFAULT_OUTPUT_DIR } from "../core/constants";

export async function saveData(metadata: MetaData, outputDir: string = DEFAULT_OUTPUT_DIR): Promise<void> {
    if (!Bun.file(outputDir).exists()) {
        await Bun.write(outputDir, "");
    }
    
    const audiofilename = `audio-data.wav`;
    const textFilename = `text-data.txt`;
    const now = Date.now();

    await Bun.write(`${outputDir}/${now}/${textFilename}`, metadata.input);
    await metadata.audio.save(`${outputDir}/${now}/${audiofilename}`);
}
