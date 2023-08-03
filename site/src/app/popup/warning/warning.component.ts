import { Component, Inject } from '@angular/core'
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog'

@Component({
    selector: 'app-warning',
    templateUrl: './warning.component.html',
    styleUrls: ['./warning.component.scss']
})
export class WarningComponent {

    public static width = '1080px'

    constructor(
        public dialogRef: MatDialogRef<WarningComponent>,
        @Inject(MAT_DIALOG_DATA) public data: {
            message: string[]
            pass: any
        }
    ) {
    }
}
