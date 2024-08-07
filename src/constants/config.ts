import fs from 'fs'
import yaml from 'js-yaml'

const configFile = fs.readFileSync('public/config.yaml', 'utf8')
const data = yaml.load(configFile)

console.log(data)
export default data.name