import { HttpClient } from '@angular/common/http'
import { Component, OnDestroy, OnInit } from '@angular/core'
import { Subject, switchMap, takeUntil } from 'rxjs'
import { environment } from '../../../environments/environment'
import { Base } from '../../base/base'
import { PopupService } from '../../popup/popup.service'
import { BaseApi } from '../../services/apis/base.api'

@Component({
    selector: 'p-about',
    templateUrl: './about.component.html',
    styleUrls: ['./about.component.scss']
})
export class AboutComponent extends Base implements OnInit, OnDestroy {

    value: string = ''
    socket?: WebSocket = undefined

    messages: string[] = []
    input_value = ''
    ip = ''

    private fetchIp$ = new Subject()
    updateRecord$ = new Subject()

    constructor(
        public popup: PopupService,
        private http_client: HttpClient,
        private base_api: BaseApi,
    ) {
        super()
    }

    ngOnInit() {
        this.fetchIp$.pipe(
            takeUntil(this.destroy$),
            switchMap(() => this.base_api.echo_ip()),
        ).subscribe(res => this.ip = res.data.ip)
        this.fetchIp$.next(null)
        this.socket = new WebSocket('wss://' + environment.api_host + '/account/subscribe/123')
        this.socket.onmessage = msg => this.messages.push(msg.data)
    }

    override ngOnDestroy() {
        super.ngOnDestroy()
        this.socket?.close()
    }

    popup_input() {
        this.popup.input({ label: '用户名', hint: '如果不知道写什么就随便', placeholder: 'qqqqqqq' }).subscribe(value => {
            console.log('value', value)
            this.input_value = value
        })
    }

    test() {
        this.http_client.post(environment.api_host + '/account/send/123', { msg: this.value }).subscribe(data => {
            console.log('eeeeeee', data)
            this.value = ''
        })
    }

    test2() {
        this.socket?.send(this.value)
        this.value = ''
    }

}
