#set page(paper: "a4", numbering: "1/1")
#set document(title: "Rapport de projet Oktomusic", author: "Louis WALTER")

#set heading(numbering: "1.")

#title()

= Compétences mises en oeuvre

= Cahier des charges

*Oktomusic* vise à proposer une solution de streaming musical concue pour l'auto hébergement, et répond à un besoin concret, basé sur l'anaylse des solutions existantes et des besoins des utilisateurs.

== Comparaison avec les solutions existantes

La volonté de proposer une solution de ce type est née de l'expérience de l'auteur avec les solutions existantes, notamment Jellyfin et Navidrome.

Les limites de ces solutions ont été identifiées et analysées, afin de définir clairement les besoins et les objectifs du projet Oktomusic et apporter une réelle amélioration.

=== Jellyfin

*Jellyfin*#footnote("https://jellyfin.org") est une solution très complète pour l'auto-hébergement de médias, capable de gérer plusieurs types de contenus : films, séries, musique, images, utilisateurs et bibliothèques partagées.

Cette approche généraliste rend l'expérience musicale moins spécialisée.

De plus, l'interface utilisateur est centrée principalement sur les médias vidéo, qui se traduit par une ergonomie et des fonctionalités moins adaptées à la lecture musicale.

- Un support limité des métadonnées audio, avec des difficultés pour gérer les crédits multiples pour les pistes et les albums.
- Manque de fonctionalités de lecture musicale moderne, dans le système de lecture, la gestion des playlists, ainsi que la navigation. Pas de support des paroles synchronisées mot-à-mot.
- Manque de fonctionalités modernes sur le client web
  - Pas de PWA réelle
  - Pas de mode Picture-in-Picture
- Aucun support d'OpenID Connect en standard, ce qui complique l'intégration dans une infrastructure d'identité déjà existante et l'administration des utilisateurs

=== Navidrome

*Navidrome*#footnote("https://www.navidrome.org") est plus proche du besoin, car il est conçu spécifiquement pour le streaming musical.

Il propose une solution légère et efficace pour exploiter une bibliothèque audio, incluant un support des clients OpenSubsonic.

- Pas de support des paroles synchronisées mot-à-mot.
- Manque de fonctionalités modernes sur le client web
  - Interface MUI avec design peu ergonomique
  - Pas d'expérience PWA réelle
  - Pas de mode Picture-in-Picture
- Comme Jellyfin, aucun support d'OpenID Connect en standard

Cependant, son interface et son modèle fonctionnel ne couvrent pas entièrement l'expérience recherchée pour Oktomusic : application web moderne, file d'attente riche, paroles synchronisées, gestion avancée des playlists et intégration navigateur via PWA, Media Session ou Picture-in-Picture.
Comme Jellyfin, il ne répond pas directement au besoin d'authentification déléguée par OpenID Connect.

== Objectifs du projet

Oktomusic se positionne avec une approche ciblé :

