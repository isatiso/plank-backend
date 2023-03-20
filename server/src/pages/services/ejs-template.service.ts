import { TpService } from '@tarpit/core'
import ejs from 'ejs'
import page_not_found from '../templates/404.ejs'
import page_about from '../templates/about.ejs'
import page_index from '../templates/index.ejs'

import page_marked from '../templates/marked.ejs'
import footer from '../templates/partials/footer.ejs'
import head from '../templates/partials/head.ejs'
import header from '../templates/partials/header.ejs'
import scripts from '../templates/partials/scripts.ejs'

const TEMPLATE_MAP = {
    page_not_found,
    page_index,
    page_about,
    page_marked,
    header,
    head,
    footer,
    scripts,
} as const

type TemplateName = keyof typeof TEMPLATE_MAP

const file_loader: ejs.fileLoader = path => TEMPLATE_MAP[path as TemplateName] ?? ''
const includer: ejs.IncluderCallback = path => ({ template: TEMPLATE_MAP[path as TemplateName] ?? '' })

@TpService()
export class EjsTemplateService {

    constructor() {
        ejs.fileLoader = file_loader
    }

    render(template_name: TemplateName, data?: Record<string, any>) {
        return ejs.renderFile(template_name, data, { includer })
    }
}
