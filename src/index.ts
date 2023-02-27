import { Platform } from '@tarpit/core'
import { HttpInspector, HttpServerModule } from '@tarpit/http'
import { MongodbModule, TpMongoClientConfig } from '@tarpit/mongodb'
import { plank_backend_config } from './config'
import { PlankRoot } from './root'

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
    .bootstrap(PlankRoot)

const inspector = platform.expose(HttpInspector)
inspector?.list_router().forEach(item => console.log(`${item.method.padEnd(7, ' ')} ${item.path}`))

platform.start()
