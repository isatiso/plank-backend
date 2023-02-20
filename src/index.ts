import { TpConfigSchema } from '@tarpit/config'
import { Platform } from '@tarpit/core'
import { HttpInspector, HttpServerModule, HttpCredentials } from '@tarpit/http'
import { MongodbModule } from '@tarpit/mongodb'
import { PlankRoot } from './root'

declare module '@tarpit/http' {
    export interface HttpCredentials {
        name?: string
    }
}
const mongodb_uri = process.env.MONGODB_URL ?? ''

const config: TpConfigSchema = {
    local: {
        token_secret: '123456789'
    },
    http: {
        port: 3000,
        expose_error: true,
        static: {
            root: './assets'
        }
    },
    mongodb: {
        uri: mongodb_uri,
    },
}

const platform = new Platform(config)
    .import(HttpServerModule)
    .import(MongodbModule)
    .bootstrap(PlankRoot)

const inspector = platform.expose(HttpInspector)
inspector?.list_router().forEach(item => console.log(`${item.method.padEnd(7, ' ')} ${item.path}`))

platform.start()
