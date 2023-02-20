import { Auth, Guard, JsonBody, PathArgs, Post, RequestHeaders, throw_not_found, TpRouter, WS } from '@tarpit/http'
import { Jtl } from '@tarpit/judge'
import { WebSocket } from 'ws'
import { AccountService } from '../services/account.service'
import { TokenService } from '../services/token.service'

@TpRouter('/account', {})
export class AccountRouter {

    private ws_map: Record<string, WebSocket> = {}

    constructor(
        private account: AccountService,
        private token_service: TokenService,
    ) {
    }

    @Post()
    async register(body: JsonBody<{
        username: string
        password: string
        invitation: string
    }>) {
        const invitation_code = body.ensure('invitation', Jtl.non_empty_string)
        const username = body.ensure('username', Jtl.non_empty_string)
        const password = body.ensure('password', Jtl.non_empty_string)
        return this.account.create(username, password, invitation_code)
    }

    @Post()
    async signin(body: JsonBody<{
        username: string,
        password: string,
    }>) {
        const username = body.ensure('username', Jtl.non_empty_string)
        const password = body.ensure('password', Jtl.non_empty_string)
        const user_info = this.account.check(username, password)
        if (!user_info) {
            throw_not_found()
        }
        return { token: this.token_service.generate({ username: username }) }
    }

    @WS('subscribe/:id')
    async subscribe(ws: WebSocket, guard: Guard, args: PathArgs<{ id: string }>, headers: RequestHeaders) {
        ws.send('blablablabla')
        const id = args.ensure('id', Jtl.string)
        console.log(headers.data)
        // const name = guard.ensure('name', Jtl.string)
        // if (this.ws_map[id]) {
        //     console.log('close')
        //     ws.close()
        //     return
        // }
        this.ws_map[id] = ws
        // ws.on('close', () => delete this.ws_map[id])
        ws.on('message', (data, isBinary) => {
            console.log(data.toString())
            throw new Error('Thrown this error from message callback')
        })
        console.log(this.ws_map)

        setTimeout(() => ws.send('OIUOIUOIUOIU'), 1000)
    }

    @Post('send/:id')
    async send(args: PathArgs<{ id: string }>, body: JsonBody<{ msg: string }>) {
        console.log(args.data, body.data)
        const id = args.ensure('id', Jtl.string)
        const msg = body.ensure('msg', Jtl.string)
        if (this.ws_map[id]) {
            this.ws_map[id].send(msg)
        }

        return {
            keys: Object.keys(this.ws_map),
            id, msg
        }
    }

    @Post()
    async ping() {
        return 'pong'
    }

    @Auth()
    @Post()
    async info(guard: Guard) {
        const username = guard.ensure('username', Jtl.string)
        return this.account.get(username)
    }
}
