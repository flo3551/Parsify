import { FileInfosHelper } from "../../src/helpers/file-infos.helper"
import { expect } from "chai";
import { FileInfos } from "../../src/models/file-infos.model";
const moment = require('moment');

describe("FileInfosHelper", () => {
    it("Should say if a file contains yesterday date", () => {
        const fileInfosHelper = new FileInfosHelper();

        let yesterdayDate = moment().subtract(1, 'days');
        let beforeYesterdayDate = moment().subtract(2, 'days');

        let internationalFile = new FileInfos("/tmp/domain-names" + moment(yesterdayDate).format("YYYY-MM-DD").toString() + ".txt", 0, 0, "inter");
        let frFile = new FileInfos("/tmp/" + moment(yesterdayDate).format("YYYYMMDD").toString() + "_CREA_fr.txt", 0, 0, "fr");
        let befoyreYesterdayFile = new FileInfos("/tmp/" + moment(beforeYesterdayDate).format("YYYYMMDD").toString() + "_CREA_fr.txt", 0, 0, "fr");

        expect(fileInfosHelper.isYesterdayFile(internationalFile)).to.be.true;
        expect(fileInfosHelper.isYesterdayFile(frFile)).to.be.true;
        expect(fileInfosHelper.isYesterdayFile(befoyreYesterdayFile)).to.be.false;
    });
});