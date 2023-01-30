import { platformBrowserDynamic } from '@angular/platform-browser-dynamic'

import { AppModule } from './app/app.module'
import { environment } from './environments/environment'

fetch('/plank-environment').then(res => res.json()).then(res => {
    environment.api_host = res.api_host
    platformBrowserDynamic().bootstrapModule(AppModule)
        .catch(err => console.error(err))
})

