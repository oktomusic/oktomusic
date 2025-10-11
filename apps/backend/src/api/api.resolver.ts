import { Query, Resolver } from "@nestjs/graphql"

@Resolver()
export class ApiResolver {
  @Query(() => String, { name: "hello" })
  hello(): string {
    return "Hello Oktomusic"
  }
}
