export {}

declare module '@tarpit/http' {
    export interface HttpCredentials {
        username: string
    }
}

declare module '@tarpit/core' {

    export interface TpConfigSchema {
        local: {
            token_secret: string
        }
    }
}
