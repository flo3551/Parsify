import { Domain } from "src/models/domain.model";
import { DomainsService } from "../services/domains.service";
const puppeteer = require('puppeteer');

export class DomainController {
    private domainsService: DomainsService;

    constructor() {
        this.domainsService = new DomainsService();
    }

    // public async getDomainsList(req: any, res: any) {
    //     this.domainsService.selectDomainsList()
    //         .then((domains: Domain[]) => {
    //             return res.status(200).json({
    //                 domainsList: domains
    //             });
    //         })
    //         .catch((error: any) => {
    //             res.status(500).json(
    //                 { error: "Erreur lors de la récupération des stores" }
    //             )
    //         })
    // }

    public async getDomainsForPage(req: any, res: any) {
        let page = parseInt(req.query.page);
        let nbResultsPerPage = parseInt(req.query.nbResultsPerPage);
        let offset = (nbResultsPerPage * page) - nbResultsPerPage;

        this.domainsService.selectRangeDomains(offset, nbResultsPerPage)
            .then((domains: Domain[]) => {
                return res.status(200).json({
                    domainsList: domains
                });
            })
            .catch((error: any) => {
                res.status(500).json(
                    { error: "Erreur lors de la récupération des stores" }
                )
            })
    }

    public async getDomainsCount(req: any, res: any) {
        this.domainsService.countDomains()
            .then((nbDomains: any) => {
                return res.status(200).json({
                    domainsCount: nbDomains
                });
            })
            .catch((error: any) => {
                return res.status(500).json(
                    { error: "Erreur lors de la récupération des stores" }
                )
            })
    }

    public async getDomainsScreenshot(req: any, res: any) {
        let domainName = req.query.domainName;

        let browser = await puppeteer.launch({
            headless: true,
            args: ['--no-sandbox']
        });
        let page = await browser.newPage();

        return page.goto("http://" + domainName)
            .then(() => {

                return page.screenshot({ encoding: "base64" })
            })
            .then((base64: any) => {
                browser.close();

                return res.status(200).json({
                    b64screenshot: base64,
                    domainName: domainName
                });
            })
            .catch((error: any) => {
                browser.close();

                return res.status(500).json(
                    { error: "Erreur lors de la récupération du screenshot" }
                )
            });
    }
}