let fs = require('fs');
let FormData = require('form-data');
const axios = require('axios')

export class OCRHelper {
    private readonly OCR_API_KEY = "16dcd8d84b88957";
    // private readonly OCR_API_KEY = "f0e98fa7cc88957";
    // private readonly OCR_API_KEY = "4f4f70b8f388957";
    // private readonly OCR_API_KEY = "aad9ce26c188957";

    private readonly OCR_API_ENDPOINT = "https://api.ocr.space/parse/image";
    constructor() { }

    public async saveTextFromImages(filePaths: string[], outputFile: string) {
        let promisesStack = [];

        for (let path of filePaths) {
            promisesStack.push(this.createCallOcrApi(path, outputFile));
        }

        return this._executeQueuingPromises(promisesStack)
            .catch((error: any) => {
                console.log("[LOG] [ERROR] saveTextFromImages ", error);
            })
    }

    private _executeQueuingPromises(promiseStack: any[]) {
        if (!promiseStack.length) {
            return;
        }

        return promiseStack.shift()()
            .then(() => {
                return this._executeQueuingPromises(promiseStack);
            });
    }

    public createCallOcrApi(filePath: string, outputFile: string) {
        return () => {
            let data = new FormData();
            return new Promise((resolve: any, reject: any) => {
                data.append('file', fs.createReadStream(filePath));
                data.append('scale', 'true');
                data.append('filetype', 'png');
                // data.append('OCREngine', 1);

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
                            return Promise.reject(response.data);
                        }
                        let textData = response.data.ParsedResults[0].ParsedText;
                        fs.writeFileSync(outputFile, textData, { flag: 'as' });

                        resolve();
                    })
                    .catch((error: any) => {
                        console.log("[LOG] [ERROR] Axios Call OCR ", error);
                        reject(error);
                    });
            })
                .catch(error => {
                    console.log("[LOG] [ERROR] Create Call OCR API ", error);
                });
        }
    }
}