- Exploitation d'une bibilothèque exclusivement musicale
- Indexation basée sur des règles strictes de formats de métadonnées, basées sur les recommendations Vorbis#footnote("https://xiph.org/vorbis/doc/v-comment.html") ainsi que Musicbrainz Picard#footnote("https://picard-docs.musicbrainz.org/en/latest/variables/tags_basic.html")
- Expérience Web moderne sous forme de Progressive Web App (PWA) avec l'utilisation de fonctionnalités avancées des navigateurs (Media Session, Audio Session, Picture-in-Picture, OpenSearch, etc)
- Conception de l'interface centrée sur l'expérience des applications de streaming modernes (paroles synchronisées, recherche, file d'attente, etc.)
- Délégation complète de l'authentification à un fournisseur OpenID Connect au choix de l'opérateur du serveur, pour une meilleure sécurité et une administration simplifiée des utilisateurs
- Distribution sous forme d'image Docker, moderne et sécurisée
- Facilitation de l'interopérabilité via l'export de playlists, les métadonnées standardisées, etc.

== Utilisateurs cibles

*Administrateur / opérateur*

- Déployer l'application dans une infrastructure Docker.
- Configurer la connexion à PostgreSQL, Valkey et au fournisseur OpenID Connect.
- Lancer l'indexation d'une bibliothèque FLAC locale.
- Disposer d'une configuration explicite et documentée.

*Utilisateur final*

- Se connecter avec son compte existant.
- Rechercher et parcourir albums, artistes et pistes.
- Écouter la musique depuis le navigateur avec un lecteur persistant.
- Gérer ses playlists, sa bibliothèque personnelle et consulter les paroles disponibles.

== Périmètre fonctionnel

Le périmètre retenu pour la version présentée couvre :

- le déploiement de l'application et de ses dépendances ;
- l'authentification par OpenID Connect ;
- l'indexation des fichiers FLAC et de leurs métadonnées ;
- l'affichage du catalogue musical ;
- la lecture audio en streaming ;
- la gestion des playlists et de la bibliothèque utilisateur ;
- l'affichage des paroles synchronisées lorsqu'elles sont disponibles.

== Contraintes principales

- Application *web uniquement* : navigateur, PWA et APIs web modernes.
- Déploiement auto-hébergé, sans dépendance à un service externe obligatoire au runtime.
- Base de données relationnelle PostgreSQL pour les données persistantes.
- Sessions et traitements asynchrones persistés via Valkey.
- Authentification déléguée : aucun mot de passe utilisateur n'est géré par Oktomusic.
- Code source open-source sous licence AGPL-3.0.
- Documentation suffisante pour installer, configurer et présenter l'application.

== Hors périmètre initial

De nombreuses fonctionnalités ont été identifiées comme hors périmètre initial, mais pourraient être intégrées dans des versions futures.

=== Transcodage audio

L'application ne supportant en entrée que les fichiers au format sans-pertes FLAC, les utilisateurs souhaitant écouter de la musique sur des appareils ne disposant pas de débit internet suffisant ou de limites de données mobiles pourraient souhaiter le streaming de versions transcodées dans différents formats plus légers.

Ce besoin a été considéré au départ comme rentrant dans le périmètre initial, mais en a été écarté suite à des contraintes de temps de développement.

La conception prévoyait pour chaque fichier FLAC suite aux étapes d'indexation, la génération de différentes versions transcodées au format Opus#footnote[https://en.wikipedia.org/wiki/Opus_(audio_format)] avec différents débits binaires au moyen d'FFMpeg pour permettre à l'utilisateur de choisir la qualité de streaming adaptée à sa connexion.

Une évolution plus complexe aurait été la mise en place d'un transcodage à la volée, effectué au moment du streaming, mais aurait demandé un effort de développement plus important, notamment pour la gestion des performances, de la charge serveur et de l'interfaçage avec FFMpeg.

=== Interface responsive et adaptée aux contrôles tactiles

La possibilité d'utiliser l'application sur des petits écrans et avec contrôles tactiles a été envisagée dés le départ, mais écarté du périmètre initial pour se concentrer sur une utilisation essentiellement desktop.

Contrairement à une interface desktop, une interface responsive dotée de contrôles tactile notamment par gestes nécessite une conception et un développement spécifiques, ne ce limitant pas à une mise en page CSS.

Contrairement à un site web plus standard, la création de deux branches distinctes de l'interface aurait été nécessaires pour garantir une expérience de qualité telle que celle attendue par les utilisateurs d'application de streaming.

=== Interface compatible d'une utilisation de type console de salon

Certaines applications de streaming classiques ayant une intégration ou des applications spécifiques pour téléviseurs ou consoles de salon, la possibilité d'adapter l'interface pour une utilisation dans le navigateur de ce type d'appareil a été étudiée.

La plus grosse difficulté réside dans la nécéssité de supporter une navigation spatiale par focus, pour une utilisation avec une télécommande ou un gamepad (joystick ou D-pad).

Le modèle de focus classique des navigateurs est uni-directionnel, et ne permet pas à ce jour une navigation spatiale.
Il existe une spécification W3C `CSS Spatial Navigation Level 1`#footnote[https://www.w3.org/TR/css-nav-1] (working draft) pour doter les navigateurs de capacités de navigation spatiales, poussée par des ingénieurs de LG.

Les polyfils disponibles pour cette spécifications, ainsi que les bibliothèques de navigation spatiale open-source pour React#footnote[https://devportal.noriginmedia.com/docs/Norigin-Spatial-Navigation] n'étant pas assez matures ou nécéssitant des modifications trop lourdes au code de l'application, cette fonctionnalité a été écartée du périmètre initial.

La lecture de l'article de Spotify Engineering#footnote[https://engineering.atspotify.com/2023/5/tv-spatial-navigation] sur le sujet de la navigation spatiale sur les téléviseurs a été une source d'inspiration dans ces recherches.

=== Recommendations musicales avancées

Une des fonctionalités importantes des application de streaming musical modernes est la possibilité de proposer des playlists automatiques et la lecture infinie basées sur la similarité musicale et les habitudes d'écoute de l'utilisateur.

Une solution de ce type ne pouvant pas se baser uniquement sur le support des métadonnées de genres musicaux, mais nécéssite l'exploitation d'analyses acoustiques par IA.

Mes recherches sur les technologies open-source permettant de réaliser ce type d'analyse acoustique ont revevé le projet AudioMuse AI#footnote[https://github.com/NeptuneHub/AudioMuse-AI] qui est une solution intégrée dans Jellyfin, Navidrome et d'autres applications de streaming musical.
La création d'un plugin spécifique ou l'intégration de cette solution dans Oktomusic serait envisageable.

=== Support d'un mode hors-ligne complet

La plus part des applications de streaming musical modernes proposent un mode hors-ligne complet, permettant à l'utilisateur de télécharger des albums ou playlists pour les écouter sans connexion internet, ainsi que la mise en cache automatique de contenu sur la base du comportement de l'utilisateur.

Dans le cas de l'application Oktomusic, le support d'un mode hors-ligne nécéssite la mise en place de plusieurs mécanismes complexes.
Certaines d'entre elles sont déjà implémentées.

L'utilisation d'un Service Worker dans le cadre d'une PWA (Progressive Web App) permet de mettre en cache les fichiers statiques de l'application.
Une logique de mise en cache spécifique a été mise en place pour les fichiers audio, pour permettre un démarage plus rapide de la lecture des fichiers écoutés récemment.

Le mécanisme principal nécéssite une logique de détection du mode hors-ligne, couplée à une mise en cache des données GraphQL associées aux albums, playlists et à la librarie utilisateur.

Malheureusement, la librarie officielle permettant d'appliquer une logique de persistance de la mise en cache pour Apollo Client#footnote[https://github.com/apollographql/apollo-cache-persist] est non maintenue et ne supporte pas la dernière version stable, ce qui implique le fait de développer une solution spécifique pour l'application.

Par ailleurs, le fait de "télécharger" les fichiers audio pour assurer leur disponibilité indépendament du dernier accès nécéssite de mettre en place un mécanisme donnant au cache une durée de vie infinie, sois en adaptant la politique de cache, sois en téléchargeant les fichiers audio dans le système de fichiers du navigateur (Origin Private File System#footnote[https://developer.mozilla.org/en-US/docs/Web/API/File_System_API/Origin_private_file_system]) et en interceptant les requêtes réseau dans le Service Worker pour servir les fichiers depuis celui-ci.

= Présentation de l'entreprise/service

(à supprimer ?)

= Gestion de projet

== Collaboration et contributions upstream <collaboration>

Dans le cadre du projet, plusieurs rapports de bugs et demandes d’amélioration ont été effectués auprès des projets dépendants.

Cela a impliqué l’identification des causes, la rédaction de rapports reproductibles et le suivi des échanges.

- *docker/github-builder* (rapport de bug)#footnote[https://github.com/docker/github-builder/issues/194]: blocage des builds lié à une mauvaise récupération des références Git lors de la construction de l’image Docker
- *vite-plugin-sri-gen* (feature)#footnote[https://github.com/rbonestell/vite-plugin-sri-gen/issues/23]: injection des hachages SRI dans le manifest de build Vite, permettant d’abandonner le plugin custom de génération de SRI initialement écrit pour le projet
- *node-vibrant* (rapport de bug)#footnote[https://github.com/Vibrant-Colors/node-vibrant/issues/186]: correction de problèmes de typage TypeScript dans la bibliothèque d'extraction de couleurs dominantes
- *lingui* (rapport de bug)#footnote[https://github.com/lingui/js-lingui/issues/2584]: macro de traduction non fonctionnelle dans certains cas

= Spécifications fonctionnelles

#figure(image("../common/interface.excalidraw.svg"), caption: [Schéma de zoning])

= Architecture logicielle

#figure(image(
  "../common/architecture.excalidraw.svg",
  alt: "Schéma d'architecture",
  fit: "contain",
  format: "svg",
  height: auto,
), caption: [Schéma d'architecture])

== Générale

=== Langage de programmation

TypeScript #footnote[https://www.typescriptlang.org] a été choisi comme langage de programmation principal pour le développement de l'application, pour ses nombreux avantages :

- *Typage statique* : Les types statiques de TypeScript permettent de détecter beaucoup d'erreurs à la compilation, améliorant ainsi la robustesse et la maintenabilité du code.
- *ESLint* : TypeScript se combine parfaitement avec des outils de linting comme ESLint, permettant d'améliorer encore la robustesse du code.
- *Partage de code* : TypeScript permet de partager facilement du code et des types entre le backend et le frontend, notamment via des packages communs.
- *Ecosystème* : TypeScript bénéficie d'un écosystème riche de bibliothèques backend et frontend, et un support excellent dans les éditeurs de code, facilitant le développement.

== Backend

Le backend de l'application s'est architecturé autour du framework NestJS #footnote[https://nestjs.com], qui offre une structure standardisée et modulaire au dessus d'Express.js, avec un très bon support natif de TypeScript.

=== Base de données PostgreSQL + Prisma ORM

Pour la base de donnée principale, qui stocke les données de l'application (utilisateurs, albums, playlists, etc), le choix a été fait d'utiliser PostgreSQL #footnote[https://www.postgresql.org] pour sa robustesse et ses performances.

L'intégration avec la base de données est assurée par Prisma ORM #footnote[https://www.prisma.io], qui offre une définition de schéma de données simple et un générateur de client TypeScript très puissant.

Le support de JSON dans PostgreSQL et la souplesse de Prisma permettent de stocker des données complexes (ex : les paroles de chansons) de manière efficace, tout en bénéficiant d'un typage TypeScript des données.

=== Valkey

Pour la persistance des sessions utilisateur et les queues BullMQ, le choix a été fait d'utiliser Valkey #footnote[https://valkey.io], une base de données clé-valeur distribuée et performante.

Valkey est un fork de Redis 7 sous licence BSD 3-clause, maintenu par la Linux Foundation après son changement de licence vers une licence source-available (avant le rajout de la licence AGPL).

J'ai privilégié l'utilisation de Valkey dont la licence BSD 3-clause est plus permissive que la nouvelle licence AGPL.

Pour l'intégration, j'ai utilisé les bibliothèques officielles Valkey Glide #footnote[https://glide.valkey.io] et `iovalkey` pour la compatibilité avec BullMQ.

=== Authentification OpenID Connect

Le choix a été fait d'utiliser le protocole OpenID Connect #footnote[https://openid.net] pour l'authentification des utilisateurs.

L'application se comporte donc comme un Relying Party (RP) dans ce protocole, en déléguant la gestion des identités à un fournisseur d'identité (IdP) tiers tel que Keycloak #footnote[https://www.keycloak.org].

Elle utilise le flux d’autorisation (*Authorization Code Flow*) avec *PKCE* et des sessions côté serveur.
Elle s’appuie sur les protocoles *OpenID Connect Core* et *OpenID Connect Discovery*.

Cette approche présente plusieurs avantages applicatifs, notamment en laissant l'opérateur du serveur gérer lui même les aspects liés à la gestion des utilisateurs.
Pas besoin de gérer en interne la gestion des comptes, politiques de mot de passe, réinitialisation, emails, 2FA, etc.

De plus, elle permet de bénéficier d'une sécurité renforcée (voir section #link(<security_oidc>)[Sécurité, OpenID Connect])

== Frontend

Vite #footnote[https://vite.dev] est utilisé comme framework pour la partie frontend de l'application.

Compte tenu de la taille de l'application, les gains de performance offerts par la toolchain native utilisée par Vite en termes de temps de compilation et de rafraîchissement à chaud sont particulièrement utiles pour le développement.

- https://vite.dev
- https://react.dev
- https://www.apollographql.com
- https://lingui.dev

== Modélisation de la base de données

La base de données a été conçue en trois niveaux.
Le *MCD* décrit les concepts métier, le *MLD* les traduit en tables relationnelles, et le *MPD* correspond au schéma Prisma réellement utilisé par le backend.

=== MCD

Le MCD sépare le catalogue musical (albums, pistes, artistes, fichiers FLAC) des données utilisateur (comptes, playlists, bibliothèque et historique).
Les associations artistes/albums/pistes sont explicites pour gérer les crédits multiples et leur ordre d'affichage.

#figure(
  image("../common/database_mcd.png", alt: "Modèle conceptuel de données Oktomusic", fit: "contain", width: 100%),
  caption: [Modèle conceptuel de données du catalogue musical et des données utilisateur],
)

=== MLD

Le MLD transforme ces concepts en tables PostgreSQL.
Les relations many-to-many passent par des tables de jointure comme `AlbumArtist`, `TrackArtist` et `PlaylistTrack`, qui stockent aussi l'ordre des artistes ou la position des pistes.
Les contraintes d'unicité et les index servent à garantir la cohérence des données importées et à accélérer les requêtes courantes.

#figure(
  image("../common/database_mld.png", alt: "Modèle logique de données Oktomusic", fit: "contain", width: 100%),
  caption: [Modèle logique de données avec tables relationnelles, jointures et contraintes],
)

