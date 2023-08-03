import { GenericCollection, TpMongo } from '@tarpit/mongodb'
import { AccessLog, AccountData, ComicRecord, CrashLog, InvitationData, TestLog } from 'plank-types'

@TpMongo('main', 'access-log', { client_name: 'mongo1' })
export class AccessLogMongo extends GenericCollection<AccessLog>() {
}

@TpMongo('main', 'account', { client_name: 'mongo1' })
export class AccountMongo extends GenericCollection<AccountData>() {
}

@TpMongo('main', 'comic-record', { client_name: 'mongo1' })
export class ComicRecordMongo extends GenericCollection<ComicRecord>() {
}

@TpMongo('main', 'crash-log', { client_name: 'mongo1' })
export class CrashLogMongo extends GenericCollection<CrashLog>() {
}

@TpMongo('main', 'invitation')
export class InvitationMongo extends GenericCollection<InvitationData>() {

}

@TpMongo('main', 'test-log', { client_name: 'mongo1' })
export class TestLogMongo extends GenericCollection<TestLog>() {
}


