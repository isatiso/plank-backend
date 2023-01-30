import { CommonModule } from '@angular/common'
import { NgModule } from '@angular/core'
import { MatIconModule } from '@angular/material/icon'
import { MatToolbarModule } from '@angular/material/toolbar'
import { RouterLink } from '@angular/router'
import { HeaderComponent } from './header.component'
import { MatButtonModule } from '@angular/material/button'

@NgModule({
    declarations: [
        HeaderComponent,
    ],
    exports: [
        HeaderComponent
    ],
    imports: [
        CommonModule,
        MatToolbarModule,
        MatButtonModule,
        MatIconModule,
        RouterLink
    ]
})
export class HeaderModule {
}