=== MPD et schéma Prisma

Le MPD est matérialisé par le schéma Prisma.
Il définit les types PostgreSQL, les index, les contraintes et les règles de suppression en cascade.
Prisma génère ensuite le client TypeScript utilisé par les services NestJS.
Le champ `lyrics`, stocké en `jsonb`, permet par exemple de conserver les paroles synchronisées dans PostgreSQL tout en les manipulant avec un typage applicatif.

#figure(image(
  "../common/database_prisma.png",
  alt: "Modèle physique de données Oktomusic dans Prisma",
  fit: "contain",
  width: 100%,
), caption: [Modèle physique de données sous forme de schéma Prisma])

= Spécifications techniques

== Organisation du code

Le code source de l'application est organisé dans un monorepo PNPM #footnote[https://pnpm.io/workspaces] hébergé sur un repository GitHub à l'exception de la version customisée de FFmpeg gérée dans un repository séparé.

Différent packages sont définis pour les différentes parties de l'application (backend, frontend, packages communs, etc).

Les packages communs utilisent `tsdown` #footnote[https://tsdown.dev].

#table(
  columns: (auto, auto, auto),
  align: horizon,
  table.header([*Location*], [*Package*], [*Description*]),
  // Apps
  table.cell[`apps/`],
  table.cell[`backend`],
  table.cell[Backend (NestJS 11)],
  table.cell[`apps/`],
  table.cell[`frontend`],
  table.cell[Frontend (Vite 8 + React)],
  table.cell[`apps/`],
  table.cell[`website`],
  table.cell[
    Site web de documentation (VitePress, Cloudflare Pages) #footnote[https://oktomusic.afcms.dev]
  ],
  // Packages
  table.cell[`packages/`],
  table.cell[`api-schemas`],
  table.cell[
    Schémas Zod 4 pour les endpoints REST, utilisés pour la validation côté serveur, les types TypeScript client et serveur et la génération de documentation API (via OpenAPI)
  ],
  table.cell[`packages/`],
  table.cell[`lyrics`],
  table.cell[
    Parsing des fichiers de paroles LRC #footnote[https://en.wikipedia.org/wiki/LRC_(file_format)] et TTML #footnote[https://en.wikipedia.org/wiki/Timed_Text_Markup_Language], définition d'un modèle de données JSON commun pour les paroles.
    Utilisé par le backend.
  ],
  table.cell[`packages/`],
  table.cell[`meta-tags`],
  table.cell[
  Génération de tags `meta` HTML pour les pages de l'application et du site de documentation.
  Supporte les tags Open Graph #footnote[https://ogp.me] et DAIU #footnote[https://daiu.org]
  ],
  table.cell[`packages/`],
  table.cell[`metaflac-parser`],
  table.cell[
  Parsing et validation de métadonnées FLAC basé sur l'exécutable `metaflac`.
  Utilisé par le backend.
  ],
  table.cell[`packages/`],
  table.cell[`playlists`],
  table.cell[
    Parsing et génération de fichiers de playlist XSPF #footnote[https://xspf.org] et M3U #footnote[https://en.wikipedia.org/wiki/M3U], utilisant le format JSPF en modèle commun.
    Utilisé par le backend.
  ],
  table.cell[`packages/`],
  table.cell[`vibrant`],
  table.cell[
  Extraction de couleurs dominantes à partir d'images, basée sur les bibliothèques `sharp` et `@vibrant` (algo MMCQ).
  Utilisé par le backend pour l'analyse des couvertures d'album.
  ],
)

