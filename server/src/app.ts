let schedule = require('node-schedule');
import { FileInfosHelper } from './helpers/file-infos.helper';
import { AfnicDomainRetrieverService } from './jobs/domains-retrievers/afnic-domain-retriever.job';
import { WhoIsDownloadDomainRetrieverService } from './jobs/domains-retrievers/whoisdownload-domain-retriever.job';
import { DomainZone } from './models/domain.model';
import { FileInfos } from './models/file-infos.model';
import { FileService } from './services/file.service';

export class App {
    private fileService: FileService;
    private fileInfosHelper: FileInfosHelper;

    constructor() {
        this.fileService = new FileService();
        this.fileInfosHelper = new FileInfosHelper();
    }

    public async init() {
        let domainRetrieverJob = schedule.scheduleJob('08 23 * * *', async () => {
            let afnic_domainRetrieverService = new AfnicDomainRetrieverService();
            await afnic_domainRetrieverService.downloadYesterdayRegisteredDomains();
            let whoIsDownload_domainRetrieverService = new WhoIsDownloadDomainRetrieverService();
            whoIsDownload_domainRetrieverService.downloadYesterdayRegisteredDomains();
        });

        this.restartParsingInProgress();
    }

    private restartParsingInProgress() {
        this.fileService.getFilesInProgress()
            .then(async (filesInfos: FileInfos[]) => {
                let listFileInProgress = filesInfos;
                console.log(listFileInProgress.length + " files recovered");

                for (let file of listFileInProgress) {
                    if (this.fileInfosHelper.isYesterdayFile(file)) {
                        continue;
                    }
                    if (file.zone === DomainZone.FR) {
                        let afnic_domainRetrieverService = new AfnicDomainRetrieverService();
                        await afnic_domainRetrieverService.readTxtFile(file.filePath, false);
                    } else if (file.zone === DomainZone.INTER) {
                        let whoIsDownload_domainRetrieverService = new WhoIsDownloadDomainRetrieverService();
                        await whoIsDownload_domainRetrieverService.readTxtFile(file.filePath, false);
                    }
                }
            })
            .catch(error => {
                console.log("Error retrieving files in progress", error);
            })
    }
}