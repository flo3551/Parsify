import { User } from "../models/user.model";
import { MysqlHelper } from "../helpers/mysql.helper";
const passwordHash = require("password-hash");
let moment = require('moment');

export class UserService {
    private db: MysqlHelper;
    public queuedDomainUpdate = [] as any;
    public hasQueuingUpdateStarted = false;

    private readonly COUNT_USERS_BY_EMAIL = "SELECT COUNT(email) as nbUsers from users WHERE email = ?";
    private readonly INSERT_USER = "INSERT INTO users(email, password) VALUES(?, ?)";
    private readonly SELECT_COUNT_USER_BY_EMAIL_PASSWORD = "SELECT count(email) as credentialMatchs FROM users WHERE email = ? AND password = ?"
    private readonly SELECT_USER_BY_EMAIL = "SELECT email, password, createdAt, lastConnectionDate FROM users WHERE email = ?";
    private readonly UPDATE_USER_CONNECTION_DATE = "UPDATE users SET lastConnectionDate = ? WHERE email = ?"
    constructor() {
        this.db = new MysqlHelper();
    }

    public doesUserExists(email: string): any {
        return new Promise((resolve, reject) => {
            this.db.query(this.COUNT_USERS_BY_EMAIL, [email], resolve, reject);
        })
            .then((results: any) => {
                return Promise.resolve(results[0].nbUsers > 0);
            })
    }

    public insertUser(email: string, password: string): any {
        return new Promise((resolve, reject) => {
            this.db.query(this.INSERT_USER, [email, password], resolve, reject);
        })
            .then((results: any) => {
                return Promise.resolve(results[0]);
            })
    }

    public areCredentialsValid(email: string, password: string): any {
        // return new Promise((resolve, reject) => {
        return this.selectUserByEmail(email)
            // })
            .then((user: any) => {
                let areCredentialsValid = false
                if (user && passwordHash.verify(password, user.password)) {
                    areCredentialsValid = true;
                }

                return Promise.resolve(areCredentialsValid);
            })
    }

    public selectUserByEmail(email: string) {
        return new Promise((resolve, reject) => {
            this.db.query(this.SELECT_USER_BY_EMAIL, [email], resolve, reject);
        })
            .then((results: any) => {
                return Promise.resolve(this._mapResultToUser(results[0]));
            })
    }

    public updateUserLastConnection(email: string) {
        return new Promise((resolve, reject) => {
            const format = "YYYY-MM-DD HH:mm:ss"

            let date = moment().format(format).toString();
            console.log(date);

            this.db.query(this.UPDATE_USER_CONNECTION_DATE, [date, email], resolve, reject);
        })
    }

    private _mapResultToUser(results: any): User {
        return new User(results.email, results.password, results.createdAt)
    }
}