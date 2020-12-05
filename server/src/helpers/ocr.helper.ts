let fs = require('fs');
let FormData = require('form-data');
const axios = require('axios')

export class OCRHelper {
    private readonly OCR_API_KEY = "16dcd8d84b88957";

    private readonly OCR_API_ENDPOINT = "https://api.ocr.space/parse/image";
    constructor() { }

    public async saveTextFromImages(filePaths: string[], outputFile: string) {
        let promisesStack = [];

        for (let path of filePaths) {
            promisesStack.push(this.callOcrApi(path, outputFile));
        }

        return Promise.all(promisesStack)
            .then(() => {
                for (let path of filePaths) {
                    fs.unlinkSync(path);
                }
            })
            .catch(error => {
                console.log(error);
            })
    }

    public callOcrApi(filePath: string, outputFile: string) {
        let data = new FormData();

        return new Promise((resolve: any, reject: any) => {
            data.append('file', fs.createReadStream(filePath));
            data.append('scale', 'true');
            data.append('filetype', 'png');

            let config = {
                method: 'post',
                url: this.OCR_API_ENDPOINT,
                headers: {
                    'apikey': this.OCR_API_KEY,
                    ...data.getHeaders()
                },
                data: data
            };


            axios(config)
                .then((response: any) => {
                    if (response.data.IsErroredOnProcessing) {
                        reject(response.data);
                    }
                    let textData = response.data.ParsedResults[0].ParsedText;
                    fs.writeFileSync(outputFile, textData, { flag: 'a' });
                    resolve();
                })
                .catch((error: any) => {
                    console.log(error);
                    reject(error);
                });
        });
    }
}