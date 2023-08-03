import { TpModule, TpThreadStrategy } from '@tarpit/core'
import { HttpAuthenticator } from '@tarpit/http'
import { AccessLogMongo, AccountMongo, ComicRecordMongo, CrashLogMongo, InvitationMongo, TestLogMongo } from './mongo'
import { AccountService } from './services/account.service'
import { MyAuthenticator } from './services/hooks/authenticator'
import { ComicSpiderService } from './services/comic/comic-spider.service'
import { ComicSyncStateService } from './services/comic/comic-sync-state.service'
import { DockerContainerService } from './services/docker-container.service'
import { LoggerService } from './services/logger.service'
import { MarkdownDocumentService } from './services/markdown-document.service'
import { TokenService } from './services/token.service'

@TpModule({
    providers: [
        LoggerService,
        AccountService,
        DockerContainerService,
        MarkdownDocumentService,
        ComicSpiderService,
        ComicSyncStateService,
        TokenService,
        AccessLogMongo,
        AccountMongo,
        ComicRecordMongo,
        CrashLogMongo,
        InvitationMongo,
        TestLogMongo,
        { provide: TpThreadStrategy, useValue: { max_thread: 20 } },
        { provide: HttpAuthenticator, useClass: MyAuthenticator },
    ]
})
export class CommonModule {

}
