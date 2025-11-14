import { Module } from "@nestjs/common";
import { ApiModule } from "./api/api.module";
import { ViewsModule } from "./views/views.module";
import { OpenGraphModule } from "./common/opengraph/opengraph.module";
import { AppConfigModule } from "./config/app-config.module";
import { HealthModule } from "./api/health/health.module";
import { SessionModule } from './session/session.module';
import { BullmqService } from './bullmq/bullmq.service';
import { BullmqModule } from './bullmq/bullmq.module';

@Module({
  imports: [
    AppConfigModule,
    ApiModule,
    OpenGraphModule,
    HealthModule,
    ViewsModule,
    SessionModule,
    BullmqModule,
  ],
  providers: [BullmqService],
})
export class AppModule {}
