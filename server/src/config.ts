import { load_config } from '@tarpit/config'
import { TpConfigSchema } from '@tarpit/core'

const mongodb_uri = process.env['MONGODB_URL'] ?? ''

export const plank_backend_config = load_config<TpConfigSchema>({
    local: {
        token_secret: process.env['PLANK_SITE_SECRET'] ?? '',
    },
    http: {
        port: 3000,
        expose_error: true,
        cors: {
            allow_methods: 'GET,POST,PUT,DELETE,HEAD',
            allow_headers: '*',
            allow_origin: '*',
            max_age: 0,
        },
        static: {
            root: './assets',
            cache_control: {
                'max-age': 86400,
            }
        },
    },
    mongodb: {
        url: mongodb_uri,
        other_clients: {
            mongo1: {
                url: mongodb_uri,
            }
        }
    },
})
