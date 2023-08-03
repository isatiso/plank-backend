import { HttpClient } from '@angular/common/http'
import { Injectable } from '@angular/core'
import { environment } from '../../../environments/environment'
import { AccountResponse, ObjectData } from 'plank-types'

@Injectable({
    providedIn: 'root'
})
export class UserApi {

    constructor(
        private http: HttpClient,
    ) {
    }

    signin(username: string, password: string) {
        return this.http.post<ObjectData<AccountResponse['signin']>>(environment.api_host + '/account/signin', { username, password })
    }

}
