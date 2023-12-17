/**
 * @license
 * Copyright Cao Jiahang All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at source root.
 */

export async function sleep(ms: number) {
    return new Promise(resolve => setTimeout(() => resolve(undefined), ms))
}

export async function next_tick() {
    return new Promise(resolve => setImmediate(() => resolve(undefined)))
}

interface Subscription {
    unsubscribe(): void
}

export interface Subscribable<T> {
    closed: boolean

    subscribe(next: (value: T) => void): Subscription
}

class _InnerIterator<T> implements AsyncIterator<T> {

    private resolve: ((item: T) => void) | undefined = undefined
    private buffer: T[] = []
    private _subscription?: Subscription = undefined

    constructor(
        private _subject: Subscribable<T>,
        private _stop: AbortController,
    ) {
    }

    private subscribe() {
        this._subscription = this._subject.subscribe(value => {
            this.resolve ? this.resolve(value) : this.buffer.push(value)
        })
    }

    next(): Promise<IteratorResult<T>> {
        if (this._stop.signal.aborted || this._subject.closed) {
            return this.return()
        }
        if (!this._subscription) {
            this.subscribe()
        }
        if (this.buffer.length) {
            return Promise.resolve({ done: false, value: this.buffer.shift()! })
        } else {
            return new Promise<any>(resolve => {
                this.resolve = (item: any) => {
                    resolve({ done: false, value: item })
                    this.resolve = undefined
                }
            })
        }
    }

    return(value?: any): Promise<IteratorResult<T>> {
        this._subscription?.unsubscribe()
        return Promise.resolve({ done: true, value })
    }
}

/**
 * Usually It's a Subject of RxJs, but I don't want to introduce a new dependency.
 */
export class SubjectIterator<T> {
    private _stop: AbortController = new AbortController()

    constructor(private _subject: Subscribable<T>) {
    }

    stop() {
        this._stop.abort()
    }

    [Symbol.asyncIterator] = () => new _InnerIterator(this._subject, this._stop)
}
