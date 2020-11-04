const mysql = require('mysql');

export class MysqlHelper {
    public con = mysql.createConnection({
        host: "localhost",
        user: "parsify",
        password: "parsify",
        database: "parsify_db"
    });

    constructor() { }

    public async query(sqlQuery: string, values: any[], callback?: Function) {
        await this.con.query(sqlQuery, values, (error: any, results: any) => {
            if (error) {
                console.log(error);
            };

            if (callback) {
                callback(results);
            }
        });
    }
}