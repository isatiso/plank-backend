import { HttpClient } from '@angular/common/http'
import { Injectable } from '@angular/core'
import * as marked from 'marked'
import { environment } from '../../environments/environment'
import { MarkdownDataResponse, ObjectData } from 'plank-types'
import { map } from 'rxjs'

@Injectable({
    providedIn: 'root'
})
export class MarkdownService {

    constructor(
        private http: HttpClient,
    ) {
    }

    render(content: string, options?: Parameters<typeof marked.marked>[1]) {
        return marked.marked(content, options)
    }

    get_article_desc(path: string) {
        return this.http.get<ObjectData<MarkdownDataResponse['article']>>(environment.api_host + '/api/marked/' + path)
            .pipe(
                map(res => res.data),
            )
    }
}
