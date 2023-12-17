import { Component, HostListener, OnDestroy, OnInit } from '@angular/core'
import { filter, takeUntil, tap } from 'rxjs'
import { AppService } from '../../app.service'
import { Base } from '../../base/base'
import { UserService } from '../../services/user.service'

@Component({
    selector: 'p-header',
    templateUrl: './header.component.html',
    styleUrls: ['./header.component.scss'],
})
export class HeaderComponent extends Base implements OnInit, OnDestroy {

    @HostListener('window:keyup', ['$event']) listenCombineKey = this.app.listenCombineKey

    _show_comic = false

    constructor(
        public user: UserService,
        public app: AppService,
    ) {
        super()
    }

    get show_comic() {
        return this.app.private_network && this.user.user_info
    }

    ngOnInit(): void {
        this.app.combineKeyEmit$.pipe(
            takeUntil(this.destroy$),
            filter(e => e.code === '口寄せの術'),
            tap(() => this._show_comic = true)
        ).subscribe()
    }
}
