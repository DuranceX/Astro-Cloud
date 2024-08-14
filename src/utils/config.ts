import * as fs from 'fs'
import yaml from 'js-yaml'

const configFile = fs.readFileSync('config.yaml', 'utf8')
const data:any = yaml.load(configFile)

const baseConfig = {
    sitename: data.sitename,
    author: data.author,
    primaryColor: data.primary_color
}

export const config = {
    baseConfig: baseConfig
}