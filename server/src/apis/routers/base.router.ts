import { Get, JsonBody, Post, TpRequest, TpRouter } from '@tarpit/http'
import { Jtl } from '@tarpit/judge'
import { ObjectId } from 'mongodb'
import { BaseResponse, RestResponse } from 'plank-types'
import { CrashLogMongo } from '../../common/mongo'

@TpRouter('/')
export class BaseRouter implements RestResponse<BaseResponse> {

    constructor(
        private crash_log: CrashLogMongo,
    ) {
    }

    @Get('plank-environment')
    async plank_environment() {
        return {
            api_host: process.env['PLANK_SERVER_HOST'] ?? '',
            check_api: process.env['PLANK_CHECK_API'] ?? '',
            comic_base: process.env['PLANK_COMIC_BASE'] ?? '',
        }
    }

    @Get('echo-ip')
    async echo_ip(
        request: TpRequest
    ) {
        return { ip: request.ip }
    }

    @Get('list-crash')
    async list_crash() {
        const logs = await this.crash_log.find({ read: false }).sort({ created_at: -1 }).toArray()
        return { logs: logs.map(log => ({ ...log, _id: log._id.toString() })) }
    }

    @Post('resolve-crash')
    async resolve_crash(body: JsonBody<{ id: string }>) {
        const id = body.ensure('id', Jtl.string)
        const res = await this.crash_log.updateOne({ _id: new ObjectId(id) }, { $set: { read: true } })
        return {
            upserted_id: res.upsertedId?.toString(),
            matched_count: res.matchedCount,
            modified_count: res.modifiedCount,
        }
    }

    @Get('health-check')
    async health_check() {
        return { echo: 'voodoo' as const }
    }
}
