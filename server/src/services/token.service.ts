import { TpConfigData, TpService } from '@tarpit/core'
import crypto from 'crypto'

@TpService()
export class TokenService {
    private secret = this.config.get('local.token_secret')

    constructor(
        private config: TpConfigData,
    ) {
    }

    generate<T>(data: T): string {
        const info_str = JSON.stringify(data)
        const compressed_str = Buffer.from(info_str).toString('base64url')
        return `${compressed_str}.${this.hash(info_str)}`
    }

    parse<T>(token: string): T | undefined {
        const [compressed_str, tag] = token.split('.')
        if (!compressed_str || !tag) {
            return
        }
        const decompressed_str = Buffer.from(compressed_str, 'base64url').toString('utf-8')
        if (this.hash(decompressed_str) !== tag) {
            return
        }
        return this.try_parse_json<T>(decompressed_str)
    }

    private hash(str: string) {
        return crypto.createHash('sha1').update(this.secret + str + this.secret).digest('base64url')
    }

    private try_parse_json<T>(str: string): T | undefined {
        try {
            return JSON.parse(str)
        } catch (e) {
            console.log('Parse token failed', e)
            return
        }
    }
}
