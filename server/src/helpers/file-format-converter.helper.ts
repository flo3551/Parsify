const request = require('request');
const fs = require('fs');

export class FileFormatConverter {
    public readonly ZAMZAR_API_KEY = "7e21d46eb174836c9ec8b2b86a3fd4291cba7ba6";

    constructor() { }

    public gifFileUrlToPng(url: string, outputFileNameWithoutExtension: string, outputFilePath: string) {
        return this._startZamzarConversionJob(url, 'png')
            .then((jobId: number) => {
                return this._getTargetFileId(jobId);
            })
            .then((targetFileId) => {
                if (!targetFileId) {
                    return Promise.reject("Conversion Job Error: no target file id found.");
                }

                return this._downloadPngFile(targetFileId, outputFileNameWithoutExtension, outputFilePath);
            })
            .catch(error => {
                return Promise.reject(error);
            })
    }

    private _startZamzarConversionJob(url: string, targettedFormat: string) {
        let formData = {
            source_file: url,
            target_format: targettedFormat
        };

        return new Promise((resolve: any, reject: any) => {
            request.post({ url: 'https://api.zamzar.com/v1/jobs/', formData: formData }, (error: any, response: any, JSONBody: any) => {
                if (error) {
                    reject(error);
                } else {
                    let body = JSON.parse(JSONBody);
                    resolve(body.id);
                }
            }).auth(this.ZAMZAR_API_KEY, '', true);
        })
            .then((jobId: any) => {

                return jobId;
            })
            .catch((error: any) => {
                console.log(error);
                Promise.reject(error);
            })
    }

    public _getTargetFileId(jobId: number) {
        return this._checkJobConversionStatus(jobId)
            .then((job: any) => {
                let jobConversion: JobConversion = job;

                return Promise.resolve(jobConversion.targetFiles[0].id)
            })
            .catch(error => {
                console.log(error);
                Promise.reject(error);
            })
    }

    public _checkJobConversionStatus(jobId: number) {
        let getJobStatusPromise = new Promise((resolve: any, reject: any) => {
            request.get('https://api.zamzar.com/v1/jobs/' + jobId, (error: any, response: any, JSONBody: any) => {
                if (error) {
                    reject(error);
                } else {
                    let body: any = JSON.parse(JSONBody);
                    let job: JobConversion = { status: body.status, targetFiles: body.target_files }

                    if (!this._hasConversionJobFinished(job)) {
                        this._handleCheckJobStatusRetry(resolve, reject, jobId);
                    } else {
                        job.status === "successful" ? resolve(job) : reject("job failed");
                    }
                }
            }).auth(this.ZAMZAR_API_KEY, '', true);
        })

        return getJobStatusPromise
            .then((job: any) => {
                return Promise.resolve(job);
            })
            .catch((error: any) => {
                console.log(error);
                Promise.reject(error);
            })
    }

    public _handleCheckJobStatusRetry(successCallback: any, failureCallback: any, jobId: any) {
        const wait = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));
        return wait(10 * 1000)
            .then(() => {
                return this._checkJobConversionStatus(jobId);
            })
            .then(job => {
                successCallback(job);
            })
            .catch(error => {
                failureCallback(error);
            })
    }

    public _hasConversionJobFinished(job: JobConversion) {
        console.log("jobStatus", job.status);

        let hasFinished;
        switch (job.status) {
            case "successful":
                hasFinished = true;
                break;
            case "failed":
                hasFinished = true;
                break;
            case "cancelled":
                hasFinished = true;
                break;
            default:
                hasFinished = false;
                break;
        }

        return hasFinished
    }

    public _downloadPngFile(fileId: number, outputFileName: string, outputPath: string) {
        let file = fs.createWriteStream(outputPath + outputFileName + '.png')

        return new Promise((resolve: any, reject: any) => {
            request.get({ url: 'https://api.zamzar.com/v1/files/' + fileId + '/content', followRedirect: false }, (err: any, response: any, body: any) => {
                if (err) {
                    console.error('Unable to download file:', err);
                    reject(err);
                } else {
                    // We are being redirected
                    if (response.headers.location) {
                        // Issue a second request to download the file
                        let fileRequest = request(response.headers.location);
                        fileRequest.on('response', (res: any) => {
                            res.pipe(file);
                            resolve();
                        });
                    } else {
                        resolve()
                    }
                }
            }).auth(this.ZAMZAR_API_KEY, '', true).pipe(file);
        })
    }
}

interface JobConversion {
    status: any,
    targetFiles: [{ id: number, name: string }],
}