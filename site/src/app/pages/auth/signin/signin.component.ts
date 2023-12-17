import { Component, HostListener, OnDestroy, OnInit } from '@angular/core'
import { Router } from '@angular/router'
import { Subject, switchMap, takeUntil, tap, throttleTime } from 'rxjs'
import { Base } from '../../../base/base'
import { UserApi } from '../../../services/apis/user.api'
import { UserService } from '../../../services/user.service'

@Component({
    selector: 'p-signin',
    templateUrl: './signin.component.html',
    styleUrls: ['./signin.component.scss']
})
export class SigninComponent extends Base implements OnInit, OnDestroy {

    username = ''
    password = ''

    requestSignIn$ = new Subject()

    constructor(
        private user_api: UserApi,
        private user: UserService,
        private router: Router,
    ) {
        super()
    }

    @HostListener('keyup.enter')
    on_enter() {
        this.requestSignIn$.next(null)
    }

    ngOnInit() {
        this.requestSignIn$.pipe(
            takeUntil(this.destroy$),
            throttleTime(500),
            switchMap(() => this.user_api.signin(this.username, this.password)),
            tap(res => this.user.set_info(res.data.token, { username: this.username })),
            tap(() => this.router.navigate(['/'])),
        ).subscribe()
    }
}
