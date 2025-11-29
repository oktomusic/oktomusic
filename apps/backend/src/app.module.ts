import { Module } from "@nestjs/common";

import { ApiModule } from "./api/api.module";
import { ViewsModule } from "./views/views.module";
import { OpenGraphModule } from "./common/opengraph/opengraph.module";
import { AppConfigModule } from "./config/app-config.module";
import { HealthModule } from "./api/health/health.module";
import { SessionModule } from "./session/session.module";
import { BullmqService } from "./bullmq/bullmq.service";
import { BullmqModule } from "./bullmq/bullmq.module";
import { PubSubModule } from "./common/pubsub/pubsub.module";
import { NativeModule } from './native/native.module';

@Module({
  imports: [
    AppConfigModule,
    PubSubModule,
    ApiModule,
    OpenGraphModule,
    HealthModule,
    ViewsModule,
    SessionModule,
    BullmqModule,
    NativeModule,
  ],
  providers: [BullmqService],
})
export class AppModule {}
