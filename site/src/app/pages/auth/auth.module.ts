import { NgModule } from '@angular/core'
import { CommonModule } from '@angular/common'
import { FormsModule } from '@angular/forms'
import { MatButtonModule } from '@angular/material/button'
import { RouterModule } from '@angular/router'
import { AuthComponent } from './auth.component'
import { SigninComponent } from './signin/signin.component'
import { MatInputModule } from '@angular/material/input'

@NgModule({
    declarations: [
        AuthComponent,
        SigninComponent
    ],
    imports: [
        CommonModule,
        RouterModule.forChild([
            {
                path: '', component: AuthComponent, children: [
                    { path: '', redirectTo: 'signin', pathMatch: 'full' },
                    { path: 'signin', component: SigninComponent },
                ]
            },
        ]),
        MatInputModule,
        FormsModule,
        MatButtonModule,
    ]
})
export class AuthModule {
}
