let schedule = require('node-schedule');
import { DomainRetrieverService } from './services/domain-retriever.service';

export class App {

    public async init() {
        console.log("[LOG] ", "app inited");
        let domainRetrieverJob = schedule.scheduleJob('50 19 * * *', () => {
            let domainRetrieverService = new DomainRetrieverService();
            domainRetrieverService.downloadYesterdayRegisteredDomains();
        });
    }
}