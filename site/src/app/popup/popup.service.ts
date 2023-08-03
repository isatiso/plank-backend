import { ComponentType } from '@angular/cdk/portal'
import { Injectable } from '@angular/core'
import { MatDialog, MatDialogConfig } from '@angular/material/dialog'
import { MatSnackBar, MatSnackBarConfig } from '@angular/material/snack-bar'
import { Observable } from 'rxjs'
// import { DescriptionComponent, DescriptionConfig } from './description/description.component'
import { InfoComponent } from './info/info.component'
import { PopupModule } from './popup.module'
import { SingleInputComponent } from './single-input/single-input.component'
import { WarningComponent } from './warning/warning.component'

@Injectable({
    providedIn: PopupModule
})
export class PopupService {

    constructor(
        private _snackbar: MatSnackBar,
        private _dialog: MatDialog,
    ) {
    }

    snack(message: string, config?: MatSnackBarConfig) {
        const default_config = {
            duration: 2000,
            verticalPosition: 'top'
        }
        return this._snackbar.open(message, 'OK', Object.assign({}, default_config, config)).afterDismissed()
    }

    warning(data: WarningComponent['data']): Observable<any> {
        return this.setup_dialog(WarningComponent, data)
    }

    input(data: SingleInputComponent['data']): Observable<any> {
        return this.setup_dialog(SingleInputComponent, data)
    }

    notice(data: InfoComponent['data']): Observable<any> {
        return this.setup_dialog(InfoComponent, data)
    }

    setup_dialog<T extends { data: any }, R = any>(
        component: ComponentType<T> & { width: string },
        data: T['data'],
        config?: MatDialogConfig<T['data']>
    ): Observable<R | undefined> {
        return this._dialog.open<T, T['data'], R>(component, { width: component.width, ...config, data: data ?? {} }).afterClosed()
    }
}
