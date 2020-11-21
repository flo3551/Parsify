import { DomainController } from "../controllers/domain.controller";

export class DomainsRoute {
    private app: any;
    private domainController: DomainController;

    constructor(app: any) {
        this.app = app;
        this.domainController = new DomainController();
        this._setupRoutes();
    }

    private _setupRoutes() {
        // this.app.get('/getDomainsList', this.domainController.getDomainsList.bind(this.domainController));
        this.app.get('/getDomainsForPage', this.domainController.getDomainsForPage.bind(this.domainController));
        this.app.get('/getDomainsCount', this.domainController.getDomainsCount.bind(this.domainController));
        this.app.get('/getDomainsScreenshot', this.domainController.getDomainsScreenshot.bind(this.domainController));
    }
}