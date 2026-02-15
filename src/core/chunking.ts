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
    
    const separators = ["\n\n", "\n", ".", "?", "!", " "];
    
    let chunks: string[] = [];
    let start = 0;

    while (start < text.length) {
        const end = Math.min(start + chunkSize, text.length);
        
        if (end == text.length) {
            chunks.push(text.substring(start, end));
            break;
        }
        
        let splitAt = -1;
        const searchStart = Math.max(start, end - Math.floor(chunkSize * 0.2));

        // prefer the right-most separator in the tail window (last 20%).
        for (const sep of separators) {
            const found = text.lastIndexOf(sep, end - 1);
            if (found >= searchStart && found >= start) {
                splitAt = found + sep.length;
                break;
            }
        }

        // fallback: if no separator exists in the tail window, still avoid splitting
        // too early by picking the right-most separator before the chunk end.
        if (splitAt === -1) {
            for (const sep of separators) {
                const found = text.lastIndexOf(sep, end - 1);
                if (found >= start) {
                    splitAt = found + sep.length;
                    break;
                }
            }
        }

        // last resort: avoid splitting mid-word by extending to the next space.
        if (splitAt === -1) {
            const nextSpace = text.indexOf(" ", end);
            splitAt = nextSpace === -1 ? text.length : nextSpace + 1;
        }
        
        chunks.push(text.substring(start, splitAt));
        start = splitAt - overlap;
    }
    
    return chunks;
}
