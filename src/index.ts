import { TpConfigSchema } from '@tarpit/config'
import { Platform } from '@tarpit/core'
import { HttpInspector, HttpServerModule } from '@tarpit/http'
import { MongodbModule, TpMongoClientConfig } from '@tarpit/mongodb'
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
        url: mongodb_uri,
        other_clients: {
            mongo1: {
                url: mongodb_uri,
            }
        }
    },
}

const platform = new Platform(config)
    .import(HttpServerModule)
    .import(MongodbModule)
    .bootstrap(PlankRoot)

const inspector = platform.expose(HttpInspector)
inspector?.list_router().forEach(item => console.log(`${item.method.padEnd(7, ' ')} ${item.path}`))

platform.start()
