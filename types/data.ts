import type { ObjectId } from 'mongodb'

export interface AccessLog {
    ip: string
    duration: string
    method: string
    status: string
    path: string
    err_msg: string
    created_at: number
}

export interface AccountData {
    username: string
    password: string
    salt: string
    created_at: number
    updated_at: number
}

export interface ComicRecord {
    book_id: number
    book_name: string
    type: 'photo' | 'gray' | 'color'
    like: boolean
}

export interface CrashLog {
    message: string
    stack: string
    read: boolean
    created_at: number
}

export interface InvitationData {
    code: string
    user: ObjectId | null
    created_at: number
}

export interface TestLog {
    content: string
    created_at: number
    updated_at: number
}
