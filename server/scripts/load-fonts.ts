import axios from 'axios'
import fs from 'fs'
import path from 'path'
import process from 'process'

const meta = [
    {
        name: 'md-icon',
        url: 'https://fonts.googleapis.com/css2?family=Material+Icons&family=Material+Symbols+Outlined:opsz,wght,FILL,GRAD@48,400,0,0&family=Material+Symbols+Rounded:opsz,wght,FILL,GRAD@20..48,400,0..1,-50..200'
    },
    {
        name: 'noto-sans-sc',
        url: 'https://fonts.googleapis.com/css2?family=Noto+Sans+SC:wght@100;300;400;500;700;900&display=swap'
    },
    {
        name: 'roboto',
        url: 'https://fonts.googleapis.com/css2?family=Roboto:ital,wght@0,100;0,300;0,400;0,500;0,700;0,900;1,100;1,300;1,400;1,500;1,700;1,900&display=swap'
    },
]

async function get_woff(web: string, dir: string, meta: { name: string, url: string }) {
    let content: string = await axios.get(meta.url, {
        headers: { 'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/115.0.0.0 Safari/537.36' },
        responseType: 'text'
    }).then(res => res.data.replace(/\n/g, ''))
    const rule = /font-style: (italic|normal);\s+font-weight: (\d+);.+?src: url\((.+?)\) format\(.+?\)/g
    const matches = content.match(rule) ?? []
    const dirname = path.resolve(dir, meta.name)
    fs.mkdirSync(dirname, { recursive: true })
    // @ts-ignore
    for (const i of progress(matches.length)) {
        const m = matches[i]
        const [, style, weight, url] = /font-style: (italic|normal);\s+font-weight: (\d+);.+?src: url\((.+?)\) format\(.+?\)/.exec(m)!
        const res = await axios.get(url, { responseType: 'arraybuffer' })
        const filename = path.resolve(dirname, `${style}-${weight}-${(i + 1 + '').padStart(3, '0')}.woff2`)
        fs.writeFileSync(filename, res.data)
        content = content.replace(url, path.join(web, path.relative(dir, filename)))
    }
    fs.writeFileSync(path.resolve(dir, `${meta.name}.css`), content)
}

async function main() {
    for (const m of meta) {
        await get_woff('/fonts', process.argv[2], m)
    }
}

if (require.main === module) {
    main().then()
}