== Agents IA

Le développement de l'application a été assisté par l'utilisation d'agents LLMs pour de nombreuses tâches, à la fois pour la génération de code, la rédaction de documentation, la création de tests unitaires, la recherche et le prototypage de fonctionnalités, etc.

Un effort a été fait pour maximiser l'efficacité de ces outils, en fournissant un environment de développement complet pour les agents autonomes, ainsi que des instructions système détaillées et spécialisées pour chaque partie de l'application.

Ces instructions couvrent des aspects tels que l'architecture du projet (organisation des fichiers), les conventions de code (TypeScript, CSS, nommage, etc.), les exigences de performances et d'accessibilité (CSP, respect des recommendations WCAG 2.2 AAA, etc.).

Des prompts réutilisables ont été créés pour automatiser des tâches courantes, comme la création de nouveaux packages partagés, impliquant des modifications dans plusieurs parties de la base de code (CI/CD, Docker, configuration ESLint et Vitest, etc).
L'automatisation de ces tâches répétitives a permis de réduire le risque d'oublis ou d'erreurs humaines, pouvant causer des erreurs CI/CD.

Les Agents et LLMs utilisés proviennent principalement de la plateforme GitHub Copilot #footnote[https://github.com/features/copilot], mais aussi de Codex#footnote[https://openai.com/codex].
Les modèles utilisés incluent les modèles _GPT-5_ de OpenAI, _Claude Sonnet_ et _Claude Opus_ de Anthropic et _Grok Code Fast 1_ de xAI.

== Conformité RGPD <rgpd>

L'application se veut faciliter la conformité au RGPD #footnote[https://www.cnil.fr/fr/reglement-europeen-protection-donnees].

Comme nous ne fournissons pas l'application sous forme de service, ni ne collectons de télémérie ou données personelles, l'opérateur du serveur est le responsable de traitement conformément au RGPD.

// TODO: outils de conformité RGPD (suppression, etc)

== Accessibilité <accessibility>

// Lighthouse
// WCAG 2.2 AAA
// RGAA

= Réalisations

== Version customisée de FFmpeg <ffmpeg>

L'application exploite les capacités de FFmpeg et metaflac pour l'extraction des métadonnées des fichiers FLAC.

Pour l'inclusion de FFmpeg dans l'image Docker de l'application, le choix a été fait de compiler une version statique et customisée de FFmpeg 8 et de ces dépendances principales à partir des sources officielles.

L'avantage principal de cette approche est de limiter la taille de l'image finale en n'incluant que les codecs audio FLAC et Opus.

Les gains de taille sont significatifs, avec des binaires finaux d'environ 5Mo contre 140Mo pour la distribution de FFmpeg fournie par Alpine Linux.

Ces binaires sont distribués sous forme d'image Docker, pour permettre une intégration facile dans l'image Docker de l'application via un layer séparé.

Le fichier Dockerfile et les pipeline CI/CD de construction de cette image sont disponibles dans un repository séparé sur GitHub #footnote[https://github.com/oktomusic/ffmpeg-custom].

L'image a été construite à partir des sources officielles de FFmpeg et de ses dépendances, avec un support de la cross compilation native Docker #footnote[https://docs.docker.com/build/building/multi-platform/#cross-compilation] et vérification des hash des sources pour garantir l'intégrité des composants utilisés :

- libogg #footnote[https://github.com/xiph/ogg]
- libopus #footnote[https://github.com/xiph/opus]
- libflac #footnote[https://github.com/xiph/flac] (binaire metaflac)
- ffmpeg #footnote[https://ffmpeg.org] (binaires ffmpeg et ffprobe)

```Dockerfile
# syntax=docker/dockerfile:1
# check=error=true

FROM --platform=$BUILDPLATFORM tonistiigi/xx AS xx
FROM --platform=$BUILDPLATFORM alpine:3.22 AS builder

# (...)

ENV OGG_VERSION=1.3.6
ENV OGG_CHECKSUM=sha256:83e6704730683d004d20e21b8f7f55dcb3383cdf84c0daedf30bde175f774638
ADD --unpack=true \
    --checksum=${OGG_CHECKSUM} \
    https://github.com/xiph/ogg/releases/download/v${OGG_VERSION}/libogg-${OGG_VERSION}.tar.gz \
    /usr/local/src/
WORKDIR /usr/local/src/libogg-${OGG_VERSION}
RUN CC=xx-clang ./configure \
    --host=$(xx-clang --print-target-triple) \
    --disable-shared \
    --enable-static \
    --prefix=$(xx-info sysroot)usr/local \
    && make -j$(nproc) \
    && make install

# (...)

RUN xx-verify --static /usr/local/bin/ffmpeg
RUN xx-verify --static /usr/local/bin/ffprobe
RUN xx-verify --static /usr/local/bin/metaflac

# Create minimal runtime image
FROM scratch AS runtime

COPY --from=builder /usr/local/bin/ffmpeg /usr/local/bin/ffmpeg
COPY --from=builder /usr/local/bin/ffprobe /usr/local/bin/ffprobe
COPY --from=builder /usr/local/bin/metaflac /usr/local/bin/metaflac
```

== Système de parsing de fichiers de paroles synchronisées

Pour son support de la visualisation des paroles synchronisées, l'application intègre un système de parsing de fichiers de paroles, dans le package `@oktomusic/lyrics`.

Ce système supporte en entrée plusieurs formats de fichiers :

- LRC #footnote[https://en.wikipedia.org/wiki/LRC_(file_format)] (synchronisation ligne à ligne)
- Enhanced LRC #footnote[https://en.wikipedia.org/wiki/LRC_(file_format)#A2_extension_(Enhanced_LRC_format)] (synchronisation ligne à ligne + par début de mots)
- TTML #footnote[https://en.wikipedia.org/wiki/Timed_Text_Markup_Language] (XML, synchronisation complète, ligne et mots avec les informations de début et de fin)

Un système de parsing spécifique à été développé pour les fichiers LRC, un parser XML basé sur la librarie `fast-xml-parser` est utilisé pour les fichiers TTML.

Les données parsées sont extraites dans un format commun compatible JSON, inspiré par l'API richsync de Musixmatch#footnote[https://docs.musixmatch.com/api-reference/lyrics-catalog/track-richsync-get], défini par un schéma Zod #footnote[https://zod.dev] et permettant un typage strict en backend.

Des tests unitaires complets ont été écrits pour garantir la robustesse du système de parsing.

Ces données sont stoquées directement dans la base de données PostgreSQL, en exploitant le type `jsonb` ainsi qu'un générateur de types TypeScript pour Prisma#footnote[https://github.com/arthurfiorette/prisma-json-types-generator], dans le but de garantir la cohérence des données.

== Système de parsing et de génération de fichiers de playlist

Pour faciliter l'intéropérabilité avec d'autres applications, l'application supporte l'import et l'export de playlists au format XSPF #footnote[https://xspf.org], JSPF (variante JSON) et M3U #footnote[https://en.wikipedia.org/wiki/M3U], dans le package `@oktomusic/playlists`.

Le modèle de données commun est celui de JSPF, qui permet une manipulation facile des données en TypeScript. Celui-ci est définit par un schéma Zod, permettant une utilisation directe pour parser les fichiers JSPF.

Un parseur basé sur la librarie `fast-xml-parser` est utilisé pour les fichiers XSPF, tandis que les fichiers M3U sont parsés via une approche spécifique basée sur une itération ligne à ligne et des expressions régulières.

Des tests unitaires complets ont été écrits pour garantir la robustesse du système de parsing et de génération de fichiers de playlist.

== Extraction de couleurs dominantes dans les couvertures d'album

L'application intègre un système d'extraction de couleurs dominantes à partir des images de couverture d'album, dans le package `@oktomusic/vibrant`.

Les couvertures d'album subissant une conversion au format AVIF en plusieurs résolutions obtimisées à l'aide de la librarie `sharp`#footnote("https://sharp.pixelplumbing.com"), la décision a été prise de développer un adaptateur pour sharp basé sur les algorithme MMCQ exportés par les modules de la bibliothèque `node-vibrant`#footnote[https://vibrant.dev], permettant d'éviter l'ajout d'une dépendance supplémentaire (`jimp`) et de charger deux fois les images en mémoire au moment de l'indexation.

== Validation des métadonnées FLAC

Pour garantir un système d'indexation robuste et cohérent, notamment en évitant la perte de donnée au maximum lors d'une réindexation tout en conservant la qualité des métadonnées, le projet impose des exigences claires aux fichiers exploités.

Les fichiers manipulés par l'application sont au format FLAC et utilisent donc les commentaires Vorbis #footnote[https://xiph.org/vorbis/doc/v-comment.html] comme format de métadonnées.

Le format Vorbis ne définit malheureusement que des recommandations pour les noms et le format des tags, et ne définit pas de standard strict pour les métadonnées musicales.

Une spécification stricte a donc été définie pour les tags gérés par l'application, basée sur les recommandations Vorbis et les conventions Musicbrainz Picard#footnote[https://picard-docs.musicbrainz.org/en/latest/variables/tags_basic.html].

Le choix a été fait d'imposer ce modèle stricte pour limiter l'indexation de fichiers ne respectant pas la structure d'un album, et faire correspondre plus simplement le modèle de données plat des fichiers FLAC avec le modèle relationnel de la base de données.

#table(
  columns: (auto, auto, auto, auto, auto),
  align: horizon,
  table.header([*Nom*], [*Requis*], [*Format*], [*Unique*], [*Multiple*]),
  `TITLE`,
  [Oui],
  [String],
  [Non],
  [Non],
  `ARTIST`,
  [Oui],
  [String],
  [Non],
  [Oui],
  `ALBUM`,
  [Oui],
  [String],
  [Oui],
  [Non],
  `ALBUMARTIST`,
  [Oui],
  [String],
  [Oui],
  [Oui],
  `TRACKNUMBER`,
  [Oui],
  [Entier >= 1],
  [Non],
  [Non],
  `TOTALTRACKS`,
  [Oui],
  [Entier >= 1],
  [Non],
  [Non],
  `DISCNUMBER`,
  [Oui],
  [Entier >= 1],
  [Non],
  [Non],
  `TOTALDISCS`,
  [Oui],
  [Entier >= 1],
  [Oui],
  [Non],
  `DATE`,
  [Non],
  [`YYYY-MM-DD`],
  [Non],
  [Non],
  `ISRC`,
  [Non],
  [Code ISRC#footnote[https://en.wikipedia.org/wiki/International_Standard_Recording_Code]],
  [Non],
  [Non],
)

- *Unique*: Tous les fichiers d'un même album doivent avoir la même valeur pour ce tag
- *Multiple*: Un seul fichier peut contenir plusieur fois le tag, avec des valeurs différentes (ex: plusieurs artistes pour un même album). L'ordre des valeurs est conservé.
- Les tags multiples utilisants des caractères de séparation (ex: `;`) ne sont pas supportés, car ne correspondant pas au standard Vorbis
- `TOTALTRACKS` est le nombre total de pistes dans le disque `DISCNUMBER`
- `TRACKNUMBER` est le numéro de la piste dans son disque `DISCNUMBER`
- `TOTALTRACKS` et `TOTALDISCS` sont validés pour la cohérence à travers tous les fichiers de l'album
- Les paires `DISCNUMBER` + `TRACKNUMBER` sont validées pour l'unicité à travers tous les fichiers de l'album
- Deux artistes différents avec le même nom ne peuvent pas être distingués. Le processus d'indexation pourrait prendre en charge une clé supplémentaire comme `MUSICBRAINZ_ARTISTID` à l'avenir pour résoudre ce problème.

L'extraction des métadonnées et la validation de format par fichier sont effectués par le module `@oktomusic/metaflac-parser` et exploite la sortie standard de l'outil CLI `metaflac` (faisant partie de la librarie FLAC officielle) pour extraire les métadonnées Vorbis.

Un parseur spécifique a été développé pour l'analyse ligne à ligne, les vérifications de format et la génération d'un objet JSON typé pour le backend se faisant via un schéma Zod.

=== Parser ligne à ligne

Source : `packages/metaflac-parser/src/utils.ts`

Les lignes de sorties sont analysées via une expression régulière, les clés sont normalisées en majuscules et les valeurs sont stockées dans un tableau pour gérer les tags multiples.

