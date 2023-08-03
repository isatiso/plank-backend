import { Injectable } from '@angular/core'
import {
    HttpRequest,
    HttpHandler,
    HttpEvent,
    HttpInterceptor
} from '@angular/common/http'
import { Observable } from 'rxjs'
import { environment } from '../../environments/environment'
import { UserService } from '../services/user.service'

@Injectable()
export class AuthInterceptor implements HttpInterceptor {

    constructor(
        private user: UserService,
    ) {
    }

    intercept(request: HttpRequest<unknown>, next: HttpHandler): Observable<HttpEvent<unknown>> {
        if (this.user.token && new URL(request.url).host === environment.api_hostname) {
            const headers = request.headers.set('Authorization', 'Tarpit ' + this.user.token)
            request = request.clone({ headers })
        }
        return next.handle(request)
    }
}
