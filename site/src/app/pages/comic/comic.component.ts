import { Component, OnDestroy, OnInit } from '@angular/core'
import { switchMap, takeUntil } from 'rxjs'
import { Base } from '../../base/base'
import { ComicService } from '../../services/comic.service'

@Component({
    selector: 'p-comic',
    templateUrl: './comic.component.html',
    styleUrls: ['./comic.component.scss']
})
export class ComicComponent extends Base implements OnInit, OnDestroy {

    constructor(
        private comic: ComicService,
    ) {
        super()
    }

    ngOnInit() {
        this.comic.fetch$.pipe(
            takeUntil(this.destroy$),
            switchMap(() => this.comic.fetch_book_list()),
        ).subscribe()
        this.comic.fetch$.next(null)
    }
}
