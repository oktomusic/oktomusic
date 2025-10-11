import { Module } from "@nestjs/common"
import { ApiModule } from "./api/api.module"
import { ViewsModule } from "./views/views.module"

@Module({
  imports: [ApiModule, ViewsModule],
})
export class AppModule {}
