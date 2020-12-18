const readline = require('readline');
const fs = require('fs');

export class FileInfos {
    public filePath: string;
    public linesCount: number;
    public parsedCount: number;
    public zone: string;

    constructor(filePath: string, linesCount: number, parsedCount: number, zone: string) {
        this.filePath = filePath;
        this.linesCount = linesCount;
        this.parsedCount = parsedCount;
        this.zone = zone;
    }

    public static async countFileLines(filePath: string) {
        const fileStream = fs.createReadStream(filePath);
        const rl = readline.createInterface({
            input: fileStream,
            crlfDelay: Infinity
        });
        let linesCount = 0;

        for await (const line of rl) {
            linesCount++;
        }

        return linesCount;
    }
}