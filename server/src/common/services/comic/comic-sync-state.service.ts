import { TpService } from '@tarpit/core'
import { SyncStateData, SyncStateOverview } from 'plank-types'
import { BehaviorSubject } from 'rxjs'

@TpService()
export class ComicSyncStateService {

    private data: Record<number, SyncStateData> = {}
    private stateOverview$ = new BehaviorSubject<SyncStateOverview>(this.data)
    private state_map: Record<string, BehaviorSubject<SyncStateData>> = {}

    constructor() {
    }

    get(book_id: number) {
        return this.data[book_id]
    }

    set(book_id: number, state: SyncStateData) {
        this.data[book_id] = state
        this.stateOverview$.next(this.data)
    }

    update_state(book_id: number, state: SyncStateData['state']) {
        this.data[book_id].state = state
        this.send_overview()
        this.send_book_state(book_id)
    }

    update_book(book_id: number, progress: number) {
        this.data[book_id].chapter_progress = progress
        this.send_book_state(book_id)
    }

    update_chapter(book_id: number, chapter_id: number, progress: number) {
        this.data[book_id].chapters[chapter_id] = progress
        this.send_book_state(book_id)
    }

    subscribe(callback: (value: SyncStateOverview) => void) {
        return this.stateOverview$.subscribe(callback)
    }

    subscribe_book(book_id: number, callback: (value: SyncStateData) => void) {
        if (!this.state_map[book_id]) {
            this.state_map[book_id] = new BehaviorSubject<SyncStateData>(this.data[book_id])
        }
        return this.state_map[book_id].subscribe(callback)
    }

    private send_overview() {
        const data: SyncStateOverview = Object.fromEntries(Object.entries(this.data).map(([book_id, { book_name, state }]) => [book_id, {
            book_id,
            book_name,
            state
        }])) as any
        this.stateOverview$.next(data)
    }

    private send_book_state(book_id: number) {
        if (this.state_map[book_id]) {
            this.state_map[book_id].next(this.data[book_id])
        }
    }
}
