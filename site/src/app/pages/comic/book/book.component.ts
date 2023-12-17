import { Component, OnDestroy, OnInit } from '@angular/core'
import { ActivatedRoute, Router } from '@angular/router'
import { ChapterBrief } from 'plank-types'
import { filter, Subject, switchMap, takeUntil, takeWhile, tap, throttleTime } from 'rxjs'
import { Base } from '../../../base/base'
import { ComicService, SyncState } from '../../../services/comic.service'
import { UserService } from '../../../services/user.service'

@Component({
    selector: 'p-book',
    templateUrl: './book.component.html',
    styleUrls: ['./book.component.scss']
})
export class BookComponent extends Base implements OnInit, OnDestroy {

    book_id = ''
    book_name = ''
    state: 'idle' | 'processing' | 'latest' | undefined
    like: boolean = false
    type: 'photo' | 'gray' | 'color' | 'boring' = 'color'
    chapter_list: ChapterBrief[] = []
    highlight_chapter = ''
    sync_state: SyncState | undefined
    waiting_for_sync = false

    subscribeState$ = new Subject()
    syncFromRemote$ = new Subject<boolean>()
    getBookInfo$ = new Subject()
    like$ = new Subject<boolean>()
    updateType$ = new Subject<'photo' | 'gray' | 'color' | 'boring'>()

    constructor(
        public user: UserService,
        public router: Router,
        public comic: ComicService,
        private route: ActivatedRoute,
    ) {
        super()
    }

    ngOnInit() {
        this.getBookInfo$.pipe(
            takeUntil(this.destroy$),
            throttleTime(800),
            switchMap(() => this.comic.fetch_book(this.book_id)),
            tap(res => {
                this.book_id = res.book_id
                this.book_name = res.book_name
                this.state = res.state as any
                this.like = res.like
                this.type = res.type
                if (res.state !== 'latest') {
                    this.subscribeState$.next(null)
                }
            }),
            filter(res => res.state !== 'idle'),
            tap(res => this.chapter_list = res.chapters_index.map(chapter_id => res.chapters[chapter_id])),
        ).subscribe()
        this.subscribeState$.pipe(
            takeUntil(this.destroy$),
            filter(() => this.state !== 'latest'),
            switchMap(() => this.comic.subscribe_book(this.book_id)),
            tap(res => this.sync_state = res),
            tap(res => this.state = res.state),
            tap(res => res.state === 'latest' && this.getBookInfo$.next(null)),
            takeWhile(() => this.state !== 'latest'),
        ).subscribe()
        this.syncFromRemote$.pipe(
            takeUntil(this.destroy$),
            throttleTime(500),
            tap(() => this.waiting_for_sync = true),
            switchMap(update => this.comic.sync_from_remote(this.book_id, update)),
            tap(() => this.waiting_for_sync = false),
            tap(res => this.chapter_list = res.chapters_index?.map(chapter_id => res.chapters![chapter_id]) ?? []),
            tap(() => this.subscribeState$.next(null)),
        ).subscribe()
        this.updateType$.pipe(
            takeUntil(this.destroy$),
            throttleTime(500),
            switchMap(value => this.comic.update_type(this.book_id, value)),
            tap(() => this.getBookInfo$.next(null)),
            tap(res => console.log(res)),
        ).subscribe()
        this.like$.pipe(
            takeUntil(this.destroy$),
            throttleTime(500),
            switchMap(value => this.comic.like(this.book_id, value)),
            tap(() => this.getBookInfo$.next(null)),
            tap(res => console.log(res)),
        ).subscribe()
        this.route.queryParams.pipe(
            takeUntil(this.destroy$),
            tap(params => this.highlight_chapter = params['highlight_chapter']),
        ).subscribe()
        this.route.paramMap.pipe(
            takeUntil(this.destroy$),
            tap(params => this.book_id = params.get('book_id')!),
            tap(() => this.getBookInfo$.next(null)),
        ).subscribe()
    }
}
