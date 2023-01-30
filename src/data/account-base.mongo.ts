import { GenericCollection } from '@tarpit/mongodb'

export interface BaseTable {

    created_at: number
    updated_at: number
}

export class AccountBaseMongo<T extends BaseTable> extends GenericCollection() {
    test() {

    }
}
