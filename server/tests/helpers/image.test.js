import { ImageHelper } from "../../src/helpers/image.helper"
import { expect } from "chai";

const moment = require('moment');
const fs = require('fs');

describe("ImageHelper", () => {
    let imageHelper = new ImageHelper();

    it("Should returns image dimensions", () => {
        imageHelper.getImageDimensions("tests/resources/helpers/100x100.png",)
            .then((dimensions) => {
                expect(dimensions.width, "Wrong image width.").to.be.equal(100);
                expect(dimensions.height, "Wrong image height").to.be.equal(100);
            })
    });

    it("Should cut image horizontally", () => {
        let filePath = "tests/resources/helpers/";
        let fileName = "100x100.png";
        // Copy original file because it's going to be deleted after cut
        fs.copyFileSync(filePath + fileName, filePath + "copy.png");

        imageHelper.cutImageHorizontally(filePath, "100x100.png")
            .then((filePaths) => {
                for (let filePath of filePaths) {
                    expect(fs.existsSync(filePath), "splitted image file doesn't exists").to.be.true;
                    fs.unlinkSync(filePath);
                }

                fs.renameSync(filePath + "copy.png", filePath + "100x100.png");
            })
    });
});