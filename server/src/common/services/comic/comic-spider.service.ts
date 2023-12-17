import { Injector, TpService } from '@tarpit/core'
import axios from 'axios'
import fs from 'fs'
import path from 'path'
import { BookBrief, BookMeta, ChapterMeta, CommonMeta, ContentMeta } from 'plank-types'
import ua_list from '../../../user-agents.json'
import { sleep } from '../../tools/async-tools'
import { ComicSyncStateService } from './comic-sync-state.service'
import { HtmlParserV1Service } from './html-parser-v1.service'

@TpService()
export class ComicSpiderService {

    private base_dir = process.env['COMIC_PATH']
    private user_agent = this.choice(ua_list)

    constructor(
        private injector: Injector,
        private comic_sync_state: ComicSyncStateService,
        private html_parser: HtmlParserV1Service,
    ) {
        this.injector.on('start', async () => this.refresh())
    }

    async refresh(content?: ContentMeta) {
        content = content ?? await this.get_content()
        const books = content.books_index.map(book_id => content!.books[book_id] ?? {})
        for (const { book_id, book_name } of books) {
            if (!book_id) {
                return
            }
            const state = this.comic_sync_state.get(book_id)
            if (!state) {
                const book_meta = await this.get_chapters_of_book(book_id, 'local_only')
                const germ = { book_id, book_name, chapter_progress: 0, chapters_index: [], chapters: {} }
                if (book_meta && book_meta.all_chapter_loaded) {
                    this.comic_sync_state.set(book_id, { ...germ, state: 'latest' as const })
                } else {
                    this.comic_sync_state.set(book_id, { ...germ, state: 'idle' as const })
                }
            }
        }
    }

    async fetch_image(image_path: string, url: string): Promise<string> {
        console.log('fetching', url)
        let error: any = undefined
        for (let i = 0; i < 5; i++) {
            try {
                const resp = await axios.get(url, {
                    headers: { 'User-Agent': this.user_agent },
                    proxy: { protocol: 'http', host: '10.3.3.1', port: 7890 },
                    responseType: 'arraybuffer'
                })
                await this.write_file(image_path, resp.data)
            } catch (e: any) {
                error = e
                console.log(`Fetch image failed: ${url}`, e?.message)
            }
            await sleep(1000)
        }
        if (error) {
            return ''
        }
        return image_path
    }

    async fetch_remote(url: string): Promise<string> {
        console.log('fetching', url)
        let error: any = undefined
        for (let i = 0; i < 5; i++) {
            try {
                return await axios.get(url, {
                    headers: { 'User-Agent': this.user_agent },
                    proxy: { protocol: 'http', host: '10.3.3.1', port: 7890 },
                }).then(resp => resp.data)
            } catch (e: any) {
                error = e
                console.log(`Fetch remote failed: ${url}`, e?.message)
            }
        }
        if (error) {
            return ''
        }
        return url
    }

    async get_content(force?: boolean): Promise<ContentMeta> {
        const meta_path = `${this.base_dir}/metadata.json`
        const meta = await this.read_metafile<ContentMeta>(meta_path)
        if (!force && meta) {
            return meta
        }
        const total_page = await this.get_total_page()
        const books: BookBrief[] = []
        for (let i = 0; i < total_page; i++) {
            const data = await this.fetch_remote(this.html_parser.page_url(i + 1))
            books.push(...this.html_parser.extract_books(data))
        }
        const content_meta = await this.write_metafile<ContentMeta>({
            meta_path,
            books_index: books.map(book => book.book_id),
            books: Object.fromEntries(books.map(book => [book.book_id, book])),
        })
        await this.refresh(content_meta)
        return content_meta
    }

    async get_chapters_of_book(book_id: string, mode?: 'update' | 'local_only'): Promise<BookMeta | undefined> {
        const content_meta_path = `${this.base_dir}/metadata.json`
        const content_meta = await this.read_metafile<ContentMeta>(content_meta_path)
        if (!content_meta || !content_meta.books[book_id]) {
            return
        }
        const meta_path = `${this.base_dir}/${book_id}/metadata.json`
        const meta = await this.read_metafile<BookMeta>(meta_path)
        if (mode === 'local_only') {
            return meta
        }
        if (meta?.all_chapter_loaded && mode !== 'update') {
            return this.write_metafile<BookMeta>({ ...meta, meta_path, book_id })
        }
        const all_chapter_loaded = meta?.all_chapter_loaded ?? false
        const data = await this.fetch_remote(content_meta.books[book_id].book_url)
        const chapters = this.html_parser.extract_chapters(data)
        if (!chapters?.length) {
            throw new Error('No chapter found')
        }
        return this.write_metafile<BookMeta>({
            meta_path,
            book_id,
            book_name: content_meta.books[book_id].book_name,
            chapters: Object.fromEntries(chapters.map(chapter => [chapter.chapter_id, chapter])),
            chapters_index: chapters.map(chapter => chapter.chapter_id),
            all_chapter_loaded
        })
    }

