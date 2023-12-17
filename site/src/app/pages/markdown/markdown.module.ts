import { CommonModule } from '@angular/common'
import { NgModule } from '@angular/core'
import { RouterModule } from '@angular/router'
import { MarkdownComponent } from './markdown.component'

@NgModule({
    declarations: [
        MarkdownComponent
    ],
    imports: [
        CommonModule,
        RouterModule.forChild([
            { path: '**', component: MarkdownComponent },
        ]),
    ]
})
export class MarkdownModule {
}
