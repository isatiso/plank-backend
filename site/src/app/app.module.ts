import { HTTP_INTERCEPTORS, HttpClientModule } from '@angular/common/http'
import { inject, NgModule } from '@angular/core'
import { BrowserModule } from '@angular/platform-browser'
import { BrowserAnimationsModule } from '@angular/platform-browser/animations'
import { RouterModule } from '@angular/router'

import { AppComponent } from './app.component'
import { AppService } from './app.service'
import { Base } from './base/base'
import { FooterModule } from './components/footer/footer.module'
import { HeaderModule } from './components/header/header.module'
import { AuthInterceptor } from './http/auth.interceptor'
import { PopupModule } from './popup/popup.module'

@NgModule({
    declarations: [
        Base,
        AppComponent,
    ],
    imports: [
        BrowserModule.withServerTransition({ appId: 'serverApp' }),
        BrowserAnimationsModule,
        HttpClientModule,
        HeaderModule,
        FooterModule,
        PopupModule,
        RouterModule.forRoot([
            { path: 'main', loadChildren: () => import('./pages/main/main.module').then(m => m.MainModule) },
            { path: 'about', loadChildren: () => import('./pages/about/about.module').then(m => m.AboutModule) },
            {
                path: 'comic',
                canActivate: [() => inject(AppService).private_network],
                loadChildren: () => import('./pages/comic/comic.module').then(m => m.ComicModule)
            },
            { path: 'auth', loadChildren: () => import('./pages/auth/auth.module').then(m => m.AuthModule) },
            { path: 'marked', loadChildren: () => import('./pages/markdown/markdown.module').then(m => m.MarkdownModule) },
            { path: '', redirectTo: '/main', pathMatch: 'full' },
            { path: '**', redirectTo: '/main' },
        ], { initialNavigation: 'enabledBlocking' })
    ],
    providers: [
        { provide: HTTP_INTERCEPTORS, useClass: AuthInterceptor, multi: true },
    ],
    bootstrap: [AppComponent]
})
export class AppModule {
}
