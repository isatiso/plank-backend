import { Task, TpSchedule } from '@tarpit/schedule'
import { ComicSpiderService } from '../../common/services/comic/comic-spider.service'
import { ComicSyncStateService } from '../../common/services/comic/comic-sync-state.service'

@TpSchedule()
export class DownloadComicSchedule {

    current_check_book_index = 0

    constructor(
        private comic_spider: ComicSpiderService,
        private sync_state: ComicSyncStateService,
    ) {
    }

    @Task('*/30 * * * *', 'Download Comic')
    async download() {
        const content = await this.comic_spider.get_content()
        const processing_count = content.books.filter(([book_id]) => this.sync_state.get(book_id)?.state === 'processing')?.length ?? 0
        if (processing_count > 4) {
            return
        }
        const [book_id] = content.books.find(([book_id]) => (this.sync_state.get(book_id)?.state ?? 'idle') === 'idle') ?? []
        if (!book_id) {
            return
        }
        const book_meta = await this.comic_spider.get_chapters_of_book(book_id, 'update')
        if (!book_meta) {
            return
        }
        this.sync_state.set(book_id, {
            book_id,
            book_name: book_meta.book_name,
            state: 'processing',
            chapter_progress: 0,
            chapters_index: book_meta.chapters_index,
            chapters: Object.fromEntries(book_meta.chapters_index.map(chapter_id => [chapter_id, 0])),
        })
        await this.comic_spider.sync_from_remote(book_id, book_meta)
            .catch(err => console.log(err))
            .finally(() => {
                if (this.sync_state.get(book_id).state === 'processing') {
                    this.sync_state.update_state(book_id, 'idle')
                }
            })
        return
    }

    @Task('*/3 * * * *', 'Check Book Update')
    async check_update() {
        const content = await this.comic_spider.get_content()
        if (!content.books[this.current_check_book_index]) {
            this.current_check_book_index = 0
        }
        await this.comic_spider.get_chapters_of_book(content.books[this.current_check_book_index][0], 'update')
        this.current_check_book_index += 1
    }
}
