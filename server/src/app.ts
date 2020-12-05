let schedule = require('node-schedule');
import { AfnicDomainRetrieverService } from './services/afnic-domain-retriever.service';
import { WhoIsDownloadDomainRetrieverService } from './services/whoisdownload-domain-retriever.service';
const { spawn } = require('child_process');

export class App {

    public async init() {
        let domainRetrieverJob = schedule.scheduleJob('00 22 * *', () => {
            let afnic_domainRetrieverService = new AfnicDomainRetrieverService();
            afnic_domainRetrieverService.downloadYesterdayRegisteredDomains();

            let whoIsDownload_domainRetrieverService = new WhoIsDownloadDomainRetrieverService();
            whoIsDownload_domainRetrieverService.downloadYesterdayRegisteredDomains();
        });
    }
}