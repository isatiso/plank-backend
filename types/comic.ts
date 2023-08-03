import { ComicRecord } from './data'

export type SyncState = 'idle' | 'processing' | 'latest'

export interface SyncStateData {
    book_id: number
    book_name: string
    state: SyncState
    chapters_index: number[]
    chapter_progress: number
    chapters: Record<number, number>
}

export type SyncStateOverview = Record<number, Pick<SyncStateData, 'book_id' | 'book_name' | 'state'>>

export interface CommonMeta {
    meta_path: string
    updated_at: number
}

export type ChapterBrief = {
    chapter_id: number
    chapter_name: string
    chapter_url: string
}

export type ImageBrief = {
    image_path: string,
    image_url: string
}

export interface ContentMeta extends CommonMeta {
    books: [book_id: number, book_name: string][]
    last_updated: number
}

export interface BookMeta extends CommonMeta {
    book_id: number
    book_name: string
    chapters_index: number[]
    all_chapter_loaded: boolean
    chapters: Record<number, ChapterBrief>
}

export interface ChapterMeta extends CommonMeta {
    book_id: number
    chapter_id: number
    images_index: string[]
    all_image_loaded: boolean
    images: Record<string, ImageBrief>
}

export type BookInfo = BookMeta & ComicRecord & {
    state: 'idle' | 'processing' | 'latest'
}