```ts
export type MetaflacLinesParseResult = Record<string, string[]>;

export const lineRegex = /^([a-zA-Z]*)=(.*)$/;

export function parseLine(line: string): [string, string] | null {
  const match = lineRegex.exec(line);
  if (match) {
    const [, key, value] = match;
    return [key.toUpperCase(), value];
  }
  return null;
}

export function parseOutput(data: string): MetaflacLinesParseResult {
  const lines = data.trim().split("\n");

  const result: MetaflacLinesParseResult = {};
  for (const line of lines) {
    const parsed = parseLine(line);
    if (parsed) {
      const [key, value] = parsed;
      if (key in result) {
        result[key].push(value);
      } else {
        result[key] = [value];
      }
    }
  }
  return result;
}
```

=== Validation par fichier

Source : `packages/metaflac-parser/src/index.ts`

La validation de format par fichier se fait via un premier schéma Zod. Pour valider les tags unique, on utilise un tuple Zod de longueur 1 et des tableaux simples pour les tags multiples.

Les valeurs sont ensuite transformées en un objet plat via un deuxième schéma Zod pour une utilisation plus facile en backend.

```ts
// zPlainDate est un une fonction Zod pour valider les dates au format `YYYY-MM-DD` et en sortir un objet Temporal.PlainDate

export const isrcRegex = /^[A-Z]{2}-?\w{3}-?\d{2}-?\d{5}$/;

const IntermediateMetaflacSchema2 = z.object({
  TITLE: z.tuple([z.string()]),
  ALBUM: z.tuple([z.string()]),
  TRACKNUMBER: z.tuple([z.coerce.number()]),
  DISCNUMBER: z.tuple([z.coerce.number()]),
  TOTALTRACKS: z.tuple([z.coerce.number()]),
  TOTALDISCS: z.tuple([z.coerce.number()]),
  ARTIST: z.array(z.string()),
  ALBUMARTIST: z.array(z.string()),
  DATE: z.tuple([zPlainDate]).optional(),
  ISRC: z
    .tuple([z.string().regex(isrcRegex, "Invalid ISRC format")])
    .optional(),
});

export const MetaflacSchema = IntermediateMetaflacSchema.transform((val) => ({
  TITLE: val.TITLE[0],
  ARTIST: val.ARTIST,
  ALBUM: val.ALBUM[0],
  ALBUMARTIST: val.ALBUMARTIST,
  TRACKNUMBER: val.TRACKNUMBER[0],
  DISCNUMBER: val.DISCNUMBER[0],
  TOTALTRACKS: val.TOTALTRACKS[0],
  TOTALDISCS: val.TOTALDISCS[0],
  DATE: val.DATE?.[0],
  ISRC: val.ISRC?.[0],
}));
```

=== Validation par collection de fichiers

Source: `apps/backend/src/bullmq/processors/indexing.utils.ts`

Pour indexer un album, les fichiers FLAC doivent passer une vérification de cohérence globale.

Cette validation est effectuée après la validation individuelle de chaque fichier, sur l'ensemble des fichiers FLAC présents dans un même dossier d'album. Elle permet de vérifier que la collection de fichiers représente bien un album unique et complet avant de créer ou mettre à jour les entités en base de données.

Les vérifications sont effectuées dans l'ordre suivant :

+ *Identité de l'album* : tous les fichiers du dossier doivent partager la même valeur `ALBUM`, et la même liste `ALBUMARTIST` dans le même ordre. Cela évite qu'un même dossier mélange plusieurs albums ou plusieurs crédits d'album différents.

+ *Nombre total de disques* : la valeur `TOTALDISCS` doit être identique sur tous les fichiers. Cette valeur doit également correspondre au plus grand `DISCNUMBER` présent dans le dossier. Par exemple, si le disque le plus élevé est `DISCNUMBER=2`, alors `TOTALDISCS` doit être égal à `2`.

+ *Collecte des positions de pistes* : le système regroupe ensuite les fichiers par couple `DISCNUMBER` + `TRACKNUMBER`, puis par disque. Cette étape ne produit pas d'erreur directement, mais prépare les informations nécessaires aux validations suivantes.

+ *Unicité des positions* : un même couple `DISCNUMBER` + `TRACKNUMBER` ne peut apparaître qu'une seule fois dans l'album. Deux fichiers ne peuvent donc pas représenter simultanément la piste `2` du disque `1`.

+ *Nombre total de pistes par disque* : pour chaque disque, tous les fichiers doivent déclarer la même valeur `TOTALTRACKS`. Cette règle est appliquée disque par disque, car `TOTALTRACKS` représente le nombre de pistes dans le disque courant, et non dans l'album complet.

+ *Continuité des numéros de pistes* : pour chaque disque, les valeurs `TRACKNUMBER` doivent former une séquence complète de `1` à `TOTALTRACKS`. Cela permet de détecter à la fois les pistes manquantes, les doublons et les numéros hors limites.

Si l'une de ces règles échoue, le dossier reçoit un avertissement `WARNING_FOLDER_METADATA`. Il est alors exclu des étapes suivantes de synchronisation des artistes, des albums et des pistes, ce qui empêche l'indexation partielle ou ambiguë d'un album.

== Adaptation de l’interface aux couleurs des albums

Source : `apps/frontend/src/hooks/vibrant_colors.ts`

Des éléments d'interface de l'application sont adaptés aux couleurs dominantes des couvertures d'album, extraites à l'indexation (voir la section dédiée), pour améliorer l'expérience utilisateur et la cohérence visuelle.

Pour faciliter l'exploitation contextuelle de ces couleurs, des propriétés CSS personalisées#footnote[https://developer.mozilla.org/en-US/docs/Web/CSS/Reference/At-rules/@property] ainsi que des hook React ont été définis à cet effet.

Les propriétés CSS sont définies avec le sélecteur `@property` pour permettre le type checking et la définition d'une valeur initiale.

```css
@property --album-color-vibrant {
  syntax: "<color>";
  inherits: true;
  initial-value: transparent;
}

@property --album-color-vibrant-dark {
  syntax: "<color>";
  inherits: true;
  initial-value: transparent;
}

/* ... */
```

Après cette définition, le hook React `useVibrantColors` peut être utilisé contextuellement pour appliquer les couleurs extraites à un élément HTML, en utilisant les propriétés CSS définies.

