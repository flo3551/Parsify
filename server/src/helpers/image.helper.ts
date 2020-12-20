
const sizeOf = require('image-size');
const sharp = require("sharp");
let fs = require('fs');

export class ImageHelper {
    private readonly MAX_SIZE_ALLOWED_BYTES = 1024000;
    constructor() { }

    public getImageDimensions(path: string): any {
        return new Promise((resolve: any, reject: any) => {
            sizeOf(path, (err: any, dimensions: any) => {
                return resolve({ width: dimensions.width, height: dimensions.height });
            });
        })
            .then((dimensions: any) => {
                return Promise.resolve(dimensions);
            })
            .catch((error: any) => {
                console.log("[LOG] [ERROR] Getting image dmmensions " + path, error);
            })
    }

    public cutImageHorizontally(path: string, fileName: string) {
        return this.getImageDimensions(path + fileName)
            .then((dimensions: any) => {

                let width = dimensions.width;
                let height = dimensions.height;
                let newHeight = Math.round(height / 3);
                let firstOutputFileName = "part1_" + fileName;
                let secondOutputFileName = "part2_" + fileName;
                let thirdOutputFileName = "part3_" + fileName;

                return Promise.all([
                    new Promise((resolve: any, reject: any) => {
                        this._extractImage(path + fileName, 0, width, newHeight, path + firstOutputFileName, resolve, reject)
                    }),
                    new Promise((resolve: any, reject: any) => {
                        this._extractImage(path + fileName, newHeight - 1, width, newHeight, path + secondOutputFileName, resolve, reject)
                    }),
                    new Promise((resolve: any, reject: any) => {
                        this._extractImage(path + fileName, (newHeight * 2) - 1, width, newHeight, path + thirdOutputFileName, resolve, reject)
                    })
                ])
                    .then(imagePartsPaths => {
                        fs.unlinkSync(path + fileName);
                        return imagePartsPaths;
                    }).catch(error => {
                        console.log("[LOG] [ERROR] Error splitting image in 3 parts", error);
                        return Promise.reject(error);
                    })
            })
    }

    private _extractImage(originalImagePath: string, top: number, width: number, height: number, outputFilePath: string, successCallback: any, failureCallback: any) {
        const image = sharp(originalImagePath);

        return new Promise((resolve: any, reject: any) => {
            image
                .extract({ left: 0, top: top, width: width - 1, height: height })
                .toFile(outputFilePath, (err: any, info: any) => {
                    if (err) {
                        console.log("[LOG] [ERROR] extracting image", err);
                        failureCallback(err);
                    }

                    return successCallback(outputFilePath);
                })
        });
    }

    private async _reduceQuality(imagePath: string, successCallback: any, failureCallback: any, currentQuality: number) {
        let newQuality = currentQuality - 2;
        const image = await sharp(imagePath)
            .png({
                quality: newQuality,
            })
            .toFile(imagePath, async (err: any, info: any) => {
                if (err) {
                    console.log(err);
                    failureCallback(err);
                }

                if (info.size >= this.MAX_SIZE_ALLOWED_BYTES) {
                    await this._reduceQuality(imagePath, successCallback, failureCallback, newQuality);
                }

                successCallback(imagePath);
            })
    }
}