import * as fs from 'fs'
import yaml from 'js-yaml'

export default class Config {
    private static _instance: any;

    private constructor() {
        const configFile = fs.readFileSync('config.yaml', 'utf8')
        const data:any = yaml.load(configFile)

        Config._instance = {
            sitename: data.sitename,
            author: data.author,
            primaryColor: data.primary_color,
            cover: data.cover || "/public/cover.jpg",
            logo: data.logo,
            quoteCardContent: data.quote_card_content,
            quoteCardSource: data.quote_card_source,
            menus: data.menu
        }
    }

    static getConfig() {
        if (!Config._instance) {
            console.log(2222)
            new Config();
        }
        return Config._instance;
    }
}