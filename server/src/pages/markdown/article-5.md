Marked - Markdown Parser
========================

使用 [Marked] 将 [Markdown] 转换为 HTML.
Markdown 是一种简单的文本格式，他的目标是读写都极其简单，甚至不需要转换成 HTML 也可以很容易的阅读。
你可以在这个示例页面随便写任何东西，并了解他会如何转换。这是个在线转换的示例，不需要任何等待。

如何使用这个示例
-------------------

```typescript
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

```
