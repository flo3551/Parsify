import { domain } from "process";
import { Domain } from "src/models/domain.model";
import { DomainsService } from "../services/domains.service";

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
        console.log(offset);
        console.log(nbResultsPerPage);
        console.log(page);
        
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
                res.status(500).json(
                    { error: "Erreur lors de la récupération des stores" }
                )
            })
    }
}