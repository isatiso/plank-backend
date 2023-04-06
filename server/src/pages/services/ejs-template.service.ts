import { TpService } from '@tarpit/core'
import ejs from 'ejs'
import page_error from '../templates/error.ejs'
import page_about from '../templates/pages/about.ejs'
import page_index from '../templates/pages/index.ejs'

import page_marked from '../templates/pages/marked/marked.ejs'
import page_article from '../templates/pages/marked/article.ejs'
import footer from '../templates/partials/footer.ejs'
import head from '../templates/partials/head.ejs'
import html_begin from '../templates/wrapper/html-begin.ejs'
import html_end from '../templates/wrapper/html-end.ejs'
import header from '../templates/partials/header.ejs'
import scripts from '../templates/partials/scripts.ejs'

const TEMPLATE_MAP = {
    page_error,
    page_index,
    page_about,
    page_marked,
    page_article,
    header,
    head,
    footer,
    scripts,
    html_begin,
    html_end,
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
        data = { ...data, title: data?.title ? `Plank Site | ${data.title}` : 'Plank Site' }
        return ejs.render(`
        <%- include('html_begin', { title }) %>
        <%- include('${template_name}') %>
        <%- include('html_end') %>
        `, data, { includer })
    }
}
