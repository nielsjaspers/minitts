import "@ungap/compression-stream/poly";
import { KokoroTTS, TextSplitterStream } from "kokoro-js";
import { DEFAULT_DEVICE, DEFAULT_DTYPE, DEFAULT_MODEL, DEFAULT_VOICE } from "../core/constants";
import { MetaData } from "../core/types";

export async function loadModel(modelId: string = DEFAULT_MODEL): Promise<KokoroTTS> {
  const tts = await KokoroTTS.from_pretrained(modelId, {
    dtype: DEFAULT_DTYPE,
    device: DEFAULT_DEVICE,
  });
  return tts;
}

export async function generateAudio(tts: KokoroTTS, text: string, voice: string = DEFAULT_VOICE): Promise<MetaData> {
  const audio = await tts.generate(text, {
    voice: voice as any,
  });
  return {
    input: text,
    audio,
  };
}

export async function* streamAudioSegments(
  tts: KokoroTTS,
  text: string,
  options: { voice?: string; speed?: number } = {},
): AsyncGenerator<MetaData> {
  const splitter = new TextSplitterStream();
  const stream = tts.stream(splitter, {
    voice: (options.voice ?? DEFAULT_VOICE) as any,
    speed: options.speed ?? 1,
  });

  splitter.push(text);
  splitter.close();

  for await (const segment of stream) {
    yield {
      input: segment.text,
      audio: segment.audio,
    };
  }
}
