import { ComicRecord } from './data'

export type SyncState = 'idle' | 'processing' | 'latest'

export interface SyncStateData {
    book_id: string
    book_name: string
    state: SyncState
    chapters_index: string[]
    chapter_progress: number
    chapters: Record<string, number>
}

export type SyncStateOverview = Record<string, Pick<SyncStateData, 'book_id' | 'book_name' | 'state'>>

export interface CommonMeta {
    meta_path: string
    updated_at: number
}

export interface ContentMeta extends CommonMeta {
    books_index: string[]
    books: Record<string, BookBrief>
}

export interface BookMeta extends CommonMeta {
    book_id: string
    book_name: string
    chapters_index: string[]
    all_chapter_loaded: boolean
    chapters: Record<string, ChapterBrief>
}

export interface ChapterMeta extends CommonMeta {
    book_id: string
    chapter_id: string
    chapter_name: string
    images_index: string[]
    all_image_loaded: boolean
    images: Record<string, ImageBrief>
}

export type BookBrief = {
    book_id: string
    book_name: string
    book_url: string
}

export type ChapterBrief = {
    chapter_id: string
    chapter_name: string
    chapter_url: string
}

export type ImageBrief = {
    image_id: string
    image_path: string
    image_url: string
}

export type BookInfo = BookMeta & ComicRecord & {
    state: 'idle' | 'processing' | 'latest'
}
