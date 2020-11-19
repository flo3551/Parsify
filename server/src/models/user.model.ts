const jwt = require("jwt-simple");
const config = require("../../config/config");

export class User {
    public email: string;
    public password: string;
    public createdAt?: string;
    public token?: string;

    constructor(email: string, password: string, createdAt?: string, token?: string) {
        this.email = email;
        this.password = password;
        this.createdAt = createdAt;
        this.token = token;
    }

    public getNewToken() {
        return jwt.encode(this, config.secret);
    }
}