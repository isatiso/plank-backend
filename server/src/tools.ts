import colors from 'ansi-colors'
import { SingleBar } from 'cli-progress'

export function progress(total: number) {
    return {
        [Symbol.iterator]: () => {
            const arr = Array(total).fill(0).map((_, i) => i)
            const iter = arr[Symbol.iterator]()
            const start = Date.now()
            const bar = new SingleBar({
                format: 'Fetching Progress |' + colors.cyan('{bar}') + '| {percentage}% || {value}/{total} || Usage: {secs}s',
                barCompleteChar: '\u2501',
                barIncompleteChar: ' ',
                hideCursor: true
            })
            bar.start(total, 0, { secs: 0 })
            const interval = setInterval(() => bar.update({ secs: (Date.now() - start) / 1000 }), 50)

            return {
                next() {
                    const { value, done } = iter.next()
                    if (done) {
                        clearInterval(interval)
                        bar.stop()
                    } else {
                        bar.increment()
                    }
                    return { value, done }
                }
            }
        }
    }
}
