import { Component, HostListener, Inject } from '@angular/core'
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog'

@Component({
    selector: 'p-single-input',
    templateUrl: './single-input.component.html',
    styleUrls: ['./single-input.component.scss']
})
export class SingleInputComponent {

    @HostListener('keydown.enter', ['$event'])
    onKeydownEnter(event: KeyboardEvent) {
        event.preventDefault()
        event.stopPropagation()
        this.dialog.close(this.data.value)
    }

    public static width = '1080px'
    label = this.data.label ?? ''
    hint = this.data.hint ?? ''
    type = this.data.type ?? 'text'
    placeholder = this.data.placeholder ?? ''

    constructor(
        public dialog: MatDialogRef<SingleInputComponent>,
        @Inject(MAT_DIALOG_DATA) public data: {
            label?: string
            hint?: string
            type?: string
            placeholder?: string
            value?: string
        }
    ) {
    }
}
