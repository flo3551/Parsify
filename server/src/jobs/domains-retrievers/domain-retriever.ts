import { PuppeteerClusterFactory } from "../../factory/puppeteer-cluster.factory";
import { DomainsService } from "../../services/domains.service";
import { Domain } from "../../models/domain.model";
import { FileService } from "../../services/file.service";
import { FileInfos } from "../../models/file-infos.model";
let moment = require('moment');
let fs = require('fs');

export class DomainRetriever {
    protected fileService: FileService;
    protected domainsService: DomainsService;
    private puppeteerClusterFactory: any;

    protected readonly URL_PREFIX = "http://";
    protected readonly SHOPIFY_COOKIE_NAME = "_shopify_fs";

    constructor() {
        this.domainsService = new DomainsService();
        this.fileService = new FileService();
    }

    private async _initPuppeteerFactory() {
        this.puppeteerClusterFactory = await PuppeteerClusterFactory.getInstance();
    }

    protected _isShopifyDomain(page: any, domain: Domain) {
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

    protected async addDomainToClusterQueue(domain: Domain, line: number, filePath: string, fileInfos: FileInfos, dailyDomain: boolean) {
        if (!this.puppeteerClusterFactory) {
            await this._initPuppeteerFactory();
        }

        let cluster = dailyDomain ? this.puppeteerClusterFactory.clusterDailyJob : this.puppeteerClusterFactory.clusterSaverJob;

        if (cluster) {

            cluster.queue({ domain: domain, line: line, filePath: filePath, fileInfos: fileInfos }, async ({ page, data }: any) => {
                const { domain, line, filePath, fileInfos } = data;
                await page.setDefaultNavigationTimeout(5000);
                await page.setRequestInterception(true);

                page.on('request', (req: any) => {
                    // Disable page CSS / FONT / IMAGE to improve load speed
                    if (req.resourceType() == 'stylesheet' || req.resourceType() == 'font' || req.resourceType() == 'image') {
                        req.abort();
                    }
                    else {
                        req.continue();
                    }
                });

                this.fileService.updateParsedCount(line, filePath);

                await this._isShopifyDomain(page, domain)
                    .then((isShopify: boolean) => {
                        console.log("[LOG] ", domain.domainName + " => isShopify : " + isShopify);
                        if (isShopify) {
                            domain.lastTimeCheckedDate = moment().format("YYYY-MM-DD");
                            domain.isShopify = isShopify;

                            return this.domainsService.insertDomain(domain)
                        }
                    })
                    .then(() => {
                        console.log("[LOG] ", "[" + fileInfos.zone + "]" + "[" + fileInfos.filePath + "]: " + line + " domains checked of " + fileInfos.linesCount);

                        if (line === fileInfos.linesCount) {
                            fs.unlinkSync(filePath);
                        }
                    })
                    .catch(error => {
                        console.log("[LOG] [ERROR] Queing task for domain checking :", error);
                        console.error(error);
                    });


            })
        } else {
            console.log("[LOG] CLUSTER NOT LAUNCHED !")
        }
    }
}