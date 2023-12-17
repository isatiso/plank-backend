import { HttpClient } from '@angular/common/http'
import { Injectable } from '@angular/core'
import { environment } from '../../../environments/environment'
import { DockerContainerResponse, ObjectData } from 'plank-types'

@Injectable({
    providedIn: 'root'
})
export class DockerContainerApi {

    constructor(
        private http: HttpClient,
    ) {
    }

    list_container() {
        return this.http.get<ObjectData<DockerContainerResponse['list_container']>>(environment.api_host + '/docker/list-container')
    }
}
