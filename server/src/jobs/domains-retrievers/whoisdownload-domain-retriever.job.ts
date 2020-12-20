import { FileInfos } from "src/models/file-infos.model";
import { Domain, DomainZone } from "../../models/domain.model";
import { DomainRetriever } from "./domain-retriever";
let http = require('http');
let fs = require('fs');
let moment = require('moment');
let unzipper = require('unzipper');
let readline = require('readline');

export class WhoIsDownloadDomainRetrieverService extends DomainRetriever {
    private readonly DOMAINS_LIST_DOWNLOAD_URL_FIRST_PART = "http://www.whoisdownload.com/download-panel/free-download-file/";
    private readonly DOMAINS_LIST_DOWNLOAD_URL_SECOND_PART = "/nrd/home";
    private readonly DOWNLOADED_FILE_OUTPUT_DIR = "/tmp/"
    private readonly DOWNLOADED_FILE_EXTENSION = ".zip";
    private readonly DOWNLOADED_TXT_FILE_NAME = "domain-names";
    private readonly TXT_FILE_EXTENSION = ".txt";

    public downloadedFileName: string = '';
    public dateRegistrationDomain: any;

    constructor() {
        super();
    }

    public downloadYesterdayRegisteredDomains() {
        let url = this.prepareUrl();
        let outputPath = this.DOWNLOADED_FILE_OUTPUT_DIR + this.downloadedFileName
        let file = fs.createWriteStream(outputPath);

        http.get(url, (response: any) => {
            response.pipe(file);
            let _callback = () => this.unzipFile(outputPath);
            file.on('finish', async () => {
                file.close(_callback);
            });
        }).on('error', function (err: any) {
            // Handle errors
            console.log("[LOG] [ERROR] downloading .com file ", err);
        });
    }

    private async unzipFile(path: string) {
        const zip = fs.createReadStream(path).pipe(unzipper.Parse({ forceStream: true }));
        for await (const entry of zip) {
            const fileName = entry.path;

            if (fileName.includes(this.DOWNLOADED_TXT_FILE_NAME)) {
                let txtFilePath = this.DOWNLOADED_FILE_OUTPUT_DIR + this.DOWNLOADED_TXT_FILE_NAME + moment().subtract(1, 'days').format("YYYY-MM-DD") + this.TXT_FILE_EXTENSION;
                entry.pipe(fs.createWriteStream(txtFilePath));

                await this.readTxtFile(txtFilePath);
            } else {
                entry.autodrain();
            }
        }

        try {
            fs.unlink(this.DOWNLOADED_FILE_OUTPUT_DIR + this.downloadedFileName, () => { });
        } catch (error) {
            console.log("[LOG] [ERROR] Unzipping file" + path, error);
        }
    }

    public async readTxtFile(filePath: string, dailyDomain = true) {
        let fileInfos: FileInfos = await this.fileService.getFileInfos(filePath, DomainZone.INTER);

        if (fileInfos != null) {
            const fileStream = fs.createReadStream(filePath);
            const rl = readline.createInterface({
                input: fileStream,
                crlfDelay: Infinity
            });

            let parsedCount = fileInfos.parsedCount;
            let lineIndex = 0

            for await (const line of rl) {
                if (lineIndex > parsedCount) {
                    let domain = new Domain(line, this.dateRegistrationDomain, '', false, 0, DomainZone.INTER);
                    await this.addDomainToClusterQueue(domain, lineIndex, filePath, fileInfos, dailyDomain);
                }
                lineIndex++;
            }
        } else {
            console.log("[LOG] File infos not found for ", filePath);
        }
    }


    private prepareUrl() {
        let yesterdayDate = moment().subtract(1, 'days');
        let formattedDate = moment(yesterdayDate).format("YYYY-MM-DD").toString();
        this.downloadedFileName = formattedDate + this.DOWNLOADED_FILE_EXTENSION;
        this.dateRegistrationDomain = yesterdayDate.format("YYYY-MM-DD");

        return this.DOMAINS_LIST_DOWNLOAD_URL_FIRST_PART + Buffer.from(this.downloadedFileName).toString('base64') + this.DOMAINS_LIST_DOWNLOAD_URL_SECOND_PART;
    }
}