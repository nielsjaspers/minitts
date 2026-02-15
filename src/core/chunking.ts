/**
 * Splits a given text into chunks of a maximum size.
 * 
 * @param text The text to split.
 * @param chunkSize The maximum size of a chunk. Default is 2000.
 * @param overlap The number of characters to overlap between chunks. Default is 0.
 * @returns An array of strings representing the chunks of the text.
 */
export function chunkText(text: string, chunkSize: number = 2000, overlap: number = 0): string[] {
    if (text.length <= chunkSize) {
        return [text];
    }
    
    const separators = ["\n\n", "\n", ".", "?", "!", " ", ""];
    
    let chunks: string[] = [];
    let start = 0;

    while (start < text.length) {
        const end = Math.min(start + chunkSize, text.length);
        
        if (end == text.length) {
            chunks.push(text.substring(start, end));
            break;
        }
        
        let splitAt = end;
        for (const sep of separators) {
            // we look for the separator in the last 20% of the chunk
            // this is to avoid tiny chunks if a paragraph is way too early.
            const searchStart = Math.max(start, end - Math.floor(chunkSize * 0.8));
            let found = text.indexOf(sep, searchStart);
            if (found !== -1) {
                splitAt = found + sep.length;
                break;
            }
        }
        
        chunks.push(text.substring(start, splitAt));
        start = splitAt - overlap;
    }
    
    return chunks;
}