import { HttpClient } from '@angular/common/http'
import { Injectable } from '@angular/core'
import { MatDialog } from '@angular/material/dialog'
import { Params, Router } from '@angular/router'
import { BehaviorSubject, filter, map, Observable, Subject, tap } from 'rxjs'
import { webSocket } from 'rxjs/webSocket'
import { environment } from '../../environments/environment'
import { EditPageComponent } from '../pages/comic/book-list/edit-page/edit-page.component'
import type { ComicResponse, ComicSubscribe } from 'plank-types'
import { ObjectData } from 'plank-types'

// type PlankResponse = any
export interface SyncState {
    book_id: string
    book_name: string
    state: 'idle' | 'processing' | 'latest'
    chapters_index: number[]
    chapter_progress: number
    chapters: Record<number, number>
}

export type SyncStateOverview = Record<string, Pick<SyncState, 'book_id' | 'book_name' | 'state'>>

export type BookInfo = {
    book_id: string
    book_name: string
    state: string
    type: 'photo' | 'gray' | 'color' | 'boring'
    like: boolean
}

@Injectable({
    providedIn: 'root'
})
export class ComicService {

    readonly page_size = 20
    all_book_list: BookInfo[] = []
    book_list: BookInfo[] = []
    total_page = 0
    page = 1

    fetch$ = new Subject()
    allBookList$ = new BehaviorSubject<BookInfo[]>([])
    bookList$ = new BehaviorSubject<BookInfo[]>([])

    constructor(
        private http_client: HttpClient,
        private dialog: MatDialog,
        private router: Router,
    ) {
    }

    sync_content() {
        return this.http_client.post<ObjectData<ComicResponse['sync_content']>>(environment.api_host + '/comic-data/sync-content', {})
            .pipe(
                map(res => res.data.books),
            )
    }

    sync_from_remote(book_id: string, update: boolean) {
        return this.http_client.post<ObjectData<ComicResponse['sync_from_remote']>>(
            environment.api_host + '/comic-data/sync-from-remote', { book_id, update }
        ).pipe(
            map(res => res.data),
        )
    }

    subscribe_overview() {
        return webSocket<ComicSubscribe['subscribe_state']>(
            'wss://' + environment.api_hostname + '/comic-data/subscribe-state'
        ).asObservable()
    }

    subscribe_book(book_id: string) {
        return webSocket<ComicSubscribe['subscribe_book']>(
            'wss://' + environment.api_hostname + `/comic-data/subscribe-book/${book_id}`
        ).asObservable()
    }

    update_type(book_id: string, type: 'photo' | 'gray' | 'color' | 'boring') {
        return this.http_client.post<ObjectData<ComicResponse['update_type']>>(
            environment.api_host + '/comic-data/update-type', { book_id, type })
    }

    like(book_id: string, value: boolean) {
        return this.http_client.post<ObjectData<ComicResponse['like']>>(
            environment.api_host + '/comic-data/like', { book_id, value })
    }

    fetch_book_list(): Observable<BookInfo[]> {
        return this.http_client.get<ObjectData<ComicResponse['list_books']>>(
            environment.api_host + '/comic-data/list-books'
        ).pipe(
            tap(res => console.log(res)),
            map(res => res.data.books),
            tap(list => this.all_book_list = list),
            tap(() => this.total_page = Math.ceil(this.all_book_list.length / this.page_size)),
            tap(list => this.allBookList$.next(list)),
            tap(() => this.update_page()),
        )
    }

    fetch_book(book_id: string) {
        return this.http_client.get<ObjectData<ComicResponse['book']>>(environment.api_host + `/comic-data/book/${book_id}`).pipe(
            tap(res => console.log(res)),
            map(res => res.data),
        )
    }

    fetch_chapter(book_id: string, chapter_id: number) {
        return this.http_client.get<{
            data: {
                book_id: string
                chapter_id: number
                images_index: string[]
                images: Record<string, {
                    image_path: string
                    image_url: string
                }>
            }
        }>(environment.api_host + `/comic-data/chapter/${book_id}/${chapter_id}`).pipe(
            tap(res => console.log(res)),
            map(res => res.data),
        )
    }

    go_page_of_book(book_id: string) {
        const index = this.all_book_list.findIndex(book => book.book_id === book_id)
        console.log('go_page_of_book', book_id, index, this.all_book_list)
        if (index === -1) {
            this.go_page(1)
        }
        this.go_page(Math.ceil((index + 1) / this.page_size), { highlight_book: book_id })
    }

    go_page(page: number, query?: Params) {
        this.router.navigate(['comic', 'book-list', page], { queryParams: query }).then()
    }

    go_last_page() {
        this.go_page(this.page - 1)
    }

    go_next_page() {
        this.go_page(this.page + 1)
    }

    update_page(page?: number) {
        this.page = page ?? this.page
        if (!this.all_book_list.length) {
            return
        }
        this.book_list = this.all_book_list.slice((this.page - 1) * this.page_size, this.page * this.page_size)
        this.bookList$.next(this.book_list)
    }

    search_book() {
        this.dialog.open(EditPageComponent, { data: '' }).afterClosed().pipe(
            filter(target => target !== undefined),
            map(target => this.all_book_list.filter(book => book.book_name.includes(target))),
            filter(books => books.length > 0),
            tap(books => this.book_list = books),
            tap(books => this.bookList$.next(books)),
        ).subscribe()
    }
}
