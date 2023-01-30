import { HttpClient } from '@angular/common/http'
import { Injectable } from '@angular/core'
import { environment } from '../../../environments/environment'

@Injectable({
    providedIn: 'root'
})
export class DockerContainerApi {

    constructor(
        private http: HttpClient,
    ) {
    }

    list_container() {
        return this.http.get<any[]>(environment.api_host + '/docker/list-container')
    }
}
