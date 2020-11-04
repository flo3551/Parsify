import { Domain } from "../models/domain.model";
import { DomainsService } from "./domains.service";
const puppeteer = require('puppeteer');

let http = require('http');
let fs = require('fs');
let moment = require('moment');
let unzipper = require('unzipper');
let readline = require('readline');

export class DomainRetrieverService {
    private domainsService: DomainsService;

    private readonly DOMAINS_LIST_DOWNLOAD_URL_FIRST_PART = "http://www.whoisdownload.com/download-panel/free-download-file/";
    private readonly DOMAINS_LIST_DOWNLOAD_URL_SECOND_PART = "/nrd/home";
    private readonly DOWNLOADED_FILE_OUTPUT_DIR = "/tmp/"
    private readonly DOWNLOADED_FILE_EXTENSION = ".zip";
    private readonly DOWNLOADED_TXT_FILE_NAME = "domain-names.txt";
    private readonly SHOPIFY_COOKIE_NAME = "_shopify_fs";
    private readonly URL_PREFIX = "http://"
    public downloadedFileName: string = '';

    constructor() {
        this.domainsService = new DomainsService();
    }

    public downloadYesterdayRegisteredDomains() {
        let url = this.prepareUrl();
        let outputPath = this.DOWNLOADED_FILE_OUTPUT_DIR + this.downloadedFileName
        let file = fs.createWriteStream(outputPath);

        http.get(url, (response: any) => {
            response.pipe(file);
            file.on('finish', async () => {
                file.close(this.unzipFile(outputPath));  // close() is async, call cb after close completes.
            });
        }).on('error', function (err: any) {
            // Handle errors
            console.log("download error");
        });
    }

    private async unzipFile(path: string) {
        const zip = fs.createReadStream(path).pipe(unzipper.Parse({ forceStream: true }));
        for await (const entry of zip) {
            const fileName = entry.path;
            if (fileName === this.DOWNLOADED_TXT_FILE_NAME) {
                let txtFilePath = this.DOWNLOADED_FILE_OUTPUT_DIR + this.DOWNLOADED_TXT_FILE_NAME
                entry.pipe(fs.createWriteStream(txtFilePath));

                await this.readTxtFile(txtFilePath);
            } else {
                entry.autodrain();
            }
        }
    }

    private async readTxtFile(filePath: string) {
        const fileStream = fs.createReadStream(filePath);
        const rl = readline.createInterface({
            input: fileStream,
            output: fileStream,
            crlfDelay: Infinity
        });

        let date = moment().subtract(1, 'days').format("YYYY-DD-MM");
        let browser = await puppeteer.launch();
        let page = await browser.newPage();

        for await (const line of rl) {
            let domain = new Domain(line, date, '', false, 0);
            this._isShopifyDomain(page, domain)
                .then((isShopify: boolean) => {
                    domain.lastTimeCheckedDate = moment().format("YYYY-DD-MM");
                    domain.isShopify = isShopify;
                    console.log(domain.domainName + " => isShopify : " + isShopify);
                    this.domainsService.queuedDomainInsert.push(domain);
                    this.domainsService.queuingInsertDomain();
                })
        }
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
                console.log(cookies);

                let shopifyCookieIndex = cookies.findIndex((cookie: any) => cookie.name === this.SHOPIFY_COOKIE_NAME);
                return Promise.resolve(shopifyCookieIndex !== -1);
            })
            .catch((error: any) => {
                return Promise.resolve(false);
            });
    }

    private prepareUrl() {
        let yesterdayDate = moment().subtract(1, 'days');
        let formattedDate = moment(yesterdayDate).format("YYYY-MM-DD").toString();
        this.downloadedFileName = formattedDate + this.DOWNLOADED_FILE_EXTENSION;

        return this.DOMAINS_LIST_DOWNLOAD_URL_FIRST_PART + Buffer.from(this.downloadedFileName).toString('base64') + this.DOMAINS_LIST_DOWNLOAD_URL_SECOND_PART;
    }
}