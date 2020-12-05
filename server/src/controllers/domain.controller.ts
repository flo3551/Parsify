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


    public async getFilteredDomains(req: any, res: any) {
        try {
            let nbResultsPerPage = parseInt(req.query.nbResultsPerPage);

            let exactDate = req.query.exactDate ? new Date(req.query.exactDate) : undefined;
            let minDate = req.query.minDate ? new Date(req.query.minDate) : undefined;
            let maxDate = req.query.maxDate ? new Date(req.query.maxDate) : undefined;
            let keyword = req.query.keyword ? encodeURIComponent(req.query.keyword.trim()) : undefined;
            let zone = req.query.zone ? encodeURIComponent(req.query.zone.trim()) : undefined;

            this.domainsService.selectFilteredDomains(nbResultsPerPage, exactDate, minDate, maxDate, keyword, zone)
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
        } catch (error) {
            console.log(error);
        }
    }

    public async getCountFilteredDomains(req: any, res: any) {
        let exactDate = new Date(req.query.exactDate);
        let minDate = new Date(req.query.minDate);
        let maxDate = new Date(req.query.maxDate);
        let keyword = req.query.keyword;

        this.domainsService.countFilteredDomains(exactDate, minDate, maxDate, keyword)
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