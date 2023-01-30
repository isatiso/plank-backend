import { Get, TpResponse, TpRouter } from '@tarpit/http'
import axios from 'axios'
import ejs from 'ejs'
import page_about from '../pages/about.ejs'
import page_index from '../pages/index.ejs'
import partials_header from '../pages/partials/header.ejs'
import partials_head from '../pages/partials/head.ejs'
import partials_footer from '../pages/partials/footer.ejs'
import { plank_backend_config } from '../config'
import docker_compose_yml from '../../../docker-compose.yml'

@TpRouter('/ejs', {})
export class EjsRouter {
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

        const res = await axios.get('http://localhost/containers/json', { socketPath: '/var/run/docker.sock' })

        return ejs.render(page_index, {
            mascots: mascots,
            tagline: tagline,
            config: plank_backend_config.get('http.port'),
            containers: res.data,
            partials_header,
            partials_head,
            partials_footer
        })
    }

    @Get()
    async about(response: TpResponse) {
        response.content_type = 'text/html'
        return ejs.render(page_about, {
            partials_header,
            partials_head,
            partials_footer,
            docker_compose_yml: JSON.stringify(docker_compose_yml, null, 4)
        })
    }
}
