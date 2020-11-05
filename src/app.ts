let schedule = require('node-schedule');
import { DomainRetrieverService } from './services/domain-retriever.service';

export class App {
    private domainRetrieverService: DomainRetrieverService;

    constructor() {
        this.domainRetrieverService = new DomainRetrieverService();
    }

    public async init() {
        console.log("[LOG] ","app inited");
        let domainRetrieverJob = schedule.scheduleJob('40 23 * * *', () => {
            console.log("[LOG] ", "domainRetrieverJob launched");
            this.domainRetrieverService.downloadYesterdayRegisteredDomains()
        });
    }
}