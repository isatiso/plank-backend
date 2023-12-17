import { Component, OnDestroy, OnInit } from '@angular/core'
import { ActivatedRoute, Router } from '@angular/router'
import { fromEvent, Subject, switchMap, takeUntil, tap } from 'rxjs'
import { Base } from '../../../base/base'
import { ComicService } from '../../../services/comic.service'
import { environment } from '../../../../environments/environment'

@Component({
    selector: 'p-chapter',
    templateUrl: './chapter.component.html',
    styleUrls: ['./chapter.component.scss']
})
export class ChapterComponent extends Base implements OnInit, OnDestroy {
    book_id = ''
    chapter_id = 0
    book_name = ''
    chapter_name = ''
    chapters_index: number[] = []
    image_list: { image_path: string }[] = []
    prev_chapter = 0
    next_chapter = 0
    show_overlay = true

    getBookInfo$ = new Subject()
    getChapterInfo$ = new Subject()

    constructor(
        private route: ActivatedRoute,
        private router: Router,
        private comic: ComicService,
    ) {
        super()
    }

    figure_out_around() {
        const index = this.chapters_index.findIndex(ch => ch === this.chapter_id)
        if (index === -1) {
            this.prev_chapter = 0
            this.next_chapter = 0
        } else {
            this.prev_chapter = this.chapters_index[index - 1] ?? 0
            this.next_chapter = this.chapters_index[index + 1] ?? 0
        }
    }

    ngOnInit() {
        fromEvent(window, 'scroll').pipe(
            takeUntil(this.destroy$),
            tap((e: any) => {
                const scroll_top = e.target.scrollTop || e.target.scrollingElement?.scrollTop
                this.show_overlay = scroll_top > 500
            }),
        ).subscribe()
        this.getBookInfo$.pipe(
            takeUntil(this.destroy$),
            switchMap(() => this.comic.fetch_book(this.book_id)),
            tap(res => console.log(res)),
            tap(res => this.book_name = res.book_name),
            tap(res => this.chapters_index = res.chapters_index),
            tap(res => this.chapter_name = res.chapters[this.chapter_id]?.chapter_name),
            tap(() => this.figure_out_around())
        ).subscribe()
        this.getChapterInfo$.pipe(
            takeUntil(this.destroy$),
            switchMap(() => this.comic.fetch_chapter(this.book_id, this.chapter_id)),
            tap(res => console.log('chapter', res)),
            tap(res => this.image_list = res.images_index.map(key => res.images[key])),
        ).subscribe()
        this.route.paramMap.pipe(
            takeUntil(this.destroy$),
            tap(params => this.book_id = params.get('book_id')!),
            tap(params => this.chapter_id = +params.get('chapter_id')!),
            tap(() => this.getBookInfo$.next(null)),
            tap(() => this.getChapterInfo$.next(null)),
            tap(() => this.scroll_top('instant')),
        ).subscribe()
    }

    go_back() {
        this.router.navigate(
            ['comic', 'book', this.book_id],
            { queryParams: { highlight_chapter: this.chapter_id } }
        ).then()
    }

    scroll_top(behavior: ScrollBehavior = 'smooth') {
        window.scroll({
            top: 0,
            left: 0,
            behavior: behavior
        })
    }

    protected readonly environment = environment
}
