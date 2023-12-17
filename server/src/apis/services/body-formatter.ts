import { TpService } from '@tarpit/core'
import { HttpBodyFormatter, HttpContext, HttpResponseType } from '@tarpit/http'

@TpService()
export class BodyFormatter extends HttpBodyFormatter {
    format(context: HttpContext): HttpResponseType {
        if (context.result.status >= 400) {
            return super.format(context)
        } else {
            if (Array.isArray(context.result.body)) {
                return {
                    type: 'array',
                    data: context.result.body,
                }
            } else if (
                Buffer.isBuffer(context.result.body)
                || context.result.body instanceof ArrayBuffer
                || ArrayBuffer.isView(context.result.body)
            ) {
                return context.result.body
            } else if (typeof context.result.body === 'object') {
                return {
                    type: 'object',
                    data: context.result.body,
                }
            } else {
                return {
                    type: 'literal',
                    data: context.result.body,
                }
            }
        }
    }
}