```ts
export interface VibrantColors {
  readonly vibrant: string;
  readonly darkVibrant: string;
  ...
}

export type VibrantColorsPartial = Partial<VibrantColors>;

export function applyColorProperties(
  elem: HTMLElement,
  colors: VibrantColorsPartial,
) {
  elem.style.setProperty("--album-color-vibrant", colors.vibrant || null);
  elem.style.setProperty("--album-color-vibrant-dark", colors.darkVibrant || null);
  ...
}


export function useVibrantColors(
  targetRef: RefObject<HTMLElement | null>,
  colors?: VibrantColors,
  fallbackColors?: VibrantColorsPartial,
) {
  useEffect(() => {
    const target = targetRef.current;

    if (!target) {
      return undefined;
    }

    applyColorProperties(target, colors ? colors : fallbackColors || {});

    return () => {
      applyColorProperties(target, {});
    };
  }, [colors, fallbackColors, targetRef]);
}
```

Les éléments enfants pourront ensuite exploiter ces propriétés CSS pour adapter leur style en conséquence. Les hooks peuvent êtres imbriqués, permettant de définir les couleurs pour un composant parent, et de les surcharger dans un composant enfant.

Les couleurs de l'album du titre en cours de lecture sont appliquées de manière automatique à l'élément racine de l'application, et sont donc disponibles pour tous les composants enfants par défaut.

```css
.component {
  background-image: linear-gradient(
    45deg in oklch,
    var(--album-color-vibrant-dark),
    var(--album-color-vibrant)
  );
}
```

== Lecteur Picture-in-Picture

Source : `apps/frontend/src/components/PipControls/PipControls.tsx`

L'interface de l'application intègre un mini lecteur, détachable de la page principale, exploitant l'API web Document Picture-in-Picture#footnote[https://developer.mozilla.org/en-US/docs/Web/API/Document_Picture-in-Picture_API] pour permettre à l'utilisateur de continuer à contrôler sa musique tout en naviguant sur d'autres pages ou applications.

Ce lecteur a représenté un défi technique particulier pour s'adapter aux contraintes de l'API Document Picture-in-Picture et au fonctionnement du bundler Vite.

La principale caractéristique de l'API est qu'elle permet l'obtention d'une instance spécifique de l'interface `Document`#footnote[https://developer.mozilla.org/en-US/docs/Web/API/Document] séparée de la page principale.

Un portail ReactDOM#footnote[https://react.dev/reference/react-dom/createPortal
] a été utilisé pour rendre le mini lecteur dans le document détaché, tout en conservant l'accès aux hooks React et à l'état global de l'application, sans créer une nouvelle racine React.

Les styles CSS importés par l'application n'étant pas automatiquement appliqués par Vite au document détaché, il a été nécessaire de cloner les styles dans celui-ci pour permettre de les exploiter.

Une branche spécifique a été créée pour gérer le clonage des styles inline en mode développement, conformément au fonctionnement de Vite. Cette branche est supprimée automatiquement en production par le bundler Vite (tree-shaking).

```ts
export function PipControls(): ReactPortal | null {
  const [pipOpen, setPipOpen] = useAtom(pipOpenAtom);

  const pipWindowRef = useRef<Window | null>(null);
  const [pipContainer, setPipContainer] = useState<HTMLElement | null>(null);

  useEffect(() => {
    if (!pipOpen) return;
    let cancelled = false;
    let eventSourcePipWindow: Window | null = null;
    const syncClosed = () => setPipOpen(false);

    async function openPip() {
      try {
        const pipWin = await window.documentPictureInPicture!.requestWindow(...);

        if (cancelled) {
          pipWin.close();
          return;
        }

        pipWindowRef.current = pipWin;

        const doc = pipWin.document;

        [...document.querySelectorAll('link[rel="stylesheet"]')].forEach(
          (link) => {
            doc.head.appendChild(link.cloneNode(true));
          },
        );

        ...

        if (import.meta.env.DEV) {
          [...document.querySelectorAll("style")].forEach((style) => {
            doc.head.appendChild(style.cloneNode(true));
          });
        }

        const container = doc.createElement("main");
        doc.body.appendChild(container);
        setPipContainer(container);

        eventSourcePipWindow = pipWin;
        pipWin.onpagehide = syncClosed;
        pipWin.onbeforeunload = syncClosed;
      } catch (e) {
        setPipOpen(false);
      }
    }

    void openPip();

    return () => {
      cancelled = true;
      if (eventSourcePipWindow) {
        eventSourcePipWindow.onpagehide = null;
        eventSourcePipWindow.onbeforeunload = null;
      }
      eventSourcePipWindow = null;
      if (pipWindowRef.current) {
        if (!pipWindowRef.current.closed) {
          pipWindowRef.current.close();
        }
        pipWindowRef.current = null;
      }
      setPipContainer(null);
    };
  }, [pipOpen, pipSupported, setPipOpen]);

  if (!pipContainer) return null;

  return ReactDOM.createPortal(
    <PipControlsWindow pipDocument={pipContainer.ownerDocument} />,
    pipContainer,
  );
}
```

#figure(image(
  "../common/screenshots/player_pip.png",
  alt: "Mini lecteur détachable en mode Picture-in-Picture",
  fit: "contain",
  format: "png",
  width: 50%,
  scaling: "smooth",
), caption: [Mini lecteur détachable en mode Picture-in-Picture])

= Sécurité de l'application <security>

== OpenID Connect <security_oidc>

L'application utilise le protocole OpenID Connect#footnote[https://openid.net] pour l'authentification des utilisateurs. Cette approche présente plusieurs avantages clés en termes de sécurité :

- *Externalisation de la gestion des identités* : la responsabilité de l'authentification et de la gestion des sessions est confiée à un fournisseur d'identité (IdP) spécialisé, réduisant le risque d'erreurs de mise en œuvre dans l'application elle-même.
- *Renforcement de la sécurité des sessions* : les IdP gèrent des mécanismes robustes de création, de renouvellement et de révocation des tokens, limitant les risques de détournement de session ou de vol de credentials.
- *Support natif pour l’authentification multi-facteur (MFA)* : OpenID Connect permet d’intégrer facilement des facteurs supplémentaires pour sécuriser l’accès aux comptes utilisateurs.
- *Réduction de l’exposition aux attaques côté application* : en délégant l’authentification, l’application n’a pas à stocker ou vérifier directement les mots de passe, ce qui limite le risque de compromission via des vulnérabilités locales ou des fuites de données.
- *Interopérabilité et standards* : OpenID Connect est un protocole largement adopté et audité, permettant de bénéficier d’un écosystème de sécurité mature et de mises à jour régulières.

En pratique, l’implémentation de l’application repose sur des redirections sécurisées vers l’IdP et sur la gestion de tokens de session côté serveur, garantissant que les requêtes cross-origin sont limitées et sécurisées, comme détaillé dans la section #link(<security_http>)[Sécurité HTTP].

== Sécurité HTTP <security_http>

Pour exploiter pleinement les fonctionnalités de sécurité offertes par les navigateurs, une approche de sécurité maximale par défaut a été appliquée tout au long du développement de l'application.

Le premier choix technique a été une politique de *zéro ressources externes* : l’application ne fait appel à aucun CDN ni API tierce au runtime.

