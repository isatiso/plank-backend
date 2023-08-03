import { Auth, Get, JsonBody, PathArgs, Post, TpRouter, TpWebSocket, WS } from '@tarpit/http'
import { Jtl } from '@tarpit/judge'
import { BookMeta, ComicRecord, ComicResponse, ContentMeta, RestResponse } from 'plank-types'
import process from 'process'
import { ComicRecordMongo } from '../../common/mongo'
import { ComicSpiderService } from '../../common/services/comic/comic-spider.service'
import { ComicSyncStateService } from '../../common/services/comic/comic-sync-state.service'

@TpRouter('/comic-data')
export class ComicRouter implements RestResponse<ComicResponse> {

    private sync_content_promise: Promise<ContentMeta> | undefined

    constructor(
        private comic_spider: ComicSpiderService,
        private sync_state: ComicSyncStateService,
        private comic_record: ComicRecordMongo
    ) {
        const base_url = process.env.COMIC_BASE_URL
        const dir = process.env.COMIC_PATH
        if (!base_url || !dir) {
            throw new Error('Please confirm setting of COMIC_BASE_URL and COMIC_PATH')
        }
    }

    @WS('subscribe-state')
    async subscribe_state(ws: TpWebSocket): Promise<void> {
        const subscription = this.sync_state.subscribe(msg => ws.send(JSON.stringify(msg)))
        ws.on('error', _ => ws.terminate())
        ws.on('close', _ => subscription.unsubscribe())
        ws.on('message', _ => undefined)
    }

    @WS('subscribe-book/:book_id')
    async subscribe_book(args: PathArgs<{ book_id: string }>, ws: TpWebSocket): Promise<void> {
        const book_id = +args.ensure('book_id', Jtl.string)
        const subscription = this.sync_state.subscribe_book(book_id, msg => ws.send(JSON.stringify(msg)))
        ws.on('error', _ => ws.terminate())
        ws.on('close', _ => subscription.unsubscribe())
        ws.on('message', _ => undefined)
    }

    @Auth()
    @Post('update-type')
    async update_type(body: JsonBody<{
        book_id: number
        type: string
    }>) {
        const book_id = body.ensure('book_id', Jtl.non_zero_number)
        const type = body.ensure('type', /^(photo|gray|color)$/)
        const updater: Partial<ComicRecord> = { book_name: this.sync_state.get(book_id)?.book_name }
        body.do_if('type', /^(photo|gray|color)$/, type => updater['type'] = type as any)
        const res = await this.comic_record.updateOne({ book_id }, {
            $set: {
                book_name: this.sync_state.get(book_id)?.book_name,
                type: type as any
            }
        }, { upsert: true })
        return {
            matched_count: res.matchedCount,
            modified_count: res.modifiedCount,
            upserted_id: res.upsertedId?.toString(),
        }
    }

    @Auth()
    @Post('like')
    async like(body: JsonBody<{
        book_id: number
        value: boolean
    }>) {
        const book_id = body.ensure('book_id', Jtl.non_zero_number)
        const value = body.ensure('value', Jtl.boolean)
        const res = await this.comic_record.updateOne({ book_id }, {
            $set: { book_name: this.sync_state.get(book_id)?.book_name, like: value }
        }, { upsert: true })
        return {
            matched_count: res.matchedCount,
            modified_count: res.modifiedCount,
            upserted_id: res.upsertedId?.toString(),
        }
    }

    @Auth()
    @Get('list-books')
    async list_books() {
        const content = await this.comic_spider.get_content()
        const record_list = await this.comic_record.find({}).toArray()
        const records = Object.fromEntries(record_list.map(r => [r.book_id, r]))
        const books = content.books.map(([book_id, book_name]) => ({
            type: records[book_id]?.type ?? 'color',
            like: records[book_id]?.like ?? false,
            book_id,
            book_name,
            state: this.sync_state.get(book_id)?.state ?? 'idle',
        }))
        return { books }
    }

