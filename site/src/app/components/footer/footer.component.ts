import { Component, OnInit } from '@angular/core'
import { Base } from '../../base/base'

@Component({
    selector: 'p-footer',
    templateUrl: './footer.component.html',
    styleUrls: ['./footer.component.scss']
})
export class FooterComponent extends Base implements OnInit {

    constructor() {
        super()
    }

    ngOnInit(): void {
    }
}
