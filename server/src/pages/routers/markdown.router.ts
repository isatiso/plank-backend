import { ContentType, Get, PathArgs, TpRouter } from '@tarpit/http'
import * as marked from 'marked'
import path from 'path'
import { MarkdownDocumentService } from '../../common/services/markdown-document.service'
import { EjsTemplateService } from '../services/ejs-template.service'

@TpRouter('/marked', {})
export class MarkdownRouter {

    constructor(
        private markdown_doc: MarkdownDocumentService,
        private template: EjsTemplateService,
    ) {

    }

    @Get('')
    @ContentType('text/html')
    async index() {
        return this.template.render('page_marked', {
            title: 'Markdown',
            breadcrumb: [],
            articles: this.markdown_doc.list_docs()
        })
    }

    @Get(':paths+')
    @ContentType('text/html')
    async article(args: PathArgs<{ paths: string[] }>) {
        const paths = args.get('paths', []).map(p => decodeURI(p))
        const file = this.markdown_doc.search_file(paths)
        if (file.type === 'dir') {
            const breadcrumb = this.markdown_doc.make_breadcrumb(path.join('marked', file.path))
            return this.template.render('page_marked', {
                title: 'Markdown',
                breadcrumb,
                articles: this.markdown_doc.list_docs(file.path)
            })
        } else {
            const file_content = await this.markdown_doc.get_file(path.join('markdown', file.path))
            const breadcrumb = this.markdown_doc.make_breadcrumb(path.join('marked', file.path))
            return this.template.render('page_article', {
                title: 'Markdown',
                breadcrumb,
                markdown_content: marked.marked(file_content.toString('utf-8'))
            })
        }
    }
}
