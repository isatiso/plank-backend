import { HttpClient } from '@angular/common/http'
import { Injectable } from '@angular/core'
import { environment } from '../../../environments/environment'
import { BaseResponse, ObjectData } from 'plank-types'

@Injectable({
    providedIn: 'root'
})
export class BaseApi {

    constructor(
        private http: HttpClient,
    ) {
    }

    echo_ip() {
        return this.http.get<ObjectData<BaseResponse['echo_ip']>>(environment.api_host + '/echo-ip')
    }

    // get_record(book_id: number) {
    //     return this.http.get<ObjectData<BaseResponse['get_record']>>(environment.api_host + '/comic/record/' + book_id)
    // }

}
