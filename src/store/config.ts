import * as fs from 'fs'
import yaml from 'js-yaml'

const configFile = fs.readFileSync('config.yaml', 'utf8')
const data:any = yaml.load(configFile)

export let config = {
    sitename: data.sitename,
    author: data.author,
    primaryColor: data.primary_color,
    cover: data.cover || "/public/cover.jpg",
    logo: data.logo,
    quoteCardContent: data.quote_card_content,
    quoteCardSource: data.quote_card_source,
    menus: data.menu
}