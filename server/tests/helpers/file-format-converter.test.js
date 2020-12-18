import { expect } from "chai";
import { FileFormatConverter } from "../../src/helpers/file-format-converter.helper";
const fs = require('fs');
const moment = require('moment');

describe("FileFormatConverterHelper", () => {

    // TEST #1
    // it("Should convert a gif file to png (API)", () => {
    //     let fileFormatConverter = new FileFormatConverter();
    //     let isInError = false;
    //     let outpuleFilePath = "tests/resources/helpers/";
    //     let yesterdayDate = moment().subtract(1, 'days');
    //     let formattedDate = moment(yesterdayDate).format("YYYYMMDD").toString();
    //     let outputFileNoExtension = formattedDate + "_CREA_FR";
    //     let outputFileWithExtension = outputFileNoExtension + ".png";
    //     let gifFileUrl = "https://www.afnic.fr/data/divers/public/publication-quotidienne/";
    //     let fileNameSuffix = "_CREA_fr.gif";

    //     return fileFormatConverter.gifFileUrlToPng(gifFileUrl + formattedDate + fileNameSuffix, outputFileNoExtension, outpuleFilePath)
    //         .catch((error) => {
    //             isInError = true;
    //         })
    //         .then(() => {
    //             expect(isInError, "error during conversion").to.be.false;
    //             expect(fs.existsSync(outpuleFilePath + outputFileWithExtension), "downloaded file doesn't exists").to.be.true;

    //             fs.unlinkSync(outpuleFilePath + outputFileWithExtension);
    //             return Promise.resolve()
    //         })
    // })
});