import { FileInfos } from "../models/file-infos.model";
import { MysqlHelper } from "../helpers/mysql.helper";

const readline = require('readline');
const fs = require('fs');
export class FileService {
    private db: MysqlHelper
    private readonly SQL_INSERT_FILE_INFOS = "INSERT INTO file_infos(filePath, linesCount, parsedCount, zone) VALUES (?, ?, ?, ?)";
    private readonly SQL_SELECT_COUNT_FILE_BY_FILEPATH = "SELECT COUNT(*) as fileCount FROM file_infos WHERE filePath=?";
    private readonly SQL_SELECT_LINE_PARSED_COUNT = "SELECT parsedCount FROM file_infos WHERE filePath = ?";
    private readonly SQL_UPDATE_PARSED_COUNT_BY_FILEPATH = "UPDATE file_infos set parsedCount = ? WHERE filePath = ?";
    private readonly SQL_GET_FILE_INFOS_BY_FILEPATH = "SELECT * FROM file_infos WHERE filePath = ?";
    private readonly SQL_SELECT_FILES_IN_PROGRESS = "SELECT * FROM file_infos WHERE parsedCount < linesCount";

    constructor() {
        this.db = new MysqlHelper();
    }

    public insertFileInfos(fileInfos: FileInfos) {
        return new Promise((resolve, reject) => {
            this.db.query(this.SQL_INSERT_FILE_INFOS, [fileInfos.filePath, fileInfos.linesCount, fileInfos.parsedCount, fileInfos.zone], resolve, reject)
        })
            .then((results: any) => {
                return Promise.resolve();
            })
            .catch(error => {
                console.log(error);
                return Promise.reject(error);
            })
    }

    public getFileInfos(filePath: string, zone: string) {
        return new Promise(async (resolve, reject) => {
            this.db.query(this.SQL_GET_FILE_INFOS_BY_FILEPATH, [filePath], resolve, reject)
        })
            .then(async (results: any) => {
                let fileInfos: FileInfos;
                console.log(results);

                if (results.length > 0 && results[0].filePath) {
                    fileInfos = this._mapResultToFileInfos(results[0]);
                } else {
                    let linesCount = await FileInfos.countFileLines(filePath);
                    fileInfos = new FileInfos(filePath, linesCount, 0, zone);
                    await this.insertFileInfos(fileInfos);
                }

                return Promise.resolve(fileInfos);
            })
            .catch(error => {
                console.log(error);
                return Promise.reject(error);
            })
    }

    public updateParsedCount(parsedCount: number, filePath: string) {
        return new Promise((resolve, reject) => {
            this.db.query(this.SQL_UPDATE_PARSED_COUNT_BY_FILEPATH, [parsedCount, filePath], resolve, reject)
        })
            .then((results: any) => {
                return Promise.resolve();
            })
            .catch(error => {
                console.log(error);
            })
    }

    public getFilesInProgress() {
        return new Promise((resolve, reject) => {
            this.db.query(this.SQL_SELECT_FILES_IN_PROGRESS, [], resolve, reject)
        })
            .then((results: any) => {
                return Promise.resolve(this._mapResultsToFileInfosList(results));
            })
            .catch(error => {
                console.log(error);
                return Promise.reject(error);
            })
    }

    private _mapResultsToFileInfosList(results: any) {
        let fileInfos: FileInfos[] = [];
        for (let result of results) {
            fileInfos.push(new FileInfos(result.filePath, result.linesCount, result.parsedCount, result.zone));
        }

        return fileInfos;
    }

    private _mapResultToFileInfos(result: any) {
        return new FileInfos(result.filePath, result.linesCount, result.parsedCount, result.zone);
    }
}