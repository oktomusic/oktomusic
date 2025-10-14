import { Controller, Get, Render } from "@nestjs/common";
import { buildViewModel } from "./view-model";
import { OpenGraphService } from "../common/opengraph/opengraph.service";

@Controller()
export class ViewsController {
  constructor(private readonly og: OpenGraphService) {}
  @Get()
  @Render("index")
  home() {
    return buildViewModel({ ogp: this.og.getDefaultTags() });
  }
}
