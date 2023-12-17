import { CommonModule, NgOptimizedImage } from '@angular/common'
import { NgModule } from '@angular/core'
import { RouterModule } from '@angular/router'
import { MainComponent } from './main.component'
import { MatTableModule } from '@angular/material/table'

@NgModule({
    declarations: [
        MainComponent
    ],
    imports: [
        CommonModule,
        RouterModule.forChild([
            { path: '', component: MainComponent },
        ]),
        MatTableModule,
        NgOptimizedImage
    ]
})
export class MainModule {
}
