import { Injector, TpService } from '@tarpit/core'
import axios from 'axios'
import fs from 'fs'
import { parse } from 'node-html-parser'
import path from 'path'
import { BookMeta, ChapterMeta, CommonMeta, ContentMeta } from 'plank-types'
import ua_list from '../../../user-agents.json'
import { sleep } from '../../tools/async-tools'
import { ComicSyncStateService } from './comic-sync-state.service'

@TpService()
export class ComicSpiderService {

    private base_url = process.env['COMIC_BASE_URL']
    private base_dir = process.env['COMIC_PATH']
    private user_agent = this.choice(ua_list)

    constructor(
        private injector: Injector,
        private comic_sync_state: ComicSyncStateService,
    ) {
        this.injector.on('start', async () => this.refresh())
    }

    async refresh(content?: ContentMeta) {
        content = content ?? await this.get_content()
        for (const [book_id, book_name] of content.books) {
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
        console.log('total_page', total_page)
        const books: (readonly [string, string])[] = []
        for (let i = 0; i < total_page; i++) {
            const data = await this.fetch_remote(this.base_url + `/index.php/category/page/${i + 1}`)
            const a = parse(data).querySelector('div.cate-comic-list')
                ?.querySelectorAll('div.common-comic-item')

            const content = a?.map(div => {
                const link = div.querySelector('a.cover')?.getAttribute('href')
                console.log('href', link)
                const title = div.querySelector('p.comic__title a')?.textContent
                return [link, title]
            })
                ?.filter((link): link is [string, string] => !!link[0] && !!link[1])
                ?.map(link => [link[0].split('/').slice(-1)[0], link[1]] as const)
            console.log(content)
            if (content?.length) {
                books.push(...content)
            }
        }
        const book_ids = [...new Set(books.map(([id]) => id))].sort((a, b) => a.localeCompare(b))
        const titles = Object.fromEntries(books)
        console.log(book_ids)
        console.log(titles)
        const content_meta = await this.write_metafile<ContentMeta>({
            meta_path,
            books: book_ids.map(id => [id, titles[id]]),
            last_updated: Date.now(),
        })
        await this.refresh(content_meta)
        return content_meta
    }

    async get_chapters_of_book(book_id: string, mode?: 'update' | 'local_only'): Promise<BookMeta | undefined> {
        const meta_path = `${this.base_dir}/${book_id}/metadata.json`
        const meta = await this.read_metafile<BookMeta>(meta_path)
        if (mode === 'local_only') {
            return meta
        }
        if (meta?.all_chapter_loaded && mode !== 'update') {
            return this.write_metafile<BookMeta>({ ...meta, meta_path, book_id })
        }
        const all_chapter_loaded = meta?.all_chapter_loaded ?? false
        const data = await this.fetch_remote(this.base_url + `/index.php/comic/${book_id}`)
        const book_name = parse(data).querySelector('p.comic-title.j-comic-title')?.textContent ?? 'Unknown'
        const links = parse(data).querySelector('ul.chapter__list-box.clearfix')?.querySelectorAll('li a.j-chapter-link')
            ?.map(a => ({ name: a?.textContent?.trim(), link: a?.getAttribute('href') }))
        if (!links) {
            throw new Error('No chapter found')
        }
        const chapters = meta?.chapters ?? {}
        const chapters_index: number[] = []
        for (const link of links) {
            if (!link?.link) {
                continue
            }
            const chapter_name = link.name ?? 'Unknown'
            const chapter_url = link.link
            const chapter_id = +(link.link.split('/').slice(-1)[0])
            chapters_index.push(chapter_id)
            if (chapters[chapter_id]) {
                chapters[chapter_id].chapter_name = chapter_name
            } else {
                chapters[chapter_id] = { chapter_name, chapter_url, chapter_id }
            }
        }
        return this.write_metafile<BookMeta>({ meta_path, book_id, book_name, chapters, chapters_index, all_chapter_loaded })
    }

    async get_images_of_chapter(book_id: string, chapter_id: number): Promise<ChapterMeta> {
        const meta_path = `${this.base_dir}/${book_id}/${chapter_id}/metadata.json`
        const meta = await this.read_metafile<ChapterMeta>(meta_path)
        if (meta?.all_image_loaded) {
            return this.write_metafile<ChapterMeta>({ ...meta, meta_path, book_id, chapter_id })
        }
        const data = await this.fetch_remote(this.base_url + `/index.php/chapter/${chapter_id}`)
        const links = parse(data).querySelectorAll('img.lazy-read')?.map(img => img.getAttribute('data-original'))
            ?.filter((link): link is string => !!link)
        if (!links) {
            throw new Error('No image found')
        }
        const images = meta?.images ?? {}
        const images_index: string[] = []
        for (const link of links) {
            const image_name = link.split('/').slice(-1)[0]
            images_index.push(image_name)
            if (!images[image_name]) {
                images[image_name] = {
                    image_path: `${this.base_dir}/${book_id}/${chapter_id}/${image_name}`,
                    image_url: link,
                }
            }
        }

        return this.write_metafile<ChapterMeta>({ meta_path, book_id, chapter_id, images, images_index, all_image_loaded: false })
    }

    async write_metafile<T extends CommonMeta>(meta: Omit<T, 'updated_at'>): Promise<T> {
        await new Promise<void>((resolve, reject) => fs.mkdir(path.dirname(meta.meta_path), { recursive: true }, (err) => err ? reject(err) : resolve()))
        const full_meta = { ...meta, updated_at: Date.now() } as T
        await this.write_file(meta.meta_path, JSON.stringify(full_meta))
        return full_meta
    }

    async get_total_page() {
        const data = await this.fetch_remote(this.base_url + `/index.php/category/page/1`)
        const last_page_str = parse(data).querySelector('div#Pagination a.end')?.getAttribute('href')?.split('/').slice(-1)[0] ?? '1'
        return +last_page_str
    }

    async sync_from_remote(book_id: string, book_meta: BookMeta) {

        const loaded_chapter_set = new Set<number>()
        for (const chapter_id of book_meta.chapters_index) {
            const chapter_meta = await this.get_images_of_chapter(book_id, chapter_id)
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
