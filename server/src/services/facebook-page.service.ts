import { MysqlHelper } from "../helpers/mysql.helper";
const puppeteer = require('puppeteer');
const fs = require('fs');
const configFacebook = JSON.parse(fs.readFileSync('/opt/config/config.facebook.json'));
const cookies = JSON.parse(fs.readFileSync('/opt/config/cookies-facebook.json'));

export class FacebookPageService {
    private db: MysqlHelper;

    private readonly SQL_INSERT_PAGE = "INSERT INTO facebook_page(pageName, pageLink, domainName) VALUES (?, ?, ?)"

    constructor() {
        this.db = new MysqlHelper();
    }

    public insertFacebookPage(pageName: string, pageLink: string, domainName: string) {
        return new Promise((resolve, reject) => {
            this.db.query(this.SQL_INSERT_PAGE, [pageName, pageLink, domainName], resolve, reject);
        })
            .catch((error: any) => {
                console.log("Error page insertion : ", error);
                Promise.reject(error);
            })
    }

    public async searchPage(domainName: string) {

        this._login()
            .then(async (results: any) => {
                let page = results.page;
                let browser = results.browser;
                let pageName = null;
                let pageLink = null;

                if (page && browser) {
                    try {
                        await page.goto("https://www.facebook.com/search/pages/?q=" + domainName, { waitUntil: "networkidle2" });

                        // Get First result page link
                        let searchResults = await page.$$("[role=\"article\"]");
                        let firstResultPageLink = await searchResults[0].$$("a");

                        // Get first result page name
                        let pageNameSpanElement = await firstResultPageLink[1].$$("span");
                        pageNameSpanElement = await pageNameSpanElement[0].getProperty("innerText");
                        pageName = pageNameSpanElement._remoteObject.value;

                        // Navigate to first results page link
                        const hrefAttr = await page.evaluate((el: any) => el.getAttribute("href"), firstResultPageLink[1]);
                        await page.goto(hrefAttr, { waitUntil: "networkidle2" });

                        // Get Page's website URL
                        let navigatedPageDomain = await page.$$("span>a[role='link']");
                        navigatedPageDomain = await navigatedPageDomain[0].getProperty("outerText");
                        navigatedPageDomain = navigatedPageDomain._remoteObject.value;

                        if (navigatedPageDomain.includes(domainName)) {
                            // it's domain's page
                            pageLink = hrefAttr;

                            this.insertFacebookPage(pageName, pageLink, domainName);

                        } else {
                            pageName = null;
                        }
                        browser.close()
                    } catch (error: any) {
                        console.log(error);
                        browser.close();
                        Promise.reject(error);
                    }
                } else {
                    console.log("error login");
                }
            })

    }

    private async _login() {
        let browser = await puppeteer.launch({
            headless: true,
            args: ['--no-sandbox']
        });

        const context = browser.defaultBrowserContext();
        context.overridePermissions("https://www.facebook.com", []);

        let page = await browser.newPage();
        await page.setDefaultNavigationTimeout(100000);
        await page.setViewport({ width: 1200, height: 800 });

        if (!Object.keys(cookies).length) {
            await page.goto("https://www.facebook.com/login", { waitUntil: "networkidle2" });
            const [acceptCookiesButton] = await page.$x("//button[contains(., 'Tout accepter')]");
            if (acceptCookiesButton) {
                await acceptCookiesButton.click();
            }
            await page.type("#email", configFacebook.username, { delay: 30 })
            await page.type("#pass", configFacebook.password, { delay: 30 })
            await page.click("#loginbutton");
            await page.waitForNavigation({ waitUntil: "networkidle0" });
            // await page.waitFor(5000);

            try {
                await page.waitFor('[placeholder="Rechercher sur Facebook"]');
            } catch (err) {
                console.log("failed to login");
                process.exit(0);
            }

            let currentCookies = await page.cookies();
            fs.writeFileSync('/opt/config/cookies-facebook.json', JSON.stringify(currentCookies));

        } else {
            //User Already Logged In
            await page.setCookie(...cookies);
            await page.goto("https://www.facebook.com/", { waitUntil: "networkidle2" });
        }

        return Promise.resolve({ page, browser });
    }
}