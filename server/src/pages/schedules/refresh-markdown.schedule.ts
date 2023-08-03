import { Task, TpSchedule } from '@tarpit/schedule'
import { MarkdownDocumentService } from '../../common/services/markdown-document.service'

@TpSchedule()
export class RefreshMarkdownSchedule {

    constructor(
        private markdown_doc: MarkdownDocumentService,
    ) {
    }

    @Task('*/30 * * * *', 'Refresh markdown document')
    async refresh_markdown() {
        await this.markdown_doc.update_docs()
    }
}
