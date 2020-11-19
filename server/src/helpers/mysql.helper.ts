const mysql = require('mysql');

export class MysqlHelper {
    public con = mysql.createConnection({
        host: "localhost",
        user: "parsify",
        password: "parsify",
        database: "parsify_db2"
    });

    constructor() { }

    public async query(sqlQuery: string, values: any[], callback?: Function, errorCallback?: Function) {
        await this.con.query(sqlQuery, values, (error: any, results: any) => {
            if (error) {
                console.log("[LOG] [ERROR] Error Querying database : " + error.code);
                if (errorCallback) {
                    errorCallback(error);
                }
            };

            if (callback) {
                callback(results);
            }
        });
    }
}