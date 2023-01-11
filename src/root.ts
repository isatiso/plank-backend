import { TpRoot } from '@tarpit/core'
import { HttpHooks } from '@tarpit/http'
import { AccountMongo } from './data/account.mongo'
import { MyHttpHooks } from './hooks'
import { AccountRouter } from './routers/account.router'
import { EjsRouter } from './routers/ejs.router'

@TpRoot({
    providers: [
        AccountMongo,
        { provide: HttpHooks, useClass: MyHttpHooks },
    ],
    entries: [
        AccountRouter,
        EjsRouter,
    ],
})
export class PlankRoot {
}