    async get_images_of_chapter(book_id: string, chapter_id: string): Promise<ChapterMeta | undefined> {
        const book_meta_path = `${this.base_dir}/${book_id}/metadata.json`
        const book_meta = await this.read_metafile<BookMeta>(book_meta_path)
        if (!book_meta || !book_meta.chapters[chapter_id]) {
            return
        }
        const meta_path = `${this.base_dir}/${book_id}/${chapter_id}/metadata.json`
        const meta = await this.read_metafile<ChapterMeta>(meta_path)
        if (meta?.all_image_loaded) {
            return this.write_metafile<ChapterMeta>({ ...meta, meta_path, book_id, chapter_id })
        }
        const data = await this.fetch_remote(book_meta.chapters[chapter_id].chapter_url)
        const images = this.html_parser.extract_images(data)
        if (!images) {
            throw new Error('No image found')
        }
        const full_images = images.map(img => ({ ...img, image_path: `${this.base_dir}/${book_id}/${chapter_id}/${img.image_id}` }))

        return this.write_metafile<ChapterMeta>({
            meta_path,
            book_id,
            chapter_id,
            chapter_name: book_meta.chapters[chapter_id].chapter_name,
            images: Object.fromEntries(full_images.map(img => [img.image_id, img])),
            images_index: full_images.map(img => img.image_id),
            all_image_loaded: false,
        })
    }

    async write_metafile<T extends CommonMeta>(meta: Omit<T, 'updated_at'>): Promise<T> {
        await new Promise<void>((resolve, reject) => fs.mkdir(path.dirname(meta.meta_path), { recursive: true }, (err) => err ? reject(err) : resolve()))
        const full_meta = { ...meta, updated_at: Date.now() } as T
        await this.write_file(meta.meta_path, JSON.stringify(full_meta))
        return full_meta
    }

    async get_total_page() {
        const data = await this.fetch_remote(this.html_parser.page_url(1))
        return this.html_parser.extract_total_pages(data)
    }

    async sync_from_remote(book_id: string, book_meta: BookMeta) {

        const loaded_chapter_set = new Set<string>()
        for (const chapter_id of book_meta.chapters_index) {
            const chapter_meta = await this.get_images_of_chapter(book_id, chapter_id)
            if (!chapter_meta) {
                continue
            }
            if (chapter_meta.all_image_loaded) {
                loaded_chapter_set.add(chapter_id)
                this.comic_sync_state.update_chapter(book_id, chapter_id, 1)
                continue
            }
            const loaded_image_set = new Set<string>()
            const promises = chapter_meta.images_index.map(async name => {
                const { image_path, image_url } = chapter_meta.images[name]
                const exists = await this.exists(image_path)
                const loaded_image_path = exists ? image_path : await this.fetch_image(image_path, image_url)
                if (loaded_image_path) {
                    loaded_image_set.add(loaded_image_path)
                    this.comic_sync_state.update_chapter(book_id, chapter_id, loaded_image_set.size / chapter_meta.images_index.length)
                }
                return loaded_image_path
            })
            const result_arr = await Promise.all(promises)
            if (result_arr.every(path => path)) {
                chapter_meta.all_image_loaded = true
                await this.write_metafile(chapter_meta)
                loaded_chapter_set.add(chapter_id)
                this.comic_sync_state.update_book(book_id, loaded_chapter_set.size / book_meta.chapters_index.length)
            }
        }
        if (loaded_chapter_set.size === book_meta.chapters_index.length) {
            book_meta.all_chapter_loaded = true
            await this.write_metafile(book_meta)
            this.comic_sync_state.update_state(book_id, 'latest')
            return book_meta
        }
    }

    private choice<T>(list: T[]): T {
        return list[Math.floor(Math.random() * list.length)]
    }

    private async read_metafile<T>(filepath: string): Promise<T | undefined> {
        const exists = await new Promise<boolean>(resolve => fs.stat(filepath, (err) => err ? resolve(false) : resolve(true)))
        if (!exists) {
            return
        }
        const file = await this.read_file(filepath)
        return JSON.parse(file.toString('utf-8'))
    }

    private async write_file(filepath: string, data: Buffer | string): Promise<void> {
        return new Promise<void>((resolve, reject) => {
            fs.writeFile(filepath, data, err => {
                err ? reject(err) : resolve()
            })
        })
    }

    private async read_file(filepath: string): Promise<Buffer> {
        return new Promise<Buffer>((resolve, reject) => {
            fs.readFile(filepath, (err, data) => {
                err ? reject(err) : resolve(data)
            })
        })
    }

    private async exists(filepath: string): Promise<boolean> {
        return new Promise<boolean>((resolve) => {
            fs.stat(filepath, (err, stats) => {
                err ? resolve(false) : stats.size > 0 ? resolve(true) : resolve(false)
            })
        })
    }
}
