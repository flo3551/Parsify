import { MysqlHelper } from "../helpers/mysql.helper";
import { Domain } from "../models/domain.model";

let moment = require('moment');

export class DomainsService {
    private db: MysqlHelper;
    public queuedDomainUpdate = [] as any;
    public hasQueuingUpdateStarted = false;

    private readonly INSERT_DOMAIN_SQL = "INSERT INTO domains(domainName, dateRegistration, lastTimeCheckedDate, isShopify, numberChecked, zone) VALUES (?, ?, ?, ?, ?, ?)";
    private readonly SELECT_DOMAINS_RANGE_SQL = "SELECT * from domains WHERE isShopify=1 ";
    private readonly SELECT_COUNT_DOMAIN_SQL = "SELECT COUNT(domainName) as nbDomains from domains WHERE isShopify=1";
    private readonly SELECT_COUNT_DOMAINS_FAVORITES_SQL = "SELECT COUNT(domainName) as nbDomains from user_domains_favorites WHERE login = ?";
    private readonly SELECT_COUNT_DOMAINS_FAVORITES_MATCHS_SQL = "SELECT COUNT(domainName) as nbDomains from user_domains_favorites WHERE login = ? and domainName = ?";
    private readonly SELECT_USER_FAVORITES_SQL = "SELECT * from domains WHERE domainName IN (SELECT domainName from user_domains_favorites where login = ?)";
    private readonly CLAUSE_LIMIT_OFFSET = " LIMIT ? OFFSET ? ";
    private readonly CLAUSE_ORDER_BY_DATEREGISTRATION_DESC = " ORDER BY dateRegistration DESC";
    private readonly INSERT_DOMAIN_TO_FAVORITES = "INSERT INTO user_domains_favorites(domainName, login) VALUES (?, ?)";
    private readonly DELETE_DOMAIN_FROM_FAVORITES = "DELETE FROM user_domains_favorites WHERE domainName = ? AND login = ?";

    constructor() {
        this.db = new MysqlHelper();
    }

    public countDomainsWithFilters(keyword?: string, zone?: string, exactDate?: Date, minDate?: Date, maxDate?: Date): any {
        return new Promise((resolve, reject) => {
            this.db.query(this.SELECT_COUNT_DOMAIN_SQL + this._buildWhereClause(exactDate, minDate, maxDate, keyword, zone), [], resolve, reject);
        })
            .then((results: any) => {
                return Promise.resolve(results[0].nbDomains);
            })
            .catch(error => {
                console.log("[LOG] [ERROR] countDomainsWithFilters", error);
                return Promise.reject(error);
            })
    }

    public countDomainsFavorites(login: string) {
        return new Promise((resolve, reject) => {
            this.db.query(this.SELECT_COUNT_DOMAINS_FAVORITES_SQL, [login], resolve, reject);
        })
            .then((results: any) => {
                return Promise.resolve(results[0].nbDomains);
            })
            .catch(error => {
                console.log("[LOG] [ERROR] countDomainsFavorites", error);
                return Promise.reject(error);
            })
    }

    public getCountDomainsFavoriteMatchs(login: string, domainName: string) {
        return new Promise((resolve, reject) => {
            this.db.query(this.SELECT_COUNT_DOMAINS_FAVORITES_MATCHS_SQL, [login, domainName], resolve, reject);
        })
            .then((results: any) => {
                return Promise.resolve(results[0].nbDomains);
            })
            .catch(error => {
                console.log("[LOG] [ERROR] getCountDomainsFavoriteMatchs", error);
                return Promise.reject(error);
            })
    }

    public selectRangeDomainsWithFilters(offset: number, limit: number, keyword?: string, zone?: string, exactDate?: Date, minDate?: Date, maxDate?: Date) {
        return new Promise((resolve, reject) => {
            this.db.query(this.SELECT_DOMAINS_RANGE_SQL + this._buildWhereClause(exactDate, minDate, maxDate, keyword, zone) + this.CLAUSE_ORDER_BY_DATEREGISTRATION_DESC + this.CLAUSE_LIMIT_OFFSET, [limit, offset], resolve, reject);
        })
            .then((results: any) => {
                return Promise.resolve(this._mapResultsToDomains(results));
            })
            .catch(error => {
                return Promise.reject(error);
            })
    }

    public getFavoritesDomains(login: string) {
        return new Promise((resolve, reject) => {
            this.db.query(this.SELECT_USER_FAVORITES_SQL, [login], resolve, reject);
        })
            .then((results: any) => {
                return Promise.resolve(this._mapResultsToDomains(results));
            })
            .catch(error => {
                console.log("[LOG] [ERROR] getFavoritesDomains", error);
                return Promise.reject(error);
            })
    }

    public insertDomain(domain: Domain) {
        return new Promise((resolve, reject) => {
            this.db.query(this.INSERT_DOMAIN_SQL, [domain.domainName, moment(domain.dateRegistration).format('YYYY-MM-DD').toString(), moment(domain.lastTimeCheckedDate).format('YYYY-MM-DD').toString(), domain.isShopify, domain.numberChecked, domain.zone], resolve);
        })
            .then((results: any) => {
                return Promise.resolve();
            })
            .catch(error => {
                console.log("[LOG] [ERROR] insertDomain", error);
                return Promise.reject(error);
            })
    }


    public addDomainToFavorites(login: string, domainName: string) {
        return new Promise((resolve, reject) => {
            this.db.query(this.INSERT_DOMAIN_TO_FAVORITES, [domainName, login], resolve, reject);
        })
            .then((results: any) => {
                return Promise.resolve();
            })
            .catch((error: any) => {
                console.log("[LOG] [ERROR] addDomainToFavorites", error);
                return Promise.reject(error)
            })
    }

    public deleteDomainFromFavorites(login: string, domainName: string) {
        return new Promise((resolve, reject) => {
            this.db.query(this.DELETE_DOMAIN_FROM_FAVORITES, [domainName, login], resolve, reject);
        })
            .then((results: any) => {
                return Promise.resolve();
            })
            .catch((error: any) => {
                console.log("[LOG] [ERROR] deleteDomainFromFavorites", error);
                return Promise.reject(error)
            })
    }

    private _mapResultsToDomains(results: any[]) {
        let domains: Domain[] = [];
        for (let result of results) {
            domains.push(new Domain(result.domainName, result.dateRegistration, result.lastTimeCheckedDate, result.isShopify, result.numberChecked, result.zone));
        }

        return domains;
    }

    private _mapResultToDomain(result: any) {
        return new Domain(result.domainName, result.dateRegistration, result.lastTimeCheckedDate, result.isShopify, result.numberChecked, result.zone)
    }

    private _buildWhereClause(exactDate?: Date, minDate?: Date, maxDate?: Date, keyword?: string, zone?: string) {
        let whereClause = "";
        if (exactDate) {
            whereClause += " AND dateRegistration = '" + moment(exactDate).format('YYYY-MM-DD').toString() + "'";
        } else {
            if (minDate) {
                whereClause += " AND dateRegistration >= '" + moment(minDate).format('YYYY-MM-DD').toString() + "'";
            }

            if (maxDate) {
                whereClause += " AND dateRegistration <= '" + moment(maxDate).format('YYYY-MM-DD').toString() + "'";
            }
        }

        if (keyword) {
            whereClause += " AND domainName LIKE '%" + keyword + "%'";
        }

        if (zone) {
            whereClause += " AND zone ='" + zone + "'";
        }

        return whereClause;
    }
}