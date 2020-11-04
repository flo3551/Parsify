export class Domain {
    public domainName: string = '';
    public dateRegistration: string = '';
    public lastTimeCheckedDate: string = '';
    public isShopify: boolean = false;
    public numberChecked: number = 0;

    constructor(name: string, dateRegistration: string, lastTimeCheckedDate:string, isShopify: boolean, numberChecked: number) {
        this.domainName = name;
        this.lastTimeCheckedDate = lastTimeCheckedDate;
        this.dateRegistration = dateRegistration;
        this.isShopify = isShopify;
        this.numberChecked = numberChecked;
    }
}