import {
  APIContainerComponent,
  ButtonStyle,
  ComponentType,
  SeparatorSpacingSize,
} from "discord-api-types/v10";

const emojiIds = {
  github: "1550543636557729823",
} as const satisfies Record<string, string>;

function getDiscordEmbedContent(appName: string): string {
  return `## ${appName}
**Oktomusic** is an opinionated, self-hosted music streaming server.`;
}

export function getDiscordEmbedJson(publicUrl: string, appName: string) {
  return {
    type: ComponentType.Container,
    components: [
      {
        type: ComponentType.Section,
        components: [
          {
            type: ComponentType.TextDisplay,
            content: getDiscordEmbedContent(appName),
          },
        ],
        accessory: {
          type: ComponentType.Button,
          label: "Open",
          url: publicUrl,
          style: ButtonStyle.Link,
        },
      },
      {
        type: ComponentType.Separator,
        divider: true,
        spacing: SeparatorSpacingSize.Small,
      },
      {
        type: ComponentType.ActionRow,
        components: [
          {
            type: ComponentType.Button,
            label: "GitHub",
            emoji: {
              id: emojiIds.github,
              name: "github",
            },
            url: "https://github.com/oktomusic/oktomusic",
            style: ButtonStyle.Link,
          },
          {
            type: ComponentType.Button,
            label: "Documentation",
            emoji: {
              name: "📝",
            },
            url: "https://oktomusic.afcms.dev",
            style: ButtonStyle.Link,
          },
        ],
      },
    ],
  } as const satisfies APIContainerComponent;
}
