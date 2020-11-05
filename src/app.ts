let schedule = require('node-schedule');
import { DomainRetrieverService } from './services/domain-retriever.service';

export class App {
    private domainRetrieverService: DomainRetrieverService;

    constructor() {
        this.domainRetrieverService = new DomainRetrieverService();
    }

    public async init() {
        console.log("app inited");
        let domainRetrieverJob = schedule.scheduleJob('30 9 * * *', () => {
            console.log("domainRetrieverJob launched");
            this.domainRetrieverService.downloadYesterdayRegisteredDomains()
        });
    }
}