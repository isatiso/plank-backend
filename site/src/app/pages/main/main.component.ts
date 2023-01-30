import { Component } from '@angular/core'
import { Subject, switchMap } from 'rxjs'
import { DockerContainerApi } from '../../services/apis/docker-container.api'

@Component({
    selector: 'p-main',
    templateUrl: './main.component.html',
    styleUrls: ['./main.component.scss']
})
export class MainComponent {

    listDockerContainers$ = new Subject()
    containers: any[] = []

    constructor(
        private docker_container_api: DockerContainerApi,
    ) {
    }

    ngOnInit() {
        this.listDockerContainers$.pipe(
            switchMap(() => this.docker_container_api.list_container())
        ).subscribe(res => this.containers = res)
        this.listDockerContainers$.next(null)
    }
}
