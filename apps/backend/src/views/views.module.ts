import { Module } from "@nestjs/common";
import { ViewsController } from "./views.controller";

@Module({
  controllers: [ViewsController],
})
export class ViewsModule {}
