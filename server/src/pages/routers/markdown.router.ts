import { Get, PathArgs, TpResponse, TpRouter } from '@tarpit/http'
import { Jtl } from '@tarpit/judge'
import marked from 'marked'
import { markdown_files } from '../markdown/markdown'
import { EjsTemplateService } from '../services/ejs-template.service'

@TpRouter('/markdown', {})
export class MarkdownRouter {

    constructor(
        private ejs_template: EjsTemplateService,
    ) {
    }

    @Get('')
    async index(response: TpResponse) {
        response.redirect('/markdown/main', 302)
    }

    @Get('main/:article_name')
    async main(response: TpResponse, args: PathArgs<{ article_name: string }>) {
        const article_name = args.ensure('article_name', Jtl.string)
        response.content_type = 'text/html'
        if (!markdown_files[article_name]) {
            response.redirect('/ejs/404', 302)
        }
        return this.ejs_template.render('page_marked', {
            articles: Object.keys(markdown_files),
            markdown_content: marked.marked(markdown_files[article_name])
        })
    }
}
