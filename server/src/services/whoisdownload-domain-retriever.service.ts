import { FileInfos } from "src/models/file-infos.model";
import { Domain, DomainZone } from "../models/domain.model";
import { DomainsService } from "./domains.service";
import { FacebookPageService } from "./facebook-page.service";
import { FileService } from "./file.service";
var exec = require('child_process').exec;
const puppeteer = require('puppeteer');
let http = require('http');
let fs = require('fs');
let moment = require('moment');
let unzipper = require('unzipper');
let readline = require('readline');

export class WhoIsDownloadDomainRetrieverService {
    private domainsService: DomainsService;
    private facebookPageService: FacebookPageService;
    private fileService: FileService;

    private readonly DOMAINS_LIST_DOWNLOAD_URL_FIRST_PART = "http://www.whoisdownload.com/download-panel/free-download-file/";
    private readonly DOMAINS_LIST_DOWNLOAD_URL_SECOND_PART = "/nrd/home";
    private readonly DOWNLOADED_FILE_OUTPUT_DIR = "/tmp/"
    private readonly DOWNLOADED_FILE_EXTENSION = ".zip";
    private readonly DOWNLOADED_TXT_FILE_NAME = "domain-names";
    private readonly TXT_FILE_EXTENSION = ".txt";
    private readonly SHOPIFY_COOKIE_NAME = "_shopify_fs";
    private readonly URL_PREFIX = "http://";

    // LOGS
    private LOG_COUNTER_DOMAIN_CHECKED = 0;
    private LOG_COUNTER_SHOPIFY_FOUND = 0;
    public LOG_DATE_DOMAINS_CHECKED = null;

    public downloadedFileName: string = '';
    public dateRegistrationDomain: any;
    public nb: any;

    constructor() {
        this.domainsService = new DomainsService();
        this.facebookPageService = new FacebookPageService();
        this.fileService = new FileService();
    }

    public downloadYesterdayRegisteredDomains() {
        let url = this.prepareUrl();
        let outputPath = this.DOWNLOADED_FILE_OUTPUT_DIR + this.downloadedFileName
        let file = fs.createWriteStream(outputPath);

        http.get(url, (response: any) => {
            response.pipe(file);
            let _callback = () => this.unzipFile(outputPath);
            file.on('finish', async () => {
                file.close(_callback);  // close() is async, call cb after close completes.
            });
        }).on('error', function (err: any) {
            // Handle errors
            console.log("[LOG] ", "Download error");
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

        fs.unlink(this.DOWNLOADED_FILE_OUTPUT_DIR + this.downloadedFileName, () => { });
    }

    public async readTxtFile(filePath: string) {
        let browser = await puppeteer.launch({
            headless: true,
            args: ['--no-sandbox']
        });
        let page = await browser.newPage();
        let fileInfos: FileInfos = await this.fileService.getFileInfos(filePath, DomainZone.INTER);

        if (fileInfos != null) {
            const fileStream = fs.createReadStream(filePath);
            const rl = readline.createInterface({
                input: fileStream,
                crlfDelay: Infinity
            });

            let parsedCount = fileInfos.parsedCount; // 75 000
            let lineIndex = 0
            for await (const line of rl) {
                if (lineIndex > parsedCount) {
                    if (lineIndex % 100 === 0) {
                        // update db every 100lines parsed
                        this.fileService.updateParsedCount(lineIndex, filePath);
                    }
                    let domain = new Domain(line, this.dateRegistrationDomain, '', false, 0, DomainZone.INTER);

                    await this._isShopifyDomain(page, domain)
                        .then((isShopify: boolean) => {
                            console.log("[LOG] ", domain.domainName + " => isShopify : " + isShopify);
                            if (isShopify) {
                                this.LOG_COUNTER_SHOPIFY_FOUND++;
                                domain.lastTimeCheckedDate = moment().format("YYYY-MM-DD");
                                domain.isShopify = isShopify;

                                return this.domainsService.insertDomain(domain)
                            }
                        })
                        .then(() => {
                            if (domain.isShopify && domain.domainName) {
                                this.facebookPageService.searchPage(domain.domainName);
                            }
                            console.log("[LOG] ", "[" + fileInfos.zone + "]" + "[" + fileInfos.filePath + "]: " + lineIndex + " domains checked of " + fileInfos.linesCount + " >>>  " + this.LOG_COUNTER_SHOPIFY_FOUND + " shopify found");
                        });
                }
                lineIndex++;
            }

            this.fileService.updateParsedCount(lineIndex, filePath);

            fs.unlink(filePath, () => {
                console.log("done");
            })
        } else {
            console.log("File infos not found for ", filePath);
        }
        browser.close();
    }

    private _isShopifyDomain(page: any, domain: Domain) {
        return new Promise((resolve, reject) => {
            page.goto(this.URL_PREFIX + domain.domainName)
                .then(() => {
                    resolve(page.cookies());
                })
                .catch((error: any) => {
                    return reject(false);
                });
        })
            .then((cookies: any) => {
                let shopifyCookieIndex = cookies.findIndex((cookie: any) => cookie.name === this.SHOPIFY_COOKIE_NAME);
                return Promise.resolve(shopifyCookieIndex !== -1);
            })
            .catch((error: any) => {
                console.log("[LOG] ", "[Error Browsing] - ", domain.domainName)
                return Promise.resolve(false);
            });
    }

    private prepareUrl() {
        let yesterdayDate = moment().subtract(1, 'days');
        let formattedDate = moment(yesterdayDate).format("YYYY-MM-DD").toString();
        this.downloadedFileName = formattedDate + this.DOWNLOADED_FILE_EXTENSION;
        this.dateRegistrationDomain = yesterdayDate.format("YYYY-MM-DD");
        this.LOG_DATE_DOMAINS_CHECKED = formattedDate;

        return this.DOMAINS_LIST_DOWNLOAD_URL_FIRST_PART + Buffer.from(this.downloadedFileName).toString('base64') + this.DOMAINS_LIST_DOWNLOAD_URL_SECOND_PART;
    }
}