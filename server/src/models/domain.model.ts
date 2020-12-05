export class Domain {
    public domainName: string;
    public dateRegistration: string;
    public lastTimeCheckedDate: string;
    public isShopify: boolean;
    public numberChecked: number;
    public zone: DomainZone;

    constructor(name: string, dateRegistration: string, lastTimeCheckedDate:string, isShopify: boolean, numberChecked: number, zone: DomainZone) {
        this.domainName = name;
        this.lastTimeCheckedDate = lastTimeCheckedDate;
        this.dateRegistration = dateRegistration;
        this.isShopify = isShopify;
        this.numberChecked = numberChecked;
        this.zone = zone;
    }
}

export enum DomainZone {
    FR = "fr",
    INTER = "inter"
}