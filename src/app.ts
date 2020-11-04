let schedule = require('node-schedule');
import { DomainParserService } from './services/domain-parser.service';
import { DomainRetrieverService } from './services/domain-retriever.service';

export class App {
    private domainRetrieverService: DomainRetrieverService;
    private domainParserService: DomainParserService;

    constructor() {
        this.domainRetrieverService = new DomainRetrieverService();
        this.domainParserService = new DomainParserService();
    }

    public async init() {
        console.log("app inited");
        let domainRetrieverJob = schedule.scheduleJob('20 25 * * *', () => {
            console.log("domainRetrieverJob launched");
            this.domainRetrieverService.downloadYesterdayRegisteredDomains()
        });
    }
}