import { Module } from "@nestjs/common";
import { ApiModule } from "./api/api.module";
import { ViewsModule } from "./views/views.module";
import { OpenGraphModule } from "./common/opengraph/opengraph.module";
import { AppConfigModule } from "./config/app-config.module";

@Module({
  imports: [AppConfigModule, ApiModule, OpenGraphModule, ViewsModule],
})
export class AppModule {}
