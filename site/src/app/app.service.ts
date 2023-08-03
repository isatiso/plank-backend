import { Injectable } from '@angular/core'
import { debounceTime, filter, map, Subject, tap } from 'rxjs'

@Injectable({
    providedIn: 'root'
})
export class AppService {

    combineKeyUp$ = new Subject<KeyboardEvent>()
    combineKeyEmit$ = new Subject<{ code: string, data?: any }>()
    combine_key_map = [
        { code: '最終決戦奥義・無式', arr: ['ArrowDown', 'ArrowRight', 'ArrowDown', 'ArrowRight', 'a'].reverse() },
        { code: '面白い', arr: ['ArrowLeft', 'ArrowRight', 'ArrowLeft', 'ArrowRight', 'f'].reverse() },
        { code: '美味い', arr: ['ArrowLeft', 'ArrowRight', 'ArrowLeft', 'f'].reverse() },
        { code: '影分身の術', arr: ['ArrowLeft', 'ArrowRight', 'ArrowLeft', 'q'].reverse() },
        { code: '口寄せの術', arr: ['ArrowLeft', 'ArrowRight', 'ArrowLeft', 'a'].reverse() },
        { code: 'ご武運を', arr: ['ArrowLeft', 'ArrowRight', 'ArrowLeft', 'ArrowRight', 'q'].reverse() },
    ]

    key_buffer: string[] = []
    small = false
    private_network = true

    constructor() {
    }

    watch_combine_key() {
        return this.combineKeyUp$.pipe(
            tap(e => this.key_buffer.push(e.key)),
            debounceTime(300),
            map(() => this.key_buffer),
            tap(() => this.key_buffer = []),
            filter(events => 4 <= events.length && events.length <= 12),
        ).subscribe(
            key_array => {
                const arr = key_array.reverse() // 按键序列倒序检查
                const check_length = Math.min(arr.length, 12) // 最长支持 16 个按键

                // 遍历按键序列表
                let key_map = this.combine_key_map.map(k => k) // 备选列表
                for (let i = 0; i < check_length; i++) {
                    const tmp_map = [] // 循环中的临时备选列表
                    for (const km_obj of key_map) {
                        const km = km_obj.arr
                        if (km.length <= i) {
                            break
                        }
                        if (km[i] === arr[i]) {
                            tmp_map.push(km_obj)
                        }
                    }
                    key_map = tmp_map
                    if (key_map.length <= 0) {
                        // 备选列表为空，退出
                        return
                    }
                    if (key_map.length === 1 && key_map[0].arr.length === i + 1) {
                        // 找到唯一匹配项，发送事件
                        this.combineKeyEmit$.next({ code: key_map[0].code })
                        return
                    }
                }
            }
        )
    }

    listenCombineKey = (e: KeyboardEvent) => {
        this.combineKeyUp$.next(e)
    }

    async copy_to_clipboard(value: string) {
        return navigator.clipboard.writeText(value)
    }
}
