import { CommonModule } from '@angular/common'
import { NgModule } from '@angular/core'
import { FormsModule } from '@angular/forms'
import { MatButtonModule } from '@angular/material/button'
import { RouterModule } from '@angular/router'
import { AboutComponent } from './about.component'
import {MatInputModule} from "@angular/material/input";

@NgModule({
    declarations: [
        AboutComponent
    ],
    imports: [
        CommonModule,
        RouterModule.forChild([
            { path: '', component: AboutComponent },
        ]),
        MatInputModule,
        FormsModule,
        MatButtonModule
    ]
})
export class AboutModule {
}
