import { Injectable } from '@angular/core'

export interface UserInfo {
    username: string
}

@Injectable({
    providedIn: 'root'
})
export class UserService {
    _token = ''
    user_info: UserInfo | null = null

    constructor() {
        const str = localStorage.getItem('tarpit-user')
        if (str) {
            try {
                const { token, user_info } = JSON.parse(str)
                this._token = token
                this.user_info = user_info
            } catch (e) {
            }
        }
    }

    get token() {
        return this._token
    }

    set_info(token: string, user_info: UserInfo) {
        this._token = token
        this.user_info = user_info
        localStorage.setItem('tarpit-user', JSON.stringify({ token, user_info: this.user_info }))
    }

    get info() {
        return this.user_info
    }

    clear_info() {
        this._token = ''
        this.user_info = null
        localStorage.removeItem('tarpit-user')
    }
}
