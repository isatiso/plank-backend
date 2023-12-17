import { TpService } from '@tarpit/core'
import { parse } from 'node-html-parser'
import { BookBrief, ChapterBrief, ImageBrief } from 'plank-types'
import { HtmlParserInterface } from './html-parser.interface'

@TpService()
export class HtmlParserV1Service implements HtmlParserInterface {

    private base_url = process.env['COMIC_BASE_URL']

    page_url(page: number): string {
        return this.base_url + `/index.php/category/page/${page}`
    }

    extract_total_pages(data: string) {
        const last_page_str = parse(data).querySelector('div#Pagination a.end')?.getAttribute('href')?.split('/').slice(-1)[0] ?? '1'
        return +last_page_str
    }

    extract_books(data: string): BookBrief[] {
        return parse(data).querySelector('div.cate-comic-list')
            ?.querySelectorAll('div.common-comic-item')
            ?.map(div => [div.querySelector('a.cover')?.getAttribute('href'), div.querySelector('p.comic__title a')?.textContent])
            ?.filter((link): link is [string, string] => !!link[0] && !!link[1])
            ?.map(link => ({
                book_id: link[0].split('/').slice(-1)[0],
                book_name: link[1],
                book_url: link[0]
            } as BookBrief)) ?? []
    }

    extract_chapters(data: string): ChapterBrief[] {
        return parse(data).querySelector('ul.chapter__list-box.clearfix')?.querySelectorAll('li a.j-chapter-link')
            ?.map(a => ({
                chapter_id: a.getAttribute('href')?.split('/').slice(-1)[0],
                chapter_name: a.textContent?.trim(),
                chapter_url: a.getAttribute('href')
            }))
            ?.filter((c): c is ChapterBrief => !!c.chapter_id && !!c.chapter_name && !!c.chapter_url) ?? []
    }

    extract_images(data: string): Omit<ImageBrief, 'image_path'>[] {
        return parse(data).querySelectorAll('img.lazy-read')?.map(img => img.getAttribute('data-original'))
            ?.filter((link): link is string => !!link)
            ?.map(link => ({
                image_id: link.split('/').slice(-1)[0],
                image_url: link,
            }))
            ?.filter(img => img.image_id && img.image_url)
    }
}
