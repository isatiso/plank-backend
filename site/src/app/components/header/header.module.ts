import { CommonModule, NgOptimizedImage } from '@angular/common'
import { NgModule } from '@angular/core'
import { MatIconModule } from '@angular/material/icon'
import { MatToolbarModule } from '@angular/material/toolbar'
import { RouterLink } from '@angular/router'
import { HeaderComponent } from './header.component'
import { MatButtonModule } from '@angular/material/button'
import { MatMenuModule } from '@angular/material/menu'

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
        RouterLink,
        MatMenuModule,
        NgOptimizedImage
    ]
})
export class HeaderModule {
}
