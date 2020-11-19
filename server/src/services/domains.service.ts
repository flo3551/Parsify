import { MysqlHelper } from "../helpers/mysql.helper";
import { Domain } from "../models/domain.model";

let moment = require('moment');

export class DomainsService {
    private db: MysqlHelper;
    public queuedDomainUpdate = [] as any;
    public hasQueuingUpdateStarted = false;

    private readonly INSERT_DOMAIN_SQL = "INSERT INTO domains(domainName, dateRegistration, lastTimeCheckedDate, isShopify, numberChecked) VALUES (?, ?, ?, ?, ?)"
    private readonly UPDATE_DOMAIN_SQL = "UPDATE domains SET domainName=?, lastTimeCheckedDate=?, isShopify=?, numberChecked=? WHERE domainName=?";
    private readonly SELECT_DOMAINS_RANGE_SQL = "SELECT * from domains WHERE isShopify=1 LIMIT ? OFFSET ?"
    private readonly SELECT_COUNT_DOMAIN_SQL = "SELECT COUNT(domainName) as nbDomains from domains WHERE isShopify=1"
    private readonly SELECT_COUNT_DAILY_DOMAIN_TO_CHECK_SQL = "SELECT COUNT(domainName) as nbDomains from domains WHERE dateRegistration=? and isShopify=1"
    // private readonly SELECT_DOMAINS_LIST = "SELECT * from domains LIMIT 15";

    constructor() {
        this.db = new MysqlHelper();
    }

    public countDomains(): any {
        return new Promise((resolve, reject) => {
            this.db.query(this.SELECT_COUNT_DOMAIN_SQL, [], resolve, reject);
        })
            .then((results: any) => {
                return Promise.resolve(results[0].nbDomains);
            })
    }

    public selectRangeDomains(offset: number, limit: number) {
        return new Promise((resolve, reject) => {
            this.db.query(this.SELECT_DOMAINS_RANGE_SQL, [limit, offset], resolve, reject);
        })
            .then((results: any) => {
                return Promise.resolve(this._mapResultsToDomains(results));
            })
    }

    // public selectDomainsList(): Promise<Domain[]> {
    //     return new Promise((resolve, reject) => {
    //         this.db.query(this.SELECT_DOMAINS_LIST, [], resolve);
    //     })
    //         .then((results: any) => {
    //             return Promise.resolve(this._mapResultsToDomains(results));
    //         })
    // }

    public insertDomain(domain: Domain) {
        return new Promise((resolve, reject) => {
            this.db.query(this.INSERT_DOMAIN_SQL, [domain.domainName, moment(domain.dateRegistration).format('YYYY-MM-DD').toString(), moment(domain.lastTimeCheckedDate).format('YYYY-MM-DD').toString(), domain.isShopify, domain.numberChecked], resolve);
        })
            .then((results: any) => {
                return Promise.resolve(results ? this._mapResultToDomain(results) : null);
            })
    }

    public queuingUpdateDomain() {
        if (!this.hasQueuingUpdateStarted) {
            this.hasQueuingUpdateStarted = true;
            while (this.queuedDomainUpdate.length > 0) {
                let domain: Domain = this.queuedDomainUpdate[0];
                this.db.query(this.UPDATE_DOMAIN_SQL, [domain.domainName, moment(domain.lastTimeCheckedDate).format('YYYY-MM-DD').toString(), domain.isShopify, domain.numberChecked, domain.domainName]);
                this.queuedDomainUpdate.splice(0, 1);
            }
            this.hasQueuingUpdateStarted = false;
        }
    }

    private _mapResultsToDomains(results: any[]) {
        let domains: Domain[] = [];
        for (let result of results) {
            domains.push(new Domain(result.domainName, result.dateRegistration, result.lastTimeCheckedDate, result.isShopify, result.numberChecked));
        }

        return domains;
    }

    private _mapResultToDomain(result: any) {
        return new Domain(result.domainName, result.dateRegistration, result.lastTimeCheckedDate, result.isShopify, result.numberChecked)
    }
}