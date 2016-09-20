declare module "jssha" {
    interface JSSha
    {
        update(text: string): void;
        
        getHash(outputFormat: "B64" | "HEX" | "BYTES", options?: { outputUpper?: boolean, b64Pad?: string }): string;
    }

    var JSSha: { new(algorithm: "SHA-1" | "SHA-256" | "SHA-512", inputFormat: "B64" | "TEXT" | "BYTES" | "HEX", options?: { encoding?: "UTF8" | "UTF16BE" | "UTF16LE", numRounds?: number }): JSSha };

    export = JSSha;
}