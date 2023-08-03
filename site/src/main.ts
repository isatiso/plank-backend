import { platformBrowserDynamic } from '@angular/platform-browser-dynamic'
import { AppModule } from './app/app.module'
import { environment } from './environments/environment'
import { BaseResponse } from 'plank-types'

fetch('/plank-environment').then(res => res.json()).then(res => {
    const data: BaseResponse['plank_environment'] = res.data
    environment.api_hostname = data.api_host
    environment.api_host = 'https://' + data.api_host
    environment.check_api = data.check_api
    environment.comic_base = data.comic_base
    platformBrowserDynamic().bootstrapModule(AppModule)
        .catch(err => console.error(err))
})
