import { Platform } from '@tarpit/core'
import { HttpInspector, HttpServerModule } from '@tarpit/http'
import { MongodbModule, TpMongoClientConfig } from '@tarpit/mongodb'
import { ApiRouterModule } from './apis/api-router.module'
import { plank_backend_config } from './config'
import { PlankDataModule } from './data/data.module'
import { PageRouterModule } from './pages/page-router.module'
import { RootServiceModule } from './services/root-service.module'

declare module '@tarpit/http' {
    export interface HttpCredentials {
        username: string
    }
}

declare module '@tarpit/mongodb' {
    export interface TpMongoClientConfigMap {
        mongo1: TpMongoClientConfig
    }
}

const platform = new Platform(plank_backend_config)
    .import(HttpServerModule)
    .import(MongodbModule)
    .import(PlankDataModule)
    .import(RootServiceModule)
    .bootstrap(ApiRouterModule)
    .bootstrap(PageRouterModule)

const inspector = platform.expose(HttpInspector)
inspector?.list_router().forEach(item => console.log(`${item.method.padEnd(7, ' ')} ${item.path}`))

platform.start()
