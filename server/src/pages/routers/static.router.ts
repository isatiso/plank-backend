import { Get, HttpStatic, TpRequest, TpResponse, TpRouter } from '@tarpit/http'

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

    @Get('assets/:path+')
    async assets(req: TpRequest, res: TpResponse) {
        return this.http_static.serve(req, res, { path: req.path?.replace(/^\/assets\//, '') })
    }
}
