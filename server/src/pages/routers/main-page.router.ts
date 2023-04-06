import { ContentType, Get, throw_bad_request, throw_not_found, TpResponse, TpRouter } from '@tarpit/http'
import axios from 'axios'
import docker_compose_yml from '../../../../docker-compose.yml'
import { EjsTemplateService } from '../services/ejs-template.service'

@TpRouter('/', {})
export class MainPageRouter {

    constructor(
        private template: EjsTemplateService,
    ) {
    }

    @Get('')
    @ContentType('text/html')
    async index(response: TpResponse) {
        response.redirect('/main', 302)
    }

    @Get(':path+')
    @ContentType('text/html')
    async not_found() {
        throw_not_found()
    }

    @Get()
    @ContentType('text/html')
    async main() {
        const res = await axios.get('http://localhost/containers/json', { socketPath: '/var/run/docker.sock' }).catch(() => ({ data: [] }))
        return this.template.render('page_index', {
            title: 'Home',
            containers: res.data,
        })
    }

    @Get()
    @ContentType('text/html')
    async about() {
        return this.template.render('page_about', {
            title: 'About',
            docker_compose_yml: JSON.stringify(docker_compose_yml, null, 4)
        })
    }

    @Get()
    async error() {
        throw_bad_request()
    }
}