    @Auth()
    @Get('book/:book_id')
    async book(args: PathArgs<{
        book_id: string
    }>) {
        const book_id = +args.ensure('book_id', Jtl.string)
        if (!this.sync_state.get(book_id)) {
            await this.comic_spider.refresh()
        }
        const book_meta = await this.comic_spider.get_chapters_of_book(book_id)
        const record = await this.comic_record.findOne({ book_id })
        return {
            book_id,
            book_name: this.sync_state.get(book_id)?.book_name ?? '',
            state: this.sync_state.get(book_id)?.state ?? 'idle',
            like: record?.like ?? false,
            type: record?.type ?? 'color',
            chapters_index: book_meta?.chapters_index ?? [],
            chapters: book_meta?.chapters ?? {},
            all_chapter_loaded: book_meta?.all_chapter_loaded ?? false,
            updated_at: book_meta?.updated_at ?? 0,
            meta_path: '',
        }
    }

    @Auth()
    @Get('chapter/:book_id/:chapter_id')
    async chapter(args: PathArgs<{
        book_id: string
        chapter_id: string
    }>) {
        const book_id = +args.ensure('book_id', Jtl.string)
        const chapter_id = +args.ensure('chapter_id', Jtl.string)
        const content = await this.comic_spider.get_images_of_chapter(book_id, chapter_id)
        return {
            ...content,
            book_id,
            chapter_id,
        }
    }

    @Auth()
    @Post('sync-content')
    async sync_content() {
        if (!this.sync_content_promise) {
            return this.sync_content_promise = this.comic_spider.get_content(true)
                .finally(() => this.sync_content_promise = undefined)
        } else {
            return this.sync_content_promise
        }
    }

    @Auth()
    @Post('sync-from-remote')
    async sync_from_remote(body: JsonBody<{
        book_id: number
        update: boolean
    }>) {
        const book_id = body.ensure('book_id', Jtl.non_zero_number)
        const update = body.ensure('update', Jtl.boolean)
        const current_state = this.sync_state.get(book_id)
        if (!update) {
            switch (current_state?.state) {
                case 'processing':
                    return { book_id, book_name: current_state.book_name, state: 'processing' as const, detail: this.sync_state.get(book_id) }
                case 'latest':
                    return { book_id, book_name: current_state.book_name, state: 'latest' as const }
            }
        }
        const book_meta = await this.comic_spider.get_chapters_of_book(book_id, update ? 'update' : undefined)
        if (!book_meta) {
            return { book_id, book_name: 'unknown', state: 'unknown' as const }
        }
        this.sync_state.set(book_id, {
            book_id,
            book_name: book_meta.book_name,
            state: 'processing',
            chapter_progress: 0,
            chapters_index: book_meta.chapters_index,
            chapters: Object.fromEntries(book_meta.chapters_index.map(chapter_id => [chapter_id, 0])),
        })
        this._sync_from_remote(book_id, book_meta)
            .catch(err => console.log(err))
            .finally(() => {
                if (this.sync_state.get(book_id).state === 'processing') {
                    this.sync_state.update_state(book_id, 'idle')
                }
            })
        return { state: this.sync_state.get(book_id).state, ...book_meta, book_id }
    }

    private async _sync_from_remote(book_id: number, book_meta: BookMeta) {

        const loaded_chapter_set = new Set<number>()
        for (const chapter_id of book_meta.chapters_index) {
            const chapter_meta = await this.comic_spider.get_images_of_chapter(book_id, chapter_id)
            if (chapter_meta.all_image_loaded) {
                loaded_chapter_set.add(chapter_id)
                this.sync_state.update_chapter(book_id, chapter_id, 1)
                continue
            }
            const loaded_image_set = new Set<string>()
            const promises = chapter_meta.images_index.map(async name => {
                const { image_path, image_url } = chapter_meta.images[name]
                const loaded_image_path = await this.comic_spider.fetch_image(image_path, image_url)
                loaded_image_set.add(loaded_image_path)
                this.sync_state.update_chapter(book_id, chapter_id, loaded_image_set.size / chapter_meta.images_index.length)
                return loaded_image_path
            })
            await Promise.all(promises)
            chapter_meta.all_image_loaded = true
            await this.comic_spider.write_metafile(chapter_meta)
            loaded_chapter_set.add(chapter_id)
            this.sync_state.update_book(book_id, loaded_chapter_set.size / book_meta.chapters_index.length)
        }
        book_meta.all_chapter_loaded = true
        await this.comic_spider.write_metafile(book_meta)
        this.sync_state.update_state(book_id, 'latest')
        return book_meta
    }
}
