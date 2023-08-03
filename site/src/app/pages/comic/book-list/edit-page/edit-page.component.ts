import { Component, HostListener, Inject } from '@angular/core'
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog'

@Component({
    selector: 'p-edit-page',
    templateUrl: './edit-page.component.html',
    styleUrls: ['./edit-page.component.scss']
})
export class EditPageComponent {

    @HostListener('keyup.enter')
    on_enter() {
        this.dialog.close(this.data)
    }

    constructor(
        public dialog: MatDialogRef<EditPageComponent>,
        @Inject(MAT_DIALOG_DATA) public data: string,
    ) {
    }
}
