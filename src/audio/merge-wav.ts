import { Output } from "../core/types";
import { readdir, unlink } from "fs/promises";
import { join } from "path";

type AudioFormat = "wav" | "mp3" | "m4a" | "aac";

export type MergeAudioOptions = {
  format?: AudioFormat;
  bitrate?: string;
  sampleRate?: number;
  keepIntermediateWav?: boolean;
  ffmpegPath?: string;
  keepSegments?: boolean;
};

export type MergeAudioResult = {
  mergedPath: string;
  convertedPath?: string;
};

const AUDIO_CHUNK_PATTERN = /^audio-data-(\d+)\.wav$/;

export async function mergeAudio(
  output: Output,
  options: MergeAudioOptions = {},
): Promise<MergeAudioResult> {
  const format = options.format ?? "wav";
  const ffmpegPath = options.ffmpegPath ?? "ffmpeg";
  const bitrate = options.bitrate ?? "192k";
  const keepIntermediateWav = options.keepIntermediateWav ?? true;
  const keepSegments = options.keepSegments ?? true;

  const wavPaths = await getSortedWavChunkPaths(output.dir);
  if (wavPaths.length === 0) {
    throw new Error(
      `No WAV chunk files found in ${output.dir}. Expected audio-data-<n>.wav files.`,
    );
  }

  const mergedPath = join(output.dir, "merged-audio.wav");
  const concatListPath = join(output.dir, `.ffmpeg-concat-${Date.now()}.txt`);

  await Bun.write(concatListPath, buildConcatListFile(wavPaths));
  try {
    const mergeWithDemuxer = await runFfmpeg(ffmpegPath, [
      "-hide_banner",
      "-loglevel",
      "error",
      "-f",
      "concat",
      "-safe",
      "0",
      "-i",
      concatListPath,
      "-c",
      "copy",
      "-y",
      mergedPath,
    ]);

    if (!mergeWithDemuxer.ok) {
      const fallback = await runConcatFilterFallback(
        ffmpegPath,
        wavPaths,
        mergedPath,
        options.sampleRate,
      );
      if (!fallback.ok) {
        throw new Error(
          `Failed to merge WAV files with ffmpeg.\nDemuxer error:\n${mergeWithDemuxer.stderr}\nFallback error:\n${fallback.stderr}`,
        );
      }
    }
  } finally {
    await safeUnlink(concatListPath);
  }

  if (format === "wav") {
    return { mergedPath };
  }

  const convertedPath = join(output.dir, `merged-audio.${format}`);
  const convertArgs = [
    "-hide_banner",
    "-loglevel",
    "error",
    "-i",
    mergedPath,
    ...buildTranscodeArgs(format, bitrate, options.sampleRate),
    "-y",
    convertedPath,
  ];
  const conversion = await runFfmpeg(ffmpegPath, convertArgs);
  if (!conversion.ok) {
    await safeUnlink(convertedPath);
    throw new Error(
      `Failed to transcode merged audio to ${format}.\n${conversion.stderr}`,
    );
  }

  if (!keepIntermediateWav) {
    await safeUnlink(mergedPath);
  }
  
  if (!keepSegments) {
    for (const wavPath of wavPaths) {
      await safeUnlink(wavPath);
    }
  }

  return { mergedPath, convertedPath };
}

export async function mergeWav(output: Output): Promise<void> {
  await mergeAudio(output, { format: "wav" });
}

async function getSortedWavChunkPaths(dir: string): Promise<string[]> {
  const entries = await readdir(dir, { withFileTypes: true });

  return entries
    .filter((entry) => entry.isFile())
    .map((entry) => {
      const match = entry.name.match(AUDIO_CHUNK_PATTERN);
      if (!match) {
        return null;
      }

      return {
        path: join(dir, entry.name),
        index: Number(match[1]),
      };
    })
    .filter((item): item is { path: string; index: number } => item !== null)
    .sort((a, b) => a.index - b.index)
    .map((item) => item.path);
}

function buildConcatListFile(paths: string[]): string {
  const lines = paths.map((path) => `file '${escapeForFfmpegConcat(path)}'`);
  return `${lines.join("\n")}\n`;
}

function escapeForFfmpegConcat(path: string): string {
  return path.replace(/\\/g, "\\\\").replace(/'/g, "'\\''");
}

async function runConcatFilterFallback(
  ffmpegPath: string,
  wavPaths: string[],
  mergedPath: string,
  sampleRate?: number,
): Promise<{ ok: boolean; stderr: string }> {
  const inputArgs = wavPaths.flatMap((path) => ["-i", path]);
  const audioInputs = wavPaths.map((_, index) => `[${index}:a]`).join("");
  const filter = `${audioInputs}concat=n=${wavPaths.length}:v=0:a=1[aout]`;

  const args = [
    "-hide_banner",
    "-loglevel",
    "error",
    ...inputArgs,
    "-filter_complex",
    filter,
    "-map",
    "[aout]",
    "-c:a",
    "pcm_s16le",
    ...(sampleRate ? ["-ar", String(sampleRate)] : []),
    "-y",
    mergedPath,
  ];

  return runFfmpeg(ffmpegPath, args);
}

function buildTranscodeArgs(
  format: Exclude<AudioFormat, "wav">,
  bitrate: string,
  sampleRate?: number,
): string[] {
  if (format === "mp3") {
    return [
      "-c:a",
      "libmp3lame",
      "-b:a",
      bitrate,
      ...(sampleRate ? ["-ar", String(sampleRate)] : []),
    ];
  }

  return [
    "-c:a",
    "aac",
    "-b:a",
    bitrate,
    ...(sampleRate ? ["-ar", String(sampleRate)] : []),
  ];
}

async function runFfmpeg(
  ffmpegPath: string,
  args: string[],
): Promise<{ ok: boolean; stderr: string }> {
  try {
    const process = Bun.spawn([ffmpegPath, ...args], {
      stdout: "ignore",
      stderr: "pipe",
    });
    const [exitCode, stderr] = await Promise.all([
      process.exited,
      new Response(process.stderr).text(),
    ]);
    return {
      ok: exitCode === 0,
      stderr: stderr.trim(),
    };
  } catch (error) {
    throw new Error(
      `Unable to execute ffmpeg at "${ffmpegPath}". ${(error as Error).message}`,
    );
  }
}

async function safeUnlink(path: string): Promise<void> {
  try {
    await unlink(path);
  } catch (_error) {
    // Best-effort cleanup only.
  }
}
