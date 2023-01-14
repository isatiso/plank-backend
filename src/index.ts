import { TpConfigSchema } from '@tarpit/config'
import { Platform } from '@tarpit/core'
import { HttpInspector, HttpServerModule } from '@tarpit/http'
import { MongodbModule } from '@tarpit/mongodb'
import { PlankRoot } from './root'

const mongodb_uri = process.env.MONGODB_URI ?? 'mongodb://root:7XQPqnNLGmVhmyrFNtiHqefT4hNPrU3z@100.70.115.64:27017/admin?connectTimeoutMS=10000&authSource=admin&authMechanism=SCRAM-SHA-256'

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
    mongodb: { uri: mongodb_uri },
}

const platform = new Platform(config)
    .import(HttpServerModule)
    .import(MongodbModule)
    .bootstrap(PlankRoot)

const inspector = platform.expose(HttpInspector)
inspector?.list_router().forEach(item => console.log(`${item.method.padEnd(7, ' ')} ${item.path}`))

platform.start()
