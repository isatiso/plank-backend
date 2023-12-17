import { Directive, OnDestroy } from '@angular/core'
import { Subject } from 'rxjs'

@Directive({
    selector: '[p-base]',
})
export class Base implements OnDestroy {

    destroy$ = new Subject()

    ngOnDestroy() {
        this.destroy$.next(null)
        this.destroy$.complete()
    }
}
