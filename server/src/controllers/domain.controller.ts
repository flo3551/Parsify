import { Domain } from "src/models/domain.model";
import { DomainsService } from "../services/domains.service";
const puppeteer = require('puppeteer');

export class DomainController {
    private domainsService: DomainsService;

    constructor() {
        this.domainsService = new DomainsService();
    }

    public async getDomainsForPageAndFilters(req: any, res: any) {
        let page = parseInt(req.query.page);
        let nbResultsPerPage = parseInt(req.query.nbResultsPerPage);
        let offset = (nbResultsPerPage * page) - nbResultsPerPage;
        let exactDate = req.query.exactDate ? new Date(req.query.exactDate) : undefined;
        let minDate = req.query.minDate ? new Date(req.query.minDate) : undefined;
        let maxDate = req.query.maxDate ? new Date(req.query.maxDate) : undefined;
        let keyword = req.query.keyword ? encodeURIComponent(req.query.keyword.trim()) : undefined;
        let zone = (req.query.zone && req.query.zone !== "-1") ? encodeURIComponent(req.query.zone.trim()) : undefined;
        let isSearchFavoritesDomains = (req.query.searchFavoritesDomains === "true");

        if (isSearchFavoritesDomains) {
            this.getFavoritesDomains(req, res);
        } else {
            this.domainsService.selectRangeDomainsWithFilters(offset, nbResultsPerPage, keyword, zone, exactDate, minDate, maxDate)
                .then((domains: any) => {
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
    }

    public async getFavoritesDomains(req: any, res: any) {
        let userLogin = req.query.userLogin;
        if (!userLogin) {
            return res.status(400).json({
                text: "Requête invalide: il manque le paramètre 'login'."
            });
        }

        this.domainsService.getFavoritesDomains(userLogin)
            .then((domainsList: any) => {
                return res.status(200).json({
                    domainsList: domainsList
                });
            })
            .catch((error: any) => {
                return res.status(500).json(
                    { error: "Erreur lors de la récupération des stores favoris" }
                )
            })
    }

    public async getDomainsCount(req: any, res: any) {
        let exactDate = req.query.exactDate ? new Date(req.query.exactDate) : undefined;
        let minDate = req.query.minDate ? new Date(req.query.minDate) : undefined;
        let maxDate = req.query.maxDate ? new Date(req.query.maxDate) : undefined;
        let keyword = req.query.keyword ? encodeURIComponent(req.query.keyword.trim()) : undefined;
        let zone = (req.query.zone && req.query.zone !== "-1") ? encodeURIComponent(req.query.zone.trim()) : undefined;
        let isSearchFavoritesDomains = (req.query.searchFavoritesDomains === "true");

        if (isSearchFavoritesDomains) {
            this.getCountFavoritesDomains(req, res);
        } else {
            this.domainsService.countDomainsWithFilters(keyword, zone, exactDate, minDate, maxDate)
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
    }

    public async getCountFavoritesDomains(req: any, res: any) {
        let userLogin = req.query.userLogin;
        if (!userLogin) {
            return res.status(400).json({
                text: "Requête invalide: il manque le paramètre 'login'."
            });
        }

        this.domainsService.countDomainsFavorites(userLogin)
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

    public async isDomainFavorited(req: any, res: any) {
        let userLogin = req.query.userLogin;
        let domainName = req.query.domainName;

        if (!userLogin || !domainName) {
            return res.status(400).json({
                text: "Requête invalide: il manque le paramètre 'login' ou 'nom du store'."
            });
        }

        this.domainsService.getCountDomainsFavoriteMatchs(userLogin, domainName)
            .then((nbDomains: any) => {
                return res.status(200).json({
                    isFavorited: nbDomains > 0 ? true : false
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

    public addFavoriteDomain(req: any, res: any) {
        const { userLogin, domainName } = req.body;
        console.log(req.body);

        if (!userLogin || !domainName) {
            console.log("error", userLogin, domainName);

            return res.status(400).json({
                text: "Requête invalide: il manque le paramètre 'login' ou 'domainName'."
            });
        }

        this.domainsService.addDomainToFavorites(userLogin, domainName)
            .then((domainsList: any) => {
                return res.status(200);
            })
            .catch((error: any) => {
                return res.status(500).json(
                    { error: "Erreur lors de l'ajout d'un domaine aux favoris" }
                )
            })
    }

    public deleteFavoriteDomain(req: any, res: any) {
        const { userLogin, domainName } = req.body;
        if (!userLogin || !domainName) {
            return res.status(400).json({
                text: "Requête invalide: il manque le paramètre 'login' ou 'domainName'."
            });
        }

        this.domainsService.deleteDomainFromFavorites(userLogin, domainName)
            .then((domainsList: any) => {
                return res.status(200);
            })
            .catch((error: any) => {
                return res.status(500).json(
                    { error: "Erreur lors de la suppression d'un domaine aux favoris" }
                )
            })
    }
}