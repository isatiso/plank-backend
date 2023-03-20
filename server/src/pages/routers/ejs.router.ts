import { Get, TpResponse, TpRouter } from '@tarpit/http'
import axios from 'axios'
import docker_compose_yml from '../../../../docker-compose.yml'
import { plank_backend_config } from '../../config'
import { EjsTemplateService } from '../services/ejs-template.service'

@TpRouter('/ejs', {})
export class EjsRouter {

    constructor(
        private ejs_template: EjsTemplateService,
    ) {
    }

    @Get('')
    async index(response: TpResponse) {
        response.redirect('/ejs/main', 302)
    }

    @Get()
    async main(response: TpResponse) {
        const mascots = [
            { name: 'Sammy', organization: 'DigitalOcean', birth_year: 2012 },
            { name: 'Tux', organization: 'Linux', birth_year: 1996 },
            { name: 'Moby Dock', organization: 'Docker', birth_year: 2013 }
        ]
        const tagline = 'No programming concept is complete without a cute animal mascot.'

        response.content_type = 'text/html'

        const res = await axios.get('http://localhost/containers/json', { socketPath: '/var/run/docker.sock' }).catch(() => ({ data: [] }))

        return this.ejs_template.render('page_index', {
            mascots: mascots,
            tagline: tagline,
            config: plank_backend_config.get('http.port'),
            containers: res.data,
        })
    }

    @Get()
    async about(response: TpResponse) {
        response.content_type = 'text/html'
        return this.ejs_template.render('page_about', {
            docker_compose_yml: JSON.stringify(docker_compose_yml, null, 4)
        })
    }

    @Get('404')
    async not_found(response: TpResponse) {
        response.content_type = 'text/html'
        return this.ejs_template.render('page_not_found')
    }
}
