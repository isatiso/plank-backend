import { Component, OnInit } from '@angular/core'
import { NavigationEnd, Router } from '@angular/router'
import { filter, map, Subject, switchMap, takeUntil, throttleTime } from 'rxjs'
import { Base } from '../../base/base'
import { MarkdownService } from '../../services/markdown.service'

@Component({
    selector: 'app-markdown',
    templateUrl: './markdown.component.html',
    styleUrls: ['./markdown.component.scss']
})
export class MarkdownComponent extends Base implements OnInit {

    marked_content = ''
    articles: { name: string, path: string, type: 'dir' | 'file' }[] = []
    breadcrumb: { name: string, path: string }[] = []

    loadContent$ = new Subject<string>()

    constructor(
        public router: Router,
        private marked: MarkdownService,
    ) {
        super()
    }

    ngOnInit() {
        this.loadContent$.pipe(
            takeUntil(this.destroy$),
            throttleTime(300),
            map(path => path.replace(/^\/marked\/?/, '')),
            switchMap(path => this.marked.get_article_desc(path)),
        ).subscribe(res => {
            this.breadcrumb = res.breadcrumb
            if (res.type === 'content') {
                this.articles = res.articles
                this.marked_content = ''
            } else {
                this.marked_content = this.marked.render(res.file_content)
                this.articles = []
            }
        })
        this.router.events.pipe(
            takeUntil(this.destroy$),
            filter((event): event is NavigationEnd => event instanceof NavigationEnd),
        ).subscribe(event => this.loadContent$.next(event.url))
        this.loadContent$.next(this.router.url)
    }
}
