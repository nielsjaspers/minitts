# minitts

A minimal text-to-speech CLI tool powered by Kokoro.

## Usage

1. Add text to `temp.txt` (As the filename suggests, this is a temporary implementation.)
2. Run `bun run apps/cli/main.ts`
3. Find the merged audio in `data/`

## How it Works

Reads text from `temp.txt`, streams audio segments using Kokoro TTS, saves them to disk, and merges them into a single wav file. 
Currently, merging can be done into `.wav`, `.mp3`, `.m4a`, or `.aac` files.

By default, the merged audio and its segments are saved as `.wav` files, and segments are kept after merging.

## Plans
I want to add a web interface to this tool, so that users can upload text files or just type into a text field, and download the merged audio.

Next up is to add a proper way to configure the tool, instead of hardcoding values in the code.

## License

MIT - Do whatever you want with it!
