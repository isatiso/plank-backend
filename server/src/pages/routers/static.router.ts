import { Get, HttpStatic, PathArgs, TpRequest, TpResponse, TpRouter } from '@tarpit/http'
import { Jtl } from '@tarpit/judge'

@TpRouter('/', {})
export class StaticRouter {

    constructor(
        private http_static: HttpStatic,
    ) {
    }

    @Get('favicon.ico')
    async favicon(req: TpRequest, res: TpResponse) {
        return this.http_static.serve(req, res, { path: 'favicon.png' })
    }

    @Get('assets/:path(.+)')
    async assets(req: TpRequest, res: TpResponse, args: PathArgs<{ path: string }>) {
        const path = args.ensure('path', Jtl.non_empty_string)
        return this.http_static.serve(req, res, { path })
    }
}
