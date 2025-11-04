import { Module } from "@nestjs/common";
import { ApiModule } from "./api/api.module";
import { ViewsModule } from "./views/views.module";
import { OpenGraphModule } from "./common/opengraph/opengraph.module";
import { AppConfigModule } from "./config/app-config.module";
import { HealthModule } from "./api/health/health.module";
import { OidcService } from "./oidc/oidc.service";

@Module({
  imports: [
    AppConfigModule,
    ApiModule,
    OpenGraphModule,
    ViewsModule,
    HealthModule,
  ],
  providers: [OidcService],
})
export class AppModule {}
