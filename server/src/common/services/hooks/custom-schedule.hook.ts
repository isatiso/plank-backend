import { TpService } from '@tarpit/core'
import { ScheduleHooks, TaskContext } from '@tarpit/schedule'

type Context = TaskContext<{ process_start: number }>

@TpService()
export class CustomScheduleHook extends ScheduleHooks {
    async on_init(context: Context): Promise<void> {
        context.set('process_start', Date.now())
    }

    async on_finish<T>(context: Context, res: T): Promise<void> {
    }

    async on_error(context: Context, err: any): Promise<void> {
        console.error(context.unit.task_name, 'failed', err)
    }
}
