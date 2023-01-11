import { Get, TpResponse, TpRouter } from '@tarpit/http'
import ejs from 'ejs'

@TpRouter('/ejs', {})
export class EjsRouter {
    @Get('')
    async index(response: TpResponse) {
        const mascots = [
            { name: 'Sammy', organization: 'DigitalOcean', birth_year: 2012 },
            { name: 'Tux', organization: 'Linux', birth_year: 1996 },
            { name: 'Moby Dock', organization: 'Docker', birth_year: 2013 }
        ]
        const tagline = 'No programming concept is complete without a cute animal mascot.'

        response.content_type = 'text/html'
        return ejs.renderFile('./pages/index.ejs', {
            mascots: mascots,
            tagline: tagline
        })
    }

    @Get()
    async about(response: TpResponse) {
        response.content_type = 'text/html'
        return ejs.renderFile('./pages/about.ejs')
    }
}
