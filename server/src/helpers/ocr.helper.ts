let fs = require('fs');
let FormData = require('form-data');
const axios = require('axios')

export class OCRHelper {
    private readonly OCR_API_KEY = "16dcd8d84b88957";

    private readonly OCR_API_ENDPOINT = "https://api.ocr.space/parse/image";
    constructor() { }

    public async saveTextFromImages(filePaths: string[], outputFile: string) {
        console.log(outputFile);
        filePaths = [
            '/tmp/part1_20201208_CREA_fr.png',
            '/tmp/part2_20201208_CREA_fr.png',
            '/tmp/part3_20201208_CREA_fr.png'
        ]
        let promisesStack = [];
        // console.log("filePaths : ", filePaths);

        for (let path of filePaths) {
            promisesStack.push(this.createCallOcrApi(path, outputFile));
            // this.callOcrApi(path, outputFile)
            //     .then(() => {
            //         for (let path of filePaths) {
            //             fs.unlinkSync(path);
            //         }
            //     })
            //     .catch(error => {
            //         console.log(error);
            //     })
        }

        return this._executeQueuingPromises(promisesStack)
            .then(() => {
                console.log("FINISHED !");

            })
            .catch((error: any) => {
                console.log(error);
            })
        // return Promise.all(promisesStack)
        //     .then(() => {
        //         for (let path of filePaths) {
        //             fs.unlinkSync(path);
        //         }
        //     })
        //     .catch(error => {
        //         console.log(error);
        //     })
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

            console.log("call OCR ", filePath);

            return new Promise((resolve: any, reject: any) => {
                console.log("promise CALL OCR");

                data.append('file', fs.createReadStream(filePath));
                data.append('scale', 'true');
                data.append('filetype', 'png');
                data.append('OCREngine', 1);

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
                        console.log("call over");

                        if (response.data.IsErroredOnProcessing) {
                            return Promise.reject(response.data);
                        }
                        let textData = response.data.ParsedResults[0].ParsedText;
                        console.log("before write file ");

                        fs.writeFileSync(outputFile, textData, { flag: 'as' });
                        console.log("after write file ");

                        resolve();
                    })
                    .catch((error: any) => {
                        console.log("call error");

                        console.log(error);
                        reject(error);
                    });
            });
        }
    }
}