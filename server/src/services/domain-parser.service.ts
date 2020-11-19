// import { Domain } from "src/models/domain.model";
// import { DomainsService } from "./domains.service";
// const moment = require("moment");
// const puppeteer = require('puppeteer');

// export class DomainParserService {
//     private domainsService: DomainsService;
//     private readonly SHOPIFY_COOKIE_NAME = "_shopify_fs";
//     private readonly URL_PREFIX = "http://"
//     private readonly LIMIT_DOMAIN_TO_CHECK = 500;

//     constructor() {
//         this.domainsService = new DomainsService();
//     }

//     public async findShopifyDomains(dailyDomains: boolean) {
//         let nbDayAgo = 3;
//         let dailyCheckDone = false;
//         while (nbDayAgo > 0 || dailyCheckDone) {
//             console.log("===== DAY " + nbDayAgo + " =====")
//             let dateToCheck = dailyDomains ? moment() : moment().subtract(nbDayAgo, 'days');
//             let nbDomainToCheck = await this.domainsService.countDomainToCheck(dateToCheck, dailyDomains);
//             console.log("nbDomainToCheck", nbDomainToCheck);
//             let nbDomainChecked = 0;
//             let browser = await puppeteer.launch();
//             let page = await browser.newPage();

//             while (nbDomainToCheck > nbDomainChecked) {
//                 let domains: Domain[] = await this.domainsService.selectRangeDomainToCheck(dateToCheck, this.LIMIT_DOMAIN_TO_CHECK, nbDomainChecked, dailyDomains);

//                 for (let domain of domains) {
//                     // let isShopify = await this._isShopifyDomain(page, domain);
//                     this._isShopifyDomain(page, domain)
//                         .then((isShopify: boolean) => {
//                             domain.isShopify = isShopify;
//                             console.log(domain.domainName + " => isShopify : " + isShopify);

//                             this._updateDomain(domain);
//                         })
//                 }

//                 nbDomainChecked += this.LIMIT_DOMAIN_TO_CHECK;
//             }

//             dailyCheckDone = dailyDomains;
//             browser.close();
//             nbDayAgo--;
//         }
//     }

//     private _isShopifyDomain(page: any, domain: Domain) {
//         return new Promise((resolve, reject) => {
//             page.goto(this.URL_PREFIX + domain.domainName)
//                 .then(() => {
//                     resolve(page.cookies());
//                 })
//                 .catch((error: any) => {
//                     return reject(false);
//                 });
//         })
//             .then((cookies: any) => {
//                 console.log(cookies);

//                 let shopifyCookieIndex = cookies.findIndex((cookie: any) => cookie.name === this.SHOPIFY_COOKIE_NAME);
//                 return Promise.resolve(shopifyCookieIndex !== -1);
//             })
//             .catch((error: any) => {
//                 return Promise.resolve(false);
//             });
//     }

//     private _updateDomain(domain: Domain) {
//         domain.lastTimeCheckedDate = new Date().toString();
//         domain.numberChecked++;
//         this.domainsService.queuedDomainUpdate.push(domain);
//         this.domainsService.queuingUpdateDomain();
//     }
// }