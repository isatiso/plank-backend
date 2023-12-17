import { Get, PathArgs, TpRouter } from '@tarpit/http'
import path from 'path'
import { MarkdownDocumentService } from '../../common/services/markdown-document.service'
import { MarkdownDataResponse, RestResponse } from 'plank-types'

@TpRouter('/api/marked', {})
export class MarkdownDataRouter implements RestResponse<MarkdownDataResponse> {

    constructor(
        private markdown_doc: MarkdownDocumentService,
    ) {
    }

    @Get('')
    async index() {
        return {
            type: 'content' as const,
            title: 'Markdown',
            breadcrumb: [],
            articles: this.markdown_doc.list_docs()
        }
    }

    @Get(':paths+')
    async article(args: PathArgs<{ paths: string[] }>) {
        const paths = args.get('paths', []).map(p => decodeURI(p))
        const file = this.markdown_doc.search_file(paths)
        if (file.type === 'dir') {
            const breadcrumb = this.markdown_doc.make_breadcrumb(path.join('marked', file.path))
            return {
                type: 'content' as const,
                title: 'Markdown',
                breadcrumb,
                articles: this.markdown_doc.list_docs(file.path)
            }
        } else {
            const file_content = await this.markdown_doc.get_file(path.join('markdown', file.path))
            const breadcrumb = this.markdown_doc.make_breadcrumb(path.join('marked', file.path))
            return {
                type: 'article' as const,
                title: 'Markdown',
                breadcrumb,
                file_content: file_content.toString('utf-8')
            }
        }
    }
}
