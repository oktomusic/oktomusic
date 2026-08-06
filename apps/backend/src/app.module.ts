import { Module } from "@nestjs/common";

import { ApiModule } from "./api/api.module";
import { HealthModule } from "./api/health/health.module";
import { BullmqModule } from "./bullmq/bullmq.module";
import { BullmqService } from "./bullmq/bullmq.service";
import { MetaTagsModule } from "./common/metatags/metatags.module";
import { PubSubModule } from "./common/pubsub/pubsub.module";
import { AppConfigModule } from "./config/app-config.module";
import { NativeModule } from "./native/native.module";
import { SessionModule } from "./session/session.module";
import { ViewsModule } from "./views/views.module";

@Module({
  imports: [
    AppConfigModule,
    PubSubModule,
    ApiModule,
    MetaTagsModule,
    HealthModule,
    ViewsModule,
    SessionModule,
    BullmqModule,
    NativeModule,
  ],
  providers: [BullmqService],
})
export class AppModule {}
