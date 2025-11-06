import { Module } from "@nestjs/common";
import { ApiModule } from "./api/api.module";
import { ViewsModule } from "./views/views.module";
import { OpenGraphModule } from "./common/opengraph/opengraph.module";
import { AppConfigModule } from "./config/app-config.module";
import { HealthModule } from "./api/health/health.module";
import { SessionModule } from './session/session.module';

@Module({
  imports: [
    AppConfigModule,
    ApiModule,
    OpenGraphModule,
    HealthModule,
    ViewsModule,
    SessionModule,
  ],
})
export class AppModule {}
