import { BookBrief, ChapterBrief, ImageBrief } from 'plank-types'

export interface HtmlParserInterface {

    page_url(page: number): string

    extract_total_pages(data: string): number

    extract_books(data: string): BookBrief[]

    extract_chapters(data: string): ChapterBrief[]

    extract_images(data: string): Omit<ImageBrief, 'image_path'>[]
}
