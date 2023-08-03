import { TpService } from '@tarpit/core'
import axios from 'axios'

@TpService()
export class DockerContainerService {
    async list_container() {
        const res = await axios.get('http://localhost/containers/json', { socketPath: '/var/run/docker.sock' })
        return res.data
    }
}
