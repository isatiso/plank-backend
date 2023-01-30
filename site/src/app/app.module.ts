import { HttpClientModule } from '@angular/common/http'
import { NgModule } from '@angular/core'
import { BrowserModule } from '@angular/platform-browser'
import { BrowserAnimationsModule } from '@angular/platform-browser/animations'
import { RouterModule } from '@angular/router'

import { AppComponent } from './app.component'
import { FooterModule } from './components/footer/footer.module'
import { HeaderModule } from './components/header/header.module'

@NgModule({
    declarations: [
        AppComponent
    ],
    imports: [
        BrowserModule.withServerTransition({ appId: 'serverApp' }),
        BrowserAnimationsModule,
        HttpClientModule,
        HeaderModule,
        FooterModule,
        RouterModule.forRoot([
            { path: 'main', loadChildren: () => import('./pages/main/main.module').then(m => m.MainModule) },
            { path: 'about', loadChildren: () => import('./pages/about/about.module').then(m => m.AboutModule) },
            { path: '', redirectTo: '/main', pathMatch: 'full' },
            { path: '**', redirectTo: '' },
        ], { initialNavigation: 'enabledBlocking' })
    ],
    providers: [],
    bootstrap: [AppComponent]
})
export class AppModule {
}
