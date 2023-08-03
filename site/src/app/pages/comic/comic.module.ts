import { CdkConnectedOverlay, OverlayModule } from '@angular/cdk/overlay'
import { CommonModule } from '@angular/common'
import { NgModule } from '@angular/core'
import { FormsModule } from '@angular/forms'
import { MatButtonModule } from '@angular/material/button'
import { MatDialogModule } from '@angular/material/dialog'
import { MatIconModule } from '@angular/material/icon'
import { MatInputModule } from '@angular/material/input'
import { MatMenuModule } from '@angular/material/menu'
import { MatProgressBarModule } from '@angular/material/progress-bar'
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner'
import { MatSliderModule } from '@angular/material/slider'
import { RouterModule } from '@angular/router'
import { BookListComponent } from './book-list/book-list.component'
import { EditPageComponent } from './book-list/edit-page/edit-page.component'
import { BookComponent } from './book/book.component'
import { ChapterComponent } from './chapter/chapter.component'
import { ComicComponent } from './comic.component'

@NgModule({
    declarations: [
        ComicComponent,
        BookListComponent,
        ChapterComponent,
        BookComponent,
        EditPageComponent
    ],
    imports: [
        CommonModule,
        OverlayModule,
        MatButtonModule,
        MatIconModule,
        MatDialogModule,
        CdkConnectedOverlay,
        MatInputModule,
        FormsModule,
        MatMenuModule,
        MatSliderModule,
        RouterModule.forChild([
            {
                path: '', component: ComicComponent, children: [
                    { path: '', redirectTo: 'book-list/1', pathMatch: 'full' },
                    { path: 'book-list', redirectTo: 'book-list/1', pathMatch: 'full' },
                    { path: 'book-list/:page', component: BookListComponent },
                    { path: 'book/:book_id', component: BookComponent },
                    { path: 'chapter/:book_id/:chapter_id', component: ChapterComponent },
                ]
            },
        ]),
        MatProgressBarModule,
        MatProgressSpinnerModule,
    ]
})
export class ComicModule {
}
