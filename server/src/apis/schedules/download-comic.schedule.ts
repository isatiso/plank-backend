import { Task, TpSchedule } from '@tarpit/schedule'
import { ComicRecordMongo } from '../../common/mongo'
import { ComicSpiderService } from '../../common/services/comic/comic-spider.service'
import { ComicSyncStateService } from '../../common/services/comic/comic-sync-state.service'

@TpSchedule()
export class DownloadComicSchedule {

    constructor(
        private comic_spider: ComicSpiderService,
        private sync_state: ComicSyncStateService,
        private comic_record: ComicRecordMongo
    ) {
    }

    @Task('*/5 * * * *', 'Download Comic')
    async download() {
        const content = await this.comic_spider.get_content()
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
}