Les dépendances frontend sont versionnées, auditées et servies par l'application elle-même, garantissant leur intégrité et leur traçabilité, et évitant ainsi les risques liés à l’inclusion de ressources non contrôlées (ex : injection de code malveillant via une bibliothèque JavaScript compromise).

Cette architecture supprime les requêtes cross-origin initiées par le navigateur (XMLHttpRequest, fetch). Les interactions cross-origin restantes se limitent aux redirections de navigation nécessaires au protocole OpenID Connect, qui ne sont pas soumises aux mécanismes CORS.

La configuration CORS peut donc être très restrictive, ne permettant que les origines de l'application elle-même.

Cette politique permet également :

- la mise en place d’une Content Security Policy très restrictive (`default-src 'self'`)
- une réduction des besoins en requêtes cross-origin, simplifiant la configuration CORS

=== SRI (Subresource Integrity) <security_sri>

L’utilisation de Subresource Integrity (SRI)#footnote[https://developer.mozilla.org/en-US/docs/Web/Security/Defenses/Subresource_Integrity] permet de garantir l’intégrité des ressources chargées par le navigateur en vérifiant leur empreinte cryptographique.

Avec le header Integrity-Policy, le navigateur requiert la présence d’attributs d’intégrité sur toutes les ressources chargées par l'application, même celles hébergées localement, assurant ainsi une protection contre tout ajout ou modification non autorisée d'un script.

Ce mécanisme constitue une protection complémentaire au #link(<security_csp>)[CSP] contre les attaques de type supply chain.

=== CSP (Content Security Policy) <security_csp>

Une Content Security Policy (CSP) #footnote[https://developer.mozilla.org/en-US/docs/Web/HTTP/Reference/Headers/Content-Security-Policy] stricte est mise en place afin de limiter les sources de contenu autorisées et réduire les risques d’injection (notamment XSS).

La politique appliquée repose sur les principes suivants :
- restriction des sources à l’origine de l’application (`'self'`)
- interdiction des scripts et CSS inline
- limitation stricte des connexions réseau

=== Permissions Policy <security_permissions>

Une Permissions Policy #footnote[https://developer.mozilla.org/en-US/docs/Web/HTTP/Guides/Permissions_Policy] est définie afin de restreindre l’accès aux fonctionnalités sensibles du navigateur.

Par défaut, toutes les fonctionnalités non nécessaires sont désactivées, et limitées à l’origine de l’application lorsque leur activation est justifiée.

Cette politique permet de réduire l’impact d’une éventuelle compromission d'une bibliothèque client en empêchant l’accès aux ressources matérielles ou sensibles.

=== Respect des bonnes pratiques de sécurité HTTP

Tout au long du développement, les instances de pré-production de l'application ont été régulièrement testées à l'aide d'outils d'analyse de sécurité HTTP tels que Security Headers #footnote[https://securityheaders.com] (Snyk), HTTP Observatory #footnote[https://developer.mozilla.org/en-US/observatory] (Mozilla) et CSP Evaluator #footnote[https://csp-evaluator.withgoogle.com] (Google), dans le but d'obtenir les meilleurs résultats possibles.

Pour une instance de production (derrière reverse proxy Traefik), les résultats obtenus sont les suivants :

#table(
  columns: (auto, auto),
  align: horizon,
  table.header([*Outil*], [*Score*]),
  [Security Headers],
  table.cell(fill: green, "A+"),
  [HTTP Observatory],
  table.cell(fill: green, "A+ (140/100)"),
  [CSP Evaluator],
  table.cell(fill: green, "Green"), // TODO
)

== Supply chain <security_supply_chain>

La sécurité de la chaîne d’approvisionnement logicielle (supply chain) est prise en compte afin de limiter les risques liés à l’introduction de dépendances compromises ou malveillantes.

=== Gestion des dépendances

Les dépendances sont gérées via PNPM, avec une configuration renforcée#footnote[https://pnpm.io/supply-chain-security] visant à limiter les risques :

```yaml
blockExoticSubdeps: true
minimumReleaseAge: 1440 # 1 day
trustPolicy: no-downgrade
```

Ces paramètres permettent :

- de bloquer les dépendances utilisant des sources non standards (ex : Git ou tarball)
- d’éviter l’utilisation de versions trop récentes, potentiellement compromises (voir la compromission de la bibliothèque `axios` le 31 mars 2026)
- de bloquer l'installation de versions de dépendances au standards de confiance plus faibles que celles déjà installées (signature de publication manquante, etc)

Les versions des dépendances sont figées via un fichier de verrouillage (lockfile), garantissant la reproductibilité des builds.

=== Mise à jour et surveillance des vulnérabilités

Les mises à jour des dépendances sont très régulièrement effectuées, avec une attention particulière portée aux correctifs de sécurité.

La fonctionnalité Dependabot#footnote[https://github.com/security/advanced-security] de la plateforme GitHub permet permet de créer automatiquement des pull requests pour les mises à jour de dépendances, ainsi que la création d'alertes en cas de vulnérabilités détectées dans les dépendances utilisées.

La mise en place de pipelines CI/CD complets permet de s'assurer de l'absence de régressions lors de ces mises à jour, et d'assurer une intégration rapide des correctifs de sécurité.

=== Analyse statique complémentaire

L'outil d'analyse statique CodeQL#footnote[https://codeql.github.com] de GitHub est entièrement intégré dans les pipelines CI/CD, permettant une analyse continue du code source à la recherche de vulnérabilités connues et de patterns de code potentiellement dangereux, en complément des contrôles de la chaîne d’approvisionnement.

== Distribution

La distribution de l'application aux utilisateurs finaux est faite sous forme d'image Docker, hébergée sur un registre public #footnote[https://artifacthub.io/packages/container/oktomusic/oktomusic] (GitHub Container Registry).

Chaque image est construite exclusivement via les pipelines CI/CD à partir d'un Dockerfile versionné, garantissant reproductibilité, traçabilité et intégrité de chaque build.

Les images sont signées avec Cosign #footnote[https://sigstore.dev], un outil open-source de signature et de vérification des artefacts container, assurant leur provenance et la détection de toute modification non autorisée.

La base d'exécution de l'image est une version DHI (Docker Hardened Image)#footnote[https://www.docker.com/products/hardened-images] de NodeJS 24#footnote[https://hub.docker.com/hardened-images/catalog/dhi/node], offrant une configuration durcie et une surface d'attaque réduite par rapport à une image NodeJS standard.

Toutes les dépendances externes critiques (comme le code source FFmpeg) font l’objet d’une vérification cryptographique lors de la construction (voir section #link(<ffmpeg>)[FFmpeg]).

// TODO: fix link to FFmpeg section

= Plan de tests et jeu d'essai

= Veille sécurité

= Annexes
