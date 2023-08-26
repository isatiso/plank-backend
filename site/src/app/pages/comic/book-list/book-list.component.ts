import { Component, OnDestroy, OnInit } from '@angular/core'
import { ThemePalette } from '@angular/material/core'
import { ActivatedRoute } from '@angular/router'
import { debounceTime, Subject, switchMap, takeUntil, tap, throttleTime } from 'rxjs'
import { Base } from '../../../base/base'
import { ComicService, SyncStateOverview } from '../../../services/comic.service'

@Component({
    selector: 'p-book-list',
    templateUrl: './book-list.component.html',
    styleUrls: ['./book-list.component.scss']
})
export class BookListComponent extends Base implements OnInit, OnDestroy {

    bufferPageChange$ = new Subject<number>()
    subscribeOverview$ = new Subject()
    refresh$ = new Subject<void>()

    overview_state: SyncStateOverview = {}
    highlight_book = 0

    constructor(
        public comic: ComicService,
        private route: ActivatedRoute,
    ) {
        super()
    }

    ngOnInit() {
        this.refresh$.pipe(
            takeUntil(this.destroy$),
            throttleTime(500),
            switchMap(() => this.comic.sync_content()),
        ).subscribe()
        this.subscribeOverview$.pipe(
            takeUntil(this.destroy$),
            switchMap(() => this.comic.subscribe_overview()),
            takeUntil(this.destroy$),
            tap(res => this.overview_state = res),
            tap(res => console.log('overview_state', res)),
        ).subscribe()
        this.bufferPageChange$.pipe(
            takeUntil(this.destroy$),
            debounceTime(200),
            tap(page => this.comic.go_page(page)),
        ).subscribe()
        this.route.queryParams.pipe(
            takeUntil(this.destroy$),
            tap(params => this.highlight_book = +params['highlight_book']),
        ).subscribe()
        this.route.paramMap.pipe(
            takeUntil(this.destroy$),
            tap(params => this.comic.update_page(+params.get('page')!)),
        ).subscribe()
        this.subscribeOverview$.next(null)
    }

    map_color(type: 'photo' | 'gray' | 'color' | 'boring'): ThemePalette | undefined {
        switch (type) {
            case 'color':
                return 'accent'
            case 'gray':
                return
            case 'photo':
                return 'primary'
            default:
                return 'accent'
        }
    }
}
