import { FileFormatConverter } from "../../helpers/file-format-converter.helper";
import { ImageHelper } from "../../helpers/image.helper";
import { OCRHelper } from "../../helpers/ocr.helper";
import { Domain, DomainZone } from "../../models/domain.model";
import { FileInfos } from "../../models/file-infos.model";
import { DomainRetriever } from "./domain-retriever";

const fs = require('fs');
const moment = require('moment');
const readline = require('readline');

export class AfnicDomainRetrieverService extends DomainRetriever {
    private ocrHelper: OCRHelper;
    private fileFormatConverterHelper: FileFormatConverter;
    private imageHelper: ImageHelper;

    private readonly DOMAINS_LIST_DOWNLOAD_URL_FIRST_PART = "https://www.afnic.fr/data/divers/public/publication-quotidienne/";
    private readonly DOMAINS_LIST_DOWNLOAD_URL_SECOND_PART = "_CREA_fr";
    private readonly DOWNLOADED_FILE_OUTPUT_DIR = "/tmp/"
    private readonly DOWNLOADED_FILE_EXTENSION = ".gif";
    private readonly TXT_FILE_EXTENSION = ".txt";
    private readonly PNG_FILE_EXTENSION = ".png";

    public downloadedFileNameGifExtension: string = '';
    public downloadedFileNameNoExtension: string = '';
    public dateRegistrationDomain: any;

    constructor() {
        super();
        this.ocrHelper = new OCRHelper();
        this.fileFormatConverterHelper = new FileFormatConverter()
        this.imageHelper = new ImageHelper();
    }

    public async downloadYesterdayRegisteredDomains() {
        let url = this.prepareUrl();
        await this.fileFormatConverterHelper.gifFileUrlToPng(url, this.downloadedFileNameNoExtension, this.DOWNLOADED_FILE_OUTPUT_DIR)
            .then(() => {
                return this.imageHelper.cutImageHorizontally(this.DOWNLOADED_FILE_OUTPUT_DIR, this.downloadedFileNameNoExtension + this.PNG_FILE_EXTENSION);
            })
            .then((imagePartsPaths: any) => {
                return this.ocrHelper.saveTextFromImages(imagePartsPaths, this.DOWNLOADED_FILE_OUTPUT_DIR + this.downloadedFileNameNoExtension + this.TXT_FILE_EXTENSION);
            })
            .then(() => {
                this.readTxtFile(this.DOWNLOADED_FILE_OUTPUT_DIR + this.downloadedFileNameNoExtension + this.TXT_FILE_EXTENSION);
            })
            .catch(error => {
                console.log("[LOG] [ERROR] Download AFNIC domains " + this.dateRegistrationDomain.toString(), error);
            })
    }

    public async readTxtFile(filePath: string, dailyDomain = true) {
        let fileInfos: FileInfos = await this.fileService.getFileInfos(filePath, DomainZone.FR);

        if (fileInfos != null) {
            const fileStream = fs.createReadStream(filePath);
            const rl = readline.createInterface({
                input: fileStream,
                crlfDelay: Infinity
            });

            let parsedCount = fileInfos.parsedCount;
            let lineIndex = 0;
            for await (const line of rl) {
                // check line don't start with * or #
                if (lineIndex > parsedCount && !(line.startsWith("*") | line.startsWith("#"))) {
                    // check domain spelling
                    let domain = this._getFormattedDomainName(line);

                    if (domain && domain !== null) {
                        await this.addDomainToClusterQueue(domain, lineIndex, filePath, fileInfos, dailyDomain);
                    }

                }
                lineIndex++;
            }
        } else {
            console.log("File infos not found for ", filePath);
        }
    }

    private _getFormattedDomainName(line: string) {
        let domain = null
        if (line != null && line.length > 4) {
            let formattedDomain;
            let domainThreeLastChar = line.substring(line.length - 3, line.length);
            switch (domainThreeLastChar) {
                case ".fr":
                    formattedDomain = line;
                    break;
                case " fr":
                    formattedDomain = line.replace(" fr", ".fr");
                    break;
                default:
                    // case missing '.'
                    formattedDomain = line.substring(0, (line.length - 2)).concat(".fr");
            }

            domain = new Domain(formattedDomain, this.dateRegistrationDomain, '', false, 0, DomainZone.FR);
        }

        return domain;
    }

    private prepareUrl() {
        let yesterdayDate = moment().subtract(1, 'days');
        let formattedDate = moment(yesterdayDate).format("YYYYMMDD").toString();
        this.downloadedFileNameGifExtension = formattedDate + this.DOMAINS_LIST_DOWNLOAD_URL_SECOND_PART + this.DOWNLOADED_FILE_EXTENSION;
        this.downloadedFileNameNoExtension = formattedDate + this.DOMAINS_LIST_DOWNLOAD_URL_SECOND_PART;
        this.dateRegistrationDomain = yesterdayDate.format("YYYY-MM-DD");

        return this.DOMAINS_LIST_DOWNLOAD_URL_FIRST_PART + this.downloadedFileNameGifExtension;
    }
}