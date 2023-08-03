import { Component } from '@angular/core'
import { Subject, switchMap } from 'rxjs'
import { AppService } from '../../app.service'
import { DockerContainerApi } from '../../services/apis/docker-container.api'
import { DockerContainerBrief } from 'plank-types'
import { CdkTableDataSourceInput } from '@angular/cdk/table'

@Component({
    selector: 'p-main',
    templateUrl: './main.component.html',
    styleUrls: ['./main.component.scss']
})
export class MainComponent {

    listDockerContainers$ = new Subject()
    containers: CdkTableDataSourceInput<DockerContainerBrief> = []

    constructor(
        public app: AppService,
        private docker_container_api: DockerContainerApi,
    ) {
    }

    ngOnInit() {
        this.listDockerContainers$.pipe(
            switchMap(() => this.docker_container_api.list_container())
        ).subscribe(res => this.containers = res.data)
        this.listDockerContainers$.next(null)
    }
}
