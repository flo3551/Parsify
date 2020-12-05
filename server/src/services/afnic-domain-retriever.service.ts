import { ImageHelper } from "../helpers/image.helper";
import { FileFormatConverter } from "../helpers/file-format-converter.helper";
import { OCRHelper } from "../helpers/ocr.helper";
import { Domain, DomainZone } from "../models/domain.model";
import { DomainsService } from "./domains.service";
var exec = require('child_process').exec;

const puppeteer = require('puppeteer');
let fs = require('fs');
let moment = require('moment');
let readline = require('readline');

export class AfnicDomainRetrieverService {
    private domainsService: DomainsService;
    private ocrHelper: OCRHelper;
    private fileFormatConverterHelper: FileFormatConverter;
    private imageHelper: ImageHelper;

    private readonly DOMAINS_LIST_DOWNLOAD_URL_FIRST_PART = "https://www.afnic.fr/data/divers/public/publication-quotidienne/";
    private readonly DOMAINS_LIST_DOWNLOAD_URL_SECOND_PART = "_CREA_fr";
    private readonly DOWNLOADED_FILE_OUTPUT_DIR = "/tmp/"
    private readonly DOWNLOADED_FILE_EXTENSION = ".gif";
    private readonly TXT_FILE_EXTENSION = ".txt";
    private readonly PNG_FILE_EXTENSION = ".png";
    private readonly SHOPIFY_COOKIE_NAME = "_shopify_fs";
    private readonly URL_PREFIX = "http://";
    // private readonly OCR_API_KEY = "f0e98fa7cc88957";
    // private readonly OCR_API_KEY = "4f4f70b8f388957";
    // private readonly OCR_API_KEY = "aad9ce26c188957";


    // LOGS
    private LOG_COUNTER_DOMAIN_CHECKED = 0;
    private LOG_COUNTER_SHOPIFY_FOUND = 0;
    private LOG_DATE_DOMAINS_CHECKED = null;

    public downloadedFileNameGifExtension: string = '';
    public downloadedFileNameNoExtension: string = '';
    public dateRegistrationDomain: any;
    public nb: any;
    constructor() {
        this.domainsService = new DomainsService();
        this.ocrHelper = new OCRHelper();
        this.fileFormatConverterHelper = new FileFormatConverter()
        this.imageHelper = new ImageHelper();
    }

    public downloadYesterdayRegisteredDomains() {
        // let url = this.prepareUrl();
        // this.fileFormatConverterHelper.gifFileUrlToPng(url, this.downloadedFileNameNoExtension, this.DOWNLOADED_FILE_OUTPUT_DIR)
        //     .then(() => {

        //         return this.imageHelper.cutImageHorizontally(this.DOWNLOADED_FILE_OUTPUT_DIR, this.downloadedFileNameNoExtension + this.PNG_FILE_EXTENSION);
        //     })
        //     .then((imagePartsPaths: any) => {

        //         return this.ocrHelper.saveTextFromImages(imagePartsPaths, this.DOWNLOADED_FILE_OUTPUT_DIR + this.downloadedFileNameNoExtension + this.TXT_FILE_EXTENSION);
        //     })
        //     .then(() => {
        //         this.readTxtFile(this.DOWNLOADED_FILE_OUTPUT_DIR + this.downloadedFileNameNoExtension + this.TXT_FILE_EXTENSION);
        //     })
        //     .catch(error => {
        //         console.log(error);
        //     })
    }

    private async readTxtFile(filePath: string) {
        let browser = await puppeteer.launch({
            headless: true,
            args: ['--no-sandbox']
        });
        let page = await browser.newPage();

        // LOGS
        let nbDomainsToCheck: any;
        exec('wc -l /tmp/' + filePath, function (error: any, results: any) {
            nbDomainsToCheck = results;
        });

        const fileStream = fs.createReadStream(filePath);
        const rl = readline.createInterface({
            input: fileStream,
            crlfDelay: Infinity
        });

        for await (const line of rl) {
            // check domain spelling
            // check line don't start with * or #
            if (!(line.startsWith("*") | line.startsWith("#"))) {
                this.LOG_COUNTER_DOMAIN_CHECKED++;

                let domain = this._getFormattedDomainName(line);

                if (domain && domain !== null) {
                    await this._isShopifyDomain(page, domain)
                        .then((isShopify: boolean) => {
                            if (domain && domain !== null) {
                                console.log("[LOG] ", domain.domainName + " => isShopify : " + isShopify);
                                if (isShopify) {
                                    this.LOG_COUNTER_SHOPIFY_FOUND++;
                                    domain.lastTimeCheckedDate = moment().format("YYYY-MM-DD");
                                    domain.isShopify = isShopify;

                                    return this.domainsService.insertDomain(domain)
                                }
                            }
                        })
                        .then(() => {
                            console.log("[LOG] ", "[" + this.LOG_DATE_DOMAINS_CHECKED + "]: " + this.LOG_COUNTER_DOMAIN_CHECKED + " domains checked of" + nbDomainsToCheck + " >>>  " + this.LOG_COUNTER_SHOPIFY_FOUND + " shopify found");
                        });
                }

            }

        }

        browser.close();
        fs.unlinkSync(filePath);
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
        let yesterdayDate = moment().subtract(2, 'days');
        let formattedDate = moment(yesterdayDate).format("YYYYMMDD").toString();
        this.downloadedFileNameGifExtension = formattedDate + this.DOMAINS_LIST_DOWNLOAD_URL_SECOND_PART + this.DOWNLOADED_FILE_EXTENSION;
        this.downloadedFileNameNoExtension = formattedDate + this.DOMAINS_LIST_DOWNLOAD_URL_SECOND_PART;
        this.dateRegistrationDomain = yesterdayDate.format("YYYY-MM-DD");
        this.LOG_DATE_DOMAINS_CHECKED = formattedDate;

        return this.DOMAINS_LIST_DOWNLOAD_URL_FIRST_PART + this.downloadedFileNameGifExtension;
    }
}