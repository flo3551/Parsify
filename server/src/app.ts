let schedule = require('node-schedule');
import { FileInfosHelper } from './helpers/file-infos.helper';
import { DomainZone } from './models/domain.model';
import { FileInfos } from './models/file-infos.model';
import { AfnicDomainRetrieverService } from './services/afnic-domain-retriever.service';
import { FileService } from './services/file.service';
import { WhoIsDownloadDomainRetrieverService } from './services/whoisdownload-domain-retriever.service';

export class App {
    private fileService: FileService;
    private fileInfosHelper: FileInfosHelper;

    constructor() {
        this.fileService = new FileService();
        this.fileInfosHelper = new FileInfosHelper();
    }
    public async init() {
        let domainRetrieverJob = schedule.scheduleJob('11 10 * * *', () => {
            let afnic_domainRetrieverService = new AfnicDomainRetrieverService();
            afnic_domainRetrieverService.downloadYesterdayRegisteredDomains();
            let whoIsDownload_domainRetrieverService = new WhoIsDownloadDomainRetrieverService();
            whoIsDownload_domainRetrieverService.downloadYesterdayRegisteredDomains();
        });
        // let ocrHelper = new OCRHelper();
        // ocrHelper.saveTextFromImages([], "/tmp/20201208_CREA_fr.txt");

        this.restartParsingInProgress();
    }

    private restartParsingInProgress() {
        this.fileService.getFilesInProgress()
            .then((filesInfos: FileInfos[]) => {
                let listFileInProgress = filesInfos;
                console.log(listFileInProgress.length + " files recovered");

                for (let file of listFileInProgress) {
                    if (this.fileInfosHelper.isYesterdayFile(file)) {
                        continue;
                    }
                    if (file.zone === DomainZone.FR) {
                        let afnic_domainRetrieverService = new AfnicDomainRetrieverService();
                        afnic_domainRetrieverService.readTxtFile(file.filePath);
                        afnic_domainRetrieverService
                    } else if (file.zone === DomainZone.INTER) {
                        let whoIsDownload_domainRetrieverService = new WhoIsDownloadDomainRetrieverService();
                        whoIsDownload_domainRetrieverService.readTxtFile(file.filePath);
                    }
                }
            })
            .catch(error => {
                console.log("Error retrieving files in progress");
            })
    }
}