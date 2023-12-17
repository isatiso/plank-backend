import { BreakpointObserver, Breakpoints } from '@angular/cdk/layout'
import { HttpClient } from '@angular/common/http'
import { Component, OnInit } from '@angular/core'
import { catchError, map, of, takeUntil, tap, timeout } from 'rxjs'
import { environment } from '../environments/environment'
import { AppService } from './app.service'
import { Base } from './base/base'

@Component({
    selector: 'p-root',
    templateUrl: './app.component.html',
    styleUrls: ['./app.component.scss']
})
export class AppComponent extends Base implements OnInit {
    title = 'plank-site'

    constructor(
        private app: AppService,
        private http_client: HttpClient,
        private breakpoint: BreakpointObserver,
    ) {
        super()
    }

    ngOnInit() {
        if (environment.check_api) {
            this.http_client.get<{ data: any }>(environment.check_api, {}).pipe(
                map(res => res.data),
                timeout(1000),
                catchError(() => of(null)),
            ).subscribe(res => this.app.private_network = !!res)
        }
        this.breakpoint.observe([Breakpoints.XSmall,]).pipe(
            takeUntil(this.destroy$),
            tap(result => this.app.small = result.breakpoints[Breakpoints.XSmall])
        ).subscribe()
        this.app.watch_combine_key()
    }
}
