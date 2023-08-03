import { ContentType, Get, Params, PathArgs, throw_not_found, TpRequest, TpResponse, TpRouter } from '@tarpit/http'
import axios from 'axios'
import { EjsTemplateService } from '../services/ejs-template.service'

@TpRouter('/comic', {})
export class ComicRouter {

    constructor(
        private template: EjsTemplateService,
    ) {
    }

    @Get('/chapter/:book_id/:chapter_id')
    @ContentType('text/html')
    async chapter(request: TpRequest, args: PathArgs<{ book_id: string, chapter_id: string }>) {
        if (request.hostname !== '10.3.3.32') {
            throw_not_found()
        }
        const book_id = args.ensure('book_id', /^\d+$/)
        const chapter_id = args.ensure('chapter_id', /^\d+$/)
        const book_data = await axios.get<any>(`https://comic.tarpit.cn/${book_id}/metadata.json`).then(res => res.data)
        const name = book_data.book_name
        const chapters: Record<string, { chapter_title: string, chapter_url: string, chapter_id: string }> = book_data.chapters
        const chapters_index: string[] = book_data.chapters_index
        const chapter = chapters[chapter_id]
        const cur = chapters_index.indexOf(chapter_id)
        if (cur === -1) {
            throw_not_found()
        }
        const prev = chapters[chapters_index[cur - 1]]
        const next = chapters[chapters_index[cur + 1]]

        const chapter_data = await axios.get<any>(`https://comic.tarpit.cn/${book_id}/${chapter_id}/metadata.json`).then(res => res.data)
        return this.template.render('page_comic_chapter', {
            name,
            book_id,
            chapter,
            images: chapter_data.images,
            images_index: chapter_data.images_index,
            prev,
            next,
        })
    }

    @Get('/book/:id')
    @ContentType('text/html')
    async book(request: TpRequest, args: PathArgs<{ id: string }>) {
        if (request.hostname !== '10.3.3.32') {
            throw_not_found()
        }
        const book_id = args.ensure('id', /^\d+$/)
        const res = await axios.get<any>(`https://comic.tarpit.cn/${book_id}/metadata.json`)
        const name = res.data.book_name
        const chapters: Record<string, { title: string, url: string, chapter_id: string, images: string[] }> = res.data.chapters
        const chapters_index: string[] = res.data.chapters_index
        return this.template.render('page_comic_book', {
            name,
            book_id,
            chapters: chapters_index.map(id => chapters[id])
        })
    }

    @Get('')
    @ContentType('text/html')
    async index(response: TpResponse) {
        response.redirect('/comic/1', 302)
    }

    @Get(':page?')
    @ContentType('text/html')
    async page(request: TpRequest, args: PathArgs<{ page: string }>, query: Params<{ search: string }>) {
        if (request.hostname !== '10.3.3.32') {
            throw_not_found()
        }
        const search = query.get_first('search') ?? ''
        const page_str = args.get_if('page', /^\d+$/, '1')
        const res = await axios.get<any>('https://comic.tarpit.cn/main-meta.json')
        const books = Object.entries<any>(res.data)
            .filter(([, book_name]) => !search || book_name.includes(search))
            .sort((a, b) => +b[1] - +a[1])
        const total_pages = Math.floor(books.length / 10) + 1
        const page = Math.max(0, Math.min(total_pages, +page_str))
        return this.template.render('page_comic', {
            books: books.slice(page * 10 - 10, page * 10),
            page,
            total_pages,
            has_prev: page > 1,
            prev: page - 1,
            has_next: page < total_pages,
            next: page + 1,
        })
    }
}
