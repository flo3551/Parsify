const { Cluster } = require('puppeteer-cluster');

export class PuppeteerClusterFactory {
    public clusterDailyJob: any;
    public clusterSaverJob: any;

    public static INSTANCE: PuppeteerClusterFactory;

    constructor() {
    }

    public static async getInstance() {
        if (!this.INSTANCE) {
            this.INSTANCE = new PuppeteerClusterFactory();
            await this.INSTANCE.launchClusters();
        }

        return this.INSTANCE;
    }

    public async launchClusters() {
        if (!this.clusterDailyJob) {
            this.clusterDailyJob = await Cluster.launch({
                concurrency: Cluster.CONCURRENCY_PAGE,
                maxConcurrency: 6,
                puppeteerOptions: {
                    headless: true,
                    args: ['--no-sandbox']
                },
                skipDuplicateUrls: true
            });
        }

        if (!this.clusterSaverJob) {
            this.clusterSaverJob = await Cluster.launch({
                concurrency: Cluster.CONCURRENCY_PAGE,
                maxConcurrency: 6,
                puppeteerOptions: {
                    headless: true,
                    args: ['--no-sandbox']
                },
                skipDuplicateUrls: true
            });
        }
    }
}