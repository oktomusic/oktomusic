#set page(paper: "a4", numbering: "1/1")
#set document(title: "Rapport de projet Oktomusic", author: "Louis WALTER")

#set heading(numbering: "1.")

#title()

= Compétences mises en oeuvre

= Cahier des charges

= Présentation de l'entreprise/service

(à supprimer ?)

= Gestion de projet

= Spécifications fonctionnelles

#image("../common/interface.excalidraw.svg")

= Architecture logicielle

#image(
  "../common/architecture.excalidraw.svg",
  alt: "Schéma d'architecture",
  fit: "contain",
  format: "svg",
  height: auto,
)

== Générale

=== Language de programmation

TypeScript #footnote[https://www.typescriptlang.org] a été choisi comme language de programmation principal pour le développement de l'application, pour ses nombreux avantages :

- *Typage statique* : Les types statiques de TypeScript permettent de détecter beaucoup d'erreurs à la compilation, améliorant ainsi la robustesse et la maintenabilité du code.
- *ESLint* : TypeScript se combine parfaitement avec des outils de linting comme ESLint, permettant d'améliorer encore la robustesse du code.
- *Partage de code* : TypeScript permet de partager facilement du code et des types entre le backend et le frontend, notamment via des packages communs.
- *Ecosystème* : TypeScript bénéficie d'un écosystème riche de bibliothèques backend et frontend, et un support excellent dans les éditeurs de code, facilitant le développement.

== Backend

Le backend de l'application s'est architecturé autour du framework NestJS #footnote[https://nestjs.com], qui offre une structure standardisée et modulaire au dessus d'Espress.js, avec un très bon support natif de TypeScript.

=== Base de données PostgreSQL + Prisma ORM

Pour la base de donnée principale, qui stocke les données de l'application (utilisateurs, albums, playlists, etc), le choix a été fait d'utiliser PostgreSQL #footnote[https://www.postgresql.org] pour sa robustesse et ses performances.

L'intégration avec la base de données est assurée par Prisma ORM #footnote[https://www.prisma.io], qui offre une définition de schéma de données simple et un générateur de client TypeScript très puissant.

Le support de JSON dans PostgreSQL et la souplesse de Prisma permettent de stocker des données complexes (ex : les paroles de chansons) de manière efficace, tout en bénéficiant d'un typage TypeScript des données.

=== Valkey

Pour la persistance des sessions utilisateur et les queues BullMQ, le choix a été fait d'utiliser Valkey #footnote[https://valkey.io], une base de données clé-valeur distribuée et performante.

Valkey est un fork de Redis 7 sous license BSD 3-clause, maintenu par la Linux Foundation après son changement de license vers une license source-availlable (avant le rajout de la license AGPL).

J'ai privilégié l'utilisation de Valkey dont la license BSD 3-clause est plus permissive que la nouvelle license AGPL.

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

== MCD

== MLD

== MPD

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
L'automatisation de ces taches répétitives a permis de réduire le risque d'oublis ou d'erreurs humaines, pouvant causer des erreur CI/CD.

Les Agents et LLMs utilisés proviennent principalement de la plateforme GitHub Copilot #footnote[https://github.com/features/copilot].
Les modèles utilisés incluent les modèles _GPT-5_ de OpenAI, _Claude Sonet_ et _Claude Opus_ de Anthropic et _Grok Code Fast 1_ de xAI.

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

Pour l'instance de pré-production (reverse proxy Traefik), les résultats obtenus sont les suivants :

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

Elles sont construites à partir de bases officielles et versionnées, et toutes les dépendances externes critiques (comme le code source FFmpeg) font l’objet d’une vérification cryptographique lors de la construction (voir section #link(<ffmpeg>)[FFmpeg]).

// TODO: fix link to FFmpeg section

= Plan de tests et jeu d'essai

= Veille sécurité

= Annexes
