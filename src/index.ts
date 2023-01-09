import { TpConfigSchema } from '@tarpit/config'
import { Platform } from '@tarpit/core'
import { HttpServerModule } from '@tarpit/http'
import { MongodbModule } from '@tarpit/mongodb'
import { PlankRoot } from './root'

const mongodb_uri = process.env.MONGODB_URI ?? 'mongodb://localhost'

const config: TpConfigSchema = {
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

platform.bootstrap(PlankRoot).start()
