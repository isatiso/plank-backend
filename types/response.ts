import { BookInfo, ChapterMeta, ContentMeta, SyncStateData, SyncStateOverview } from './comic'
import { AccountData } from './data'
import { MarkdownDataArticle, MarkdownDataContent } from './markdown-data'
import { DockerContainerBrief } from './docker'

// export type ArrayResponse<T extends (...args: any) => Array<any> | Promise<Array<any>>> = {
//     type: 'array',
//     data: Awaited<ReturnType<T>>
// }
//
// export type LiteralResponse = {
//     type: 'literal',
//     data: null | undefined | string | boolean | number
// }
export type RestResponse<T> = {
    [K in keyof T]: (...args: any[]) => Promise<T[K]>
}

export type ObjectData<T> = {
    type: 'object',
    data: T,
}

export type AccountResponse = {
    register: {
        id: string
    }
    signin: {
        token: string
    }
    info: {
        info: ({
            _id: string
        } & AccountData) | null
    }
}

export type BaseResponse = {
    plank_environment: {
        check_api: string
        api_host: string
        comic_base: string
    }
    echo_ip: {
        ip: string
    }
    list_crash: {
        logs: {
            _id: string
            message: string
            stack: string
            read: boolean
            created_at: number
        }[]
    }
    resolve_crash: {
        matched_count: number
        modified_count: number
        upserted_id?: string
    }
    health_check: {
        echo: 'voodoo'
    }
}

export type ComicSubscribe = {
    subscribe_state: SyncStateOverview
    subscribe_book: SyncStateData
}

export type ComicResponse = {

    update_type: {
        matched_count: number
        modified_count: number
        upserted_id?: string
    }
    like: {
        matched_count: number
        modified_count: number
        upserted_id?: string
    }
    list_books: {
        books: Pick<BookInfo, 'book_id' | 'book_name' | 'state' | 'like' | 'type'>[]
    }
    book: BookInfo
    chapter: ChapterMeta
    sync_content: ContentMeta
    sync_from_remote: {
        book_id: string
        book_name: string
        state: SyncStateData['state'] | 'unknown'
        detail?: SyncStateData
        chapters?: Record<number, {
            chapter_url: string
            chapter_name: string
            chapter_id: number
        }>
        chapters_index?: number[]
    }
}

export type DockerContainerResponse = {
    list_container: DockerContainerBrief[]
}

export type MarkdownDataResponse = {
    index: MarkdownDataContent
    article: MarkdownDataArticle | MarkdownDataContent
}
