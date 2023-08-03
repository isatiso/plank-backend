import { Platform } from '@tarpit/core'
import { HttpInspector, HttpServerModule } from '@tarpit/http'
import { MongodbModule, TpMongoClientConfig } from '@tarpit/mongodb'
import { ScheduleModule } from '@tarpit/schedule'
import { isMainThread } from 'worker_threads'
import { ApiRouterModule } from './apis/api-router.module'
import { CommonModule } from './common/common.module'
import { CrashLogMongo } from './common/mongo'
import { plank_backend_config } from './config'
import { PageRouterModule } from './pages/page-router.module'

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
    .import(ScheduleModule)
    .import(MongodbModule)
    .import(CommonModule)
    .bootstrap(ApiRouterModule)
    .bootstrap(PageRouterModule)

const inspector = platform.expose(HttpInspector)
const crash_log = platform.expose(CrashLogMongo)

if (isMainThread) {
    inspector?.list_router().forEach(item => console.log(`${item.method.padEnd(7, ' ')} ${item.path}`))
}

platform.start()

process.on('uncaughtException', err => {
    console.log('Caught exception: ' + err)
    crash_log?.insertOne({
        message: err.message,
        stack: err.stack as string,
        read: false,
        created_at: Date.now()
    }).catch(err => console.log(err))
})

process.on('SIGINT', () => platform.terminate())
process.on('SIGTERM', () => platform.terminate())
