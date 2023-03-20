import { Get, TpRouter } from '@tarpit/http'
import { DockerContainerService } from '../../services/docker-container.service'

@TpRouter('/docker', {})
export class DockerContainerRouter {
    constructor(
        private docker_service: DockerContainerService,
    ) {
    }

    @Get('list-container')
    async list_container() {
        return this.docker_service.list_container()
    }
}
