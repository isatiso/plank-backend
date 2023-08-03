import { Get, TpRouter } from '@tarpit/http'
import { DockerContainerResponse, RestResponse } from 'plank-types'
import { DockerContainerService } from '../../common/services/docker-container.service'

@TpRouter('/docker', {})
export class DockerContainerRouter implements RestResponse<DockerContainerResponse> {
    constructor(
        private docker_service: DockerContainerService,
    ) {
    }

    @Get('list-container')
    async list_container() {
        return this.docker_service.list_container()
            .then(data => data.map(({ Id, Names, Image, Created, Status }: any) => ({ Id, Names, Image, Created, Status })))
    }
}
