
import { DomainZone } from "../models/domain.model";
import { FileInfos } from "../models/file-infos.model";
const moment = require('moment');


export class FileInfosHelper {
    constructor() { }

    public isYesterdayFile(fileInfos: FileInfos) {
        let yesterdayDate = moment().subtract(1, 'days');
        let formattedDate;
        if (fileInfos.zone === DomainZone.FR) {
            formattedDate = moment(yesterdayDate).format("YYYYMMDD").toString();
        } else if (fileInfos.zone === DomainZone.INTER) {
            formattedDate = moment(yesterdayDate).format("YYYY-MM-DD").toString();
        }

        return fileInfos.filePath.includes(formattedDate);
    }
}