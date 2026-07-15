#set document(title: "Rapport de projet Oktomusic", author: "Louis WALTER")

#set heading(numbering: "1.")

#set text(lang: "fr")

#import "@preview/ilm:2.1.1": *

#set text(font: "Inter")

#show: ilm.with(
  title: [Oktomusic],
  authors: "Louis WALTER",
  external-link-circle: false,
  abstract: [
    #block(
      width: 110%,
    )[
      #set align(left)

      Conception et développement d'une plateforme de streaming musical
      auto-hébergée, moderne et sécurisée.

      *Concepteur Développeur d'Applications (#link("https://www.francecompetences.fr/recherche/rncp/37873", "RNCP37873"))*
    ]
  ],
  figure-index: (enabled: true),
  table-index: (enabled: true),
  listing-index: (enabled: true),
  chapter-pagebreak: false,
  // https://typst.app/docs/reference/foundations/datetime#format
  // (missing localization support for French month names)
  date-format: "15 Juillet 2026",
)

= Compétences mises en œuvre

Le projet Oktomusic a été construit pour couvrir les trois activités types du titre professionnel *Concepteur Développeur d'Applications*.
Le tableau ci-dessous reprend les compétences du référentiel et indique leur mise en œuvre concrète dans le projet.

== Développer une application sécurisée

#[

  #show table: set text(size: 7pt, hyphenate: false)
  #show table: set par(justify: false)

  #table(
    columns: (1.55fr, 2.2fr, 1.7fr),
    align: horizon,
    table.header([*Compétence CDA*], [*Mise en œuvre *], [*Éléments du dossier*]),
    [Installer et configurer son environnement de travail en fonction du projet],
    [Mise en place d'un monorepo PNPM, des applications frontend/backend, des packages partagés, des scripts de développement, des workflows GitHub Actions et de l'environnement Docker de l'application.],
    [Gestion de projet, Organisation du code, Distribution],
    [Développer des interfaces utilisateur],
    [Développement d'une interface web React/Vite : navigation par albums, artistes et pistes, lecteur persistant, file d'attente, affichage des paroles, adaptation visuelle aux couleurs des albums et mini-lecteur Picture-in-Picture.],
    [Spécifications fonctionnelles, Réalisations, Interface et expérience web],
    [Développer des composants métier],
    [Implémentation des traitements métier liés à l'indexation musicale, à la validation des métadonnées FLAC, au parsing des paroles synchronisées, à la génération de playlists et à l'extraction de couleurs dominantes.],
    [Réalisations, Backend, Briques spécialisées],
    [Contribuer à la gestion d'un projet informatique],
    [Cadrage du besoin, formalisation des personas, epics et user stories, suivi Kanban dans GitHub Projects, découpage par domaines fonctionnels, documentation maintenue avec le code et contributions upstream.],
    [Cahier des charges, Gestion de projet],
  )

  == Concevoir et développer une application sécurisée organisée en couches

  #table(
    columns: (1.55fr, 2.2fr, 1.7fr),
    align: horizon,
    table.header([*Compétence CDA*], [*Mise en œuvre dans Oktomusic*], [*Éléments du dossier*]),
    [Analyser les besoins et maquetter une application],
    [Analyse des limites de Jellyfin et Navidrome, définition des personas, epics et user stories, cadrage du périmètre MVP, hors périmètre initial et zoning de l'interface.],
    [Cahier des charges, Spécifications fonctionnelles],
    [Définir l'architecture logicielle d'une application],
    [Conception d'une architecture en couches avec frontend React/Vite, backend NestJS, API GraphQL/REST, PostgreSQL, Valkey, fournisseur OpenID Connect.],
    [Architecture logicielle, Schéma d'architecture],
    [Concevoir et mettre en place une base de données relationnelle],
    [Modélisation du catalogue musical et des données utilisateur avec MCD, MLD et MPD Prisma ; utilisation de PostgreSQL pour les albums, pistes, artistes, playlists, historiques et paroles en jsonb.],
    [Modélisation de la base de données],
    [Développer des composants d'accès aux données SQL et NoSQL],
    [Accès aux données PostgreSQL via Prisma dans les services backend, stockage relationnel principal, utilisation de Valkey pour les sessions et les files de traitement BullMQ.],
    [Backend, Organisation du code, Réalisations],
  )

  == Préparer le déploiement d'une application sécurisée

  #table(
    columns: (1.55fr, 2.2fr, 1.7fr),
    align: horizon,
    table.header([*Compétence CDA*], [*Mise en œuvre dans Oktomusic*], [*Éléments du dossier*]),
    [Préparer et exécuter les plans de tests d'une application],
    [Mise en place de tests unitaires Vitest sur les packages et applications, validation continue via GitHub Actions et utilisation de jeux de fixtures pour les formats manipulés par l'application.],
    [Plan de tests et jeu d'essai, Organisation et suivi],
    [Préparer et documenter le déploiement d'une application],
    [Préparation d'une distribution Docker, documentation d'installation, configuration par variables d'environnement et schéma de déploiement avec PostgreSQL, Valkey, reverse proxy et fournisseur OpenID Connect.],
    [Distribution, Documentation, Architecture logicielle],
    [Contribuer à la mise en production dans une démarche DevOps],
    [Automatisation des contrôles qualité, construction d'images Docker multi-plateformes, publication sur registre container, signature des images et suivi des vulnérabilités de dépendances.],
    [Gestion de projet, Supply chain, Distribution],
  )
]

= Cahier des charges

*Oktomusic* vise à proposer une solution de streaming musical conçue pour l'auto-hébergement, et répond à un besoin concret, basé sur l'analyse des solutions existantes et des besoins des utilisateurs.

== Comparaison avec les solutions existantes

La volonté de proposer une solution de ce type est née de l'expérience de l'auteur avec les solutions existantes, notamment Jellyfin et Navidrome.

Les limites de ces solutions ont été identifiées et analysées, afin de définir clairement les besoins et les objectifs du projet Oktomusic et d'apporter une réelle amélioration.

=== Jellyfin

*Jellyfin*#footnote("https://jellyfin.org") est une solution très complète pour l'auto-hébergement de médias, capable de gérer plusieurs types de contenus : films, séries, musique, images, utilisateurs et bibliothèques partagées.

Cette approche généraliste rend l'expérience musicale moins spécialisée.

De plus, l'interface utilisateur est centrée principalement sur les médias vidéo, ce qui se traduit par une ergonomie et des fonctionnalités moins adaptées à la lecture musicale.

- Un support limité des métadonnées audio, avec des difficultés pour gérer les crédits multiples pour les pistes et les albums.
- Manque de fonctionnalités de lecture musicale moderne, dans le système de lecture, la gestion des playlists, ainsi que la navigation. Pas de support des paroles synchronisées mot-à-mot.
- Manque de fonctionnalités modernes sur le client web
  - Pas de PWA réelle
  - Pas de mode Picture-in-Picture
- Aucun support d'OpenID Connect en standard, ce qui complique l'intégration dans une infrastructure d'identité déjà existante et l'administration des utilisateurs

=== Navidrome

*Navidrome*#footnote("https://www.navidrome.org") est plus proche du besoin, car il est conçu spécifiquement pour le streaming musical.

Il propose une solution légère et efficace pour exploiter une bibliothèque audio, incluant un support des clients OpenSubsonic.

- Pas de support des paroles synchronisées mot-à-mot.
- Manque de fonctionnalités modernes sur le client web
  - Interface MUI avec design peu ergonomique
  - Pas d'expérience PWA réelle
  - Pas de mode Picture-in-Picture
- Comme Jellyfin, aucun support d'OpenID Connect en standard

Cependant, son interface et son modèle fonctionnel ne couvrent pas entièrement l'expérience recherchée pour Oktomusic : application web moderne, file d'attente riche, paroles synchronisées, gestion avancée des playlists et intégration navigateur via PWA, Media Session ou Picture-in-Picture.
Comme Jellyfin, il ne répond pas directement au besoin d'authentification déléguée par OpenID Connect.

== Objectifs du projet

Oktomusic se positionne avec une approche ciblé :

- Exploitation d'une bibliothèque exclusivement musicale
- Indexation basée sur des règles strictes de formats de métadonnées, basées sur les recommandations Vorbis#footnote("https://xiph.org/vorbis/doc/v-comment.html") ainsi que MusicBrainz Picard#footnote("https://picard-docs.musicbrainz.org/en/latest/variables/tags_basic.html")
- Expérience Web moderne sous forme de Progressive Web App (PWA) avec l'utilisation de fonctionnalités avancées des navigateurs (Media Session, Audio Session, Picture-in-Picture, OpenSearch, etc)
- Conception de l'interface centrée sur l'expérience des applications de streaming modernes (paroles synchronisées, recherche, file d'attente, etc.)
- Délégation complète de l'authentification à un fournisseur OpenID Connect au choix de l'opérateur du serveur, pour une meilleure sécurité et une administration simplifiée des utilisateurs
- Distribution sous forme d'image Docker, moderne et sécurisée
- Facilitation de l'interopérabilité via l'export de playlists, les métadonnées standardisées, etc.

== Personas, epics et user stories

Les utilisateurs cibles ont été formalisés sous forme de *personas*, regroupés en *epics* et en *user stories*.

=== Personas

==== Persona 1 : administrateur / opérateur auto-hébergé

Ce persona représente l'utilisateur technique qui déploie et maintient Oktomusic sur son infrastructure personnelle ou familiale.
Il est à l'aise avec Docker, les variables d'environnement et les services auto-hébergés.
Son objectif principal est de disposer d'un service stable, documenté et simple à intégrer à son infrastructure existante.

- Besoins principaux : déploiement Docker, configuration PostgreSQL / Valkey, connexion à un fournisseur OpenID Connect, indexation de la bibliothèque musicale.
- Critères de satisfaction : installation reproductible, configuration explicite, logs exploitables, absence de gestion locale des mots de passe.

==== Persona 2 : auditeur quotidien

Ce persona représente l'utilisateur final qui utilise Oktomusic pour écouter sa musique depuis un navigateur.
Il attend une expérience fluide, proche des applications de streaming modernes, sans avoir à comprendre l'infrastructure technique.

- Besoins principaux : recherche rapide, navigation par albums et artistes, lecteur persistant, file d'attente, paroles synchronisées, gestion de playlists.
- Critères de satisfaction : interface agréable, lecture fiable, accès simple à la bibliothèque, continuité de l'écoute pendant la navigation.

==== Persona 3 : collectionneur musical

Ce persona représente l'utilisateur qui accorde une importance particulière à la qualité de sa bibliothèque musicale : fichiers FLAC, métadonnées propres, crédits artistes, pochettes et organisation des albums.
Il peut être aussi l'administrateur du serveur, mais son besoin est centré sur la fidélité du catalogue.

- Besoins principaux : indexation fiable, prise en charge des métadonnées audio, association correcte des artistes, albums et pistes, export des playlists.
- Critères de satisfaction : catalogue cohérent, métadonnées bien interprétées, respect des crédits multiples, interopérabilité avec d'autres outils.

=== Epics fonctionnelles

Les epics regroupent les besoins utilisateurs en grands ensembles fonctionnels, utilisés pour organiser le périmètre du MVP.

#table(
  columns: (auto, auto, 1fr),
  align: horizon,
  table.header([*Epic*], [*Persona principal*], [*Objectif*]),
  [EPIC-01],
  [Administrateur],
  [Déployer et configurer Oktomusic dans une infrastructure auto-hébergée],
  [EPIC-02],
  [Administrateur / utilisateur],
  [Déléguer l'authentification à un fournisseur OpenID Connect],
  [EPIC-03],
  [Administrateur / collectionneur],
  [Indexer une bibliothèque musicale FLAC et construire un catalogue fiable],
  [EPIC-04],
  [Utilisateur],
  [Parcourir et rechercher albums, artistes et pistes],
  [EPIC-05],
  [Utilisateur],
  [Écouter la musique avec un lecteur web moderne et une file d'attente],
  [EPIC-06],
  [Utilisateur / collectionneur],
  [Créer, modifier et exporter des playlists],
  [EPIC-07],
  [Utilisateur],
  [Enrichir l'expérience d'écoute avec les paroles synchronisées et les couleurs d'album],
)

=== User stories représentatives

#table(
  columns: (auto, auto, 1fr),
  align: horizon,
  table.header([*ID*], [*Epic*], [*User story*]),
  [US-01],
  [EPIC-01],
  [En tant qu'administrateur, je veux déployer l'application avec Docker Compose afin de disposer rapidement d'un environnement reproductible.],
  [US-02],
  [EPIC-02],
  [En tant qu'administrateur, je veux connecter Oktomusic à mon fournisseur OpenID Connect afin de centraliser la gestion des comptes et des accès.],
  [US-03],
  [EPIC-03],
  [En tant qu'administrateur, je veux lancer l'indexation d'une bibliothèque FLAC afin de rendre les albums, artistes et pistes disponibles dans l'application.],
  [US-04],
  [EPIC-04],
  [En tant qu'utilisateur, je veux rechercher rapidement un album, un artiste ou une piste afin de lancer la lecture sans parcourir toute la bibliothèque.],
  [US-05],
  [EPIC-05],
  [En tant qu'utilisateur, je veux conserver un lecteur persistant pendant ma navigation afin de contrôler la musique à tout moment.],
  [US-06],
  [EPIC-06],
  [En tant qu'utilisateur, je veux créer et réordonner mes playlists afin d'organiser ma bibliothèque selon mes usages d'écoute.],
  [US-07],
  [EPIC-07],
  [En tant qu'utilisateur, je veux consulter les paroles synchronisées pendant l'écoute afin de suivre le morceau en cours.],
  [US-08],
  [EPIC-07],
  [En tant qu'utilisateur, je veux que l'interface s'adapte aux couleurs de l'album afin de bénéficier d'une expérience visuelle plus immersive.],
)

== Périmètre fonctionnel

Le périmètre retenu pour la version présentée couvre :

- le déploiement de l'application et de ses dépendances ;
- l'authentification par OpenID Connect ;
- l'indexation des fichiers FLAC et de leurs métadonnées ;
- l'affichage du catalogue musical ;
- la lecture audio en streaming ;
- la gestion des playlists et de la bibliothèque utilisateur ;
- l'affichage des paroles synchronisées lorsqu'elles sont disponibles.

== Hors périmètre initial

De nombreuses fonctionnalités ont été identifiées comme hors périmètre initial, mais pourraient être intégrées dans des versions futures.

=== Transcodage audio

L'application ne supportant en entrée que les fichiers au format sans-pertes FLAC, les utilisateurs souhaitant écouter de la musique sur des appareils ne disposant pas de débit internet suffisant ou de limites de données mobiles pourraient souhaiter le streaming de versions transcodées dans différents formats plus légers.

Ce besoin a été considéré au départ comme rentrant dans le périmètre initial, mais en a été écarté suite à des contraintes de temps de développement.

La conception prévoyait pour chaque fichier FLAC suite aux étapes d'indexation, la génération de différentes versions transcodées au format Opus#footnote[https://en.wikipedia.org/wiki/Opus_(audio_format)] avec différents débits binaires au moyen de FFmpeg pour permettre à l'utilisateur de choisir la qualité de streaming adaptée à sa connexion.

Une évolution plus complexe aurait été la mise en place d'un transcodage à la volée, effectué au moment du streaming, mais aurait demandé un effort de développement plus important, notamment pour la gestion des performances, de la charge serveur et de l'interfaçage avec FFmpeg.

=== Interface responsive et adaptée aux contrôles tactiles

La possibilité d'utiliser l'application sur des petits écrans et avec des contrôles tactiles a été envisagée dès le départ, mais écartée du périmètre initial pour se concentrer sur une utilisation essentiellement desktop.

Contrairement à une interface desktop, une interface responsive dotée de contrôles tactiles notamment par gestes nécessite une conception et un développement spécifiques, ne se limitant pas à une mise en page CSS.

Contrairement à un site web plus standard, la création de deux branches distinctes de l'interface aurait été nécessaire pour garantir une expérience de qualité telle que celle attendue par les utilisateurs d'applications de streaming.

=== Interface compatible avec une utilisation de type console de salon

Certaines applications de streaming classiques ayant une intégration ou des applications spécifiques pour téléviseurs ou consoles de salon, la possibilité d'adapter l'interface pour une utilisation dans le navigateur de ce type d'appareil a été étudiée.

La plus grosse difficulté réside dans la nécessité de supporter une navigation spatiale par focus, pour une utilisation avec une télécommande ou un gamepad (joystick ou D-pad).

Le modèle de focus classique des navigateurs est uni-directionnel, et ne permet pas à ce jour une navigation spatiale.
Il existe une spécification W3C `CSS Spatial Navigation Level 1`#footnote[https://www.w3.org/TR/css-nav-1] (working draft) pour doter les navigateurs de capacités de navigation spatiales, poussée par des ingénieurs de LG.

Les polyfills disponibles pour cette spécification, ainsi que les bibliothèques de navigation spatiale open-source pour React#footnote[https://devportal.noriginmedia.com/docs/Norigin-Spatial-Navigation] n'étant pas assez matures ou nécessitant des modifications trop lourdes au code de l'application, cette fonctionnalité a été écartée du périmètre initial.

La lecture de l'article de Spotify Engineering#footnote[https://engineering.atspotify.com/2023/5/tv-spatial-navigation] sur le sujet de la navigation spatiale sur les téléviseurs a été une source d'inspiration dans ces recherches.

=== Recommandations musicales avancées

Une des fonctionnalités importantes des applications de streaming musical modernes est la possibilité de proposer des playlists automatiques et la lecture infinie basées sur la similarité musicale et les habitudes d'écoute de l'utilisateur.

Une solution de ce type ne peut pas se baser uniquement sur le support des métadonnées de genres musicaux, mais nécessite l'exploitation d'analyses acoustiques par IA.

Mes recherches sur les technologies open-source permettant de réaliser ce type d'analyse acoustique ont révélé le projet AudioMuse AI#footnote[https://github.com/NeptuneHub/AudioMuse-AI] qui est une solution intégrée dans Jellyfin, Navidrome et d'autres applications de streaming musical.
La création d'un plugin spécifique ou l'intégration de cette solution dans Oktomusic serait envisageable.

=== Support d'un mode hors-ligne complet

La plupart des applications de streaming musical modernes proposent un mode hors-ligne complet, permettant à l'utilisateur de télécharger des albums ou playlists pour les écouter sans connexion internet, ainsi que la mise en cache automatique de contenu sur la base du comportement de l'utilisateur.

Dans le cas de l'application Oktomusic, le support d'un mode hors-ligne nécessite la mise en place de plusieurs mécanismes complexes.
Certaines d'entre elles sont déjà implémentées.

L'utilisation d'un Service Worker dans le cadre d'une PWA (Progressive Web App) permet de mettre en cache les fichiers statiques de l'application.
Une logique de mise en cache spécifique a été mise en place pour les fichiers audio, pour permettre un démarrage plus rapide de la lecture des fichiers écoutés récemment.

Le mécanisme principal nécessite une logique de détection du mode hors-ligne, couplée à une mise en cache des données GraphQL associées aux albums, playlists et à la bibliothèque utilisateur.

Malheureusement, la bibliothèque officielle permettant d'appliquer une logique de persistance de la mise en cache pour Apollo Client#footnote[https://github.com/apollographql/apollo-cache-persist] est non maintenue et ne supporte pas la dernière version stable, ce qui implique le fait de développer une solution spécifique pour l'application.

Par ailleurs, le fait de "télécharger" les fichiers audio pour assurer leur disponibilité indépendamment du dernier accès nécessite de mettre en place un mécanisme donnant au cache une durée de vie infinie, soit en adaptant la politique de cache, soit en téléchargeant les fichiers audio dans le système de fichiers du navigateur (Origin Private File System#footnote[https://developer.mozilla.org/en-US/docs/Web/API/File_System_API/Origin_private_file_system]) et en interceptant les requêtes réseau dans le Service Worker pour servir les fichiers depuis celui-ci.

== Contraintes principales retenues

- Une unique interface web, exploitant les capacités PWA ainsi que les API web modernes.
- Un déploiement facile pour l'utilisateur, via une image Docker multi-plateforme moderne
- Utilisation d'une base de données relationnelle PostgreSQL pour les données persistantes
- Sessions et traitements asynchrones persistés via une base de données Valkey
- Authentification déléguée intégralement à un provider OpenID Connect au choix de l'utilisateur
- Publication du code source licence AGPL-3.0
- Une documentation intégrale pour installer, configurer et présenter l'application

= Gestion de projet

== Organisation et suivi

Le besoin ayant été cadré à partir d'un besoin spécifique et réaliste, le développement a suivi une approche itérative orientée vers la réalisation d'un MVP (Minimum Viable Product) fonctionnel, avec un découpage par domaines fonctionnels.

La documentation utilisateur a été maintenue en parallèle du développement, pour garantir sa cohérence avec l'application.

La plateforme GitHub a été sélectionnée, en raison de sa polyvalence, pour l'hébergement du code source, la réalisation des pipelines de CI/CD, la gestion de projet ainsi que la distribution.
La documentation utilisateur, rédigée en Markdown, est publiée au travers du générateur VitePress sur un site Cloudflare Pages.

GitHub a servi d'espace central de gestion du projet : code source, documentation, suivi des tâches, intégration continue et distribution des artefacts.
Le choix d'un monorepo a permis de conserver une source unique pour l'ensemble du projet, sans séparer artificiellement le backend, le frontend, les packages communs, la documentation et les fichiers de déploiement.

Le choix a été fait d'héberger l'ensemble du code source dans un monorepo, pour faciliter la mutualisation des fichiers de configuration ainsi que la recherche d'informations dans le code source, notamment pour les agents LLMs utilisés pour assister le développement.

L'organisation technique du dépôt est présentée de manière plus détaillée dans la section #link(<code_organization>)[Organisation du code].

Le suivi du travail a été organisé sous formes d'issues GitHub associé à un projet GitHub Projects#footnote[https://github.com/orgs/oktomusic/projects/1], qui fournissait une manière efficace de suivre les tâches à réaliser.
Les tâches ont été regroupées par domaines et priorités.

Même si des cycles de développement agiles n'ont pas été utilisés, cette organisation a permis de suivre l'avancement du MVP, de prioriser les éléments indispensables à la réalisation du MVP et de conserver une trace des choix réalisés au fil du développement.

#figure(image(
  "../common/github_project.png",
  alt: "Tableau Kanban GitHub Projects du projet Oktomusic",
  fit: "contain",
  width: 100%,
), caption: [Suivi du projet dans GitHub Projects (Kanban)])

L'utilisation des pull requests ainsi que des workflows GitHub Actions a complété ce suivi en permettant de garder un rythme de développement souple tout en s'assurant que les évolutions importantes puissent être validées par des contrôles automatisés avant intégration au projet.

Certains contributeurs externes ont été impliqués dans l'implémentation de différentes fonctionnalités du projet, ce qui a nécessité de la collaboration, des échanges et de la revue de code.

- Support configurable du blocage de la mise en veille de l'écran#footnote[https://developer.mozilla.org/en-US/docs/Web/API/WakeLock] pendant la lecture#footnote[https://github.com/oktomusic/oktomusic/pull/165]
- Customisation du nom d'affichage de l'application#footnote[https://github.com/oktomusic/oktomusic/pull/291]
- Sélecteur de langue de l'interface#footnote[https://github.com/oktomusic/oktomusic/pull/313]

== Collaboration et contributions upstream <collaboration>

Dans le cadre du projet, plusieurs rapports de bugs et demandes d’amélioration ont été effectués auprès des projets dépendants.

Cela a impliqué l’identification des causes, la rédaction de rapports reproductibles et le suivi des échanges.

- *docker/github-builder* (rapport de bug)#footnote[https://github.com/docker/github-builder/issues/194]: blocage des builds lié à une mauvaise récupération des références Git lors de la construction de l’image Docker
- *vite-plugin-sri-gen* (feature)#footnote[https://github.com/rbonestell/vite-plugin-sri-gen/issues/23]: injection des hachages SRI dans le manifest de build Vite, permettant d’abandonner le plugin custom de génération de SRI initialement écrit pour le projet
- *node-vibrant* (rapport de bug)#footnote[https://github.com/Vibrant-Colors/node-vibrant/issues/186]: correction de problèmes de typage TypeScript dans la bibliothèque d'extraction de couleurs dominantes
- *lingui* (rapport de bug)#footnote[https://github.com/lingui/js-lingui/issues/2584]: macro de traduction non fonctionnelle dans certains cas

= Spécifications fonctionnelles

Les spécifications fonctionnelles d'Oktomusic traduisent les besoins décrits dans le cahier des charges en parcours utilisateurs et en écrans principaux.
Elles ont servi à délimiter le périmètre du MVP, à prioriser les fonctionnalités indispensables et à guider la conception de l'interface web.

L'interface a été conçue en s'inspirant des usages établis par les principales plateformes de streaming musical, notamment Spotify, mais aussi Deezer, Apple Music ou YouTube Music.

L'objectif n'était pas de reproduire leur identité visuelle, mais de reprendre des conventions ergonomiques familières pour les utilisateurs : navigation latérale, pages album et artiste, lecteur persistant, file d'attente, recherche rapide, playlists et affichage des paroles.

Le travail de maquettage a été réalisé dans Figma.
Je n'ai donc pas produit de wireframes séparés : Figma a été utilisé comme support principal pour formaliser la structure des écrans, leur hiérarchie visuelle et les parcours de navigation.

== Zoning de l'interface

Le zoning définit la répartition générale de l'application sur un écran desktop.
L'interface est organisée autour de quatre zones stables :

- une navigation latérale pour accéder rapidement à la bibliothèque, à la recherche, aux playlists et aux vues d'administration ;
- une zone de contenu principale pour afficher albums, artistes, pistes, résultats de recherche ou détails d'une playlist ;
- une file d'attente latérale permettant de consulter et modifier les prochains titres ;
- un lecteur persistant en bas de l'écran, toujours accessible pendant la navigation.

#figure(image("../common/interface.excalidraw.svg"), caption: [Schéma de zoning])

== Maquettes Figma

Toutes les vues n'ont pas été maquettées, mais la structure générale ainsi que le thème visuel de l'application ont été formalisées dans un fichier Figma.#footnote[https://www.figma.com/design/bkhuLo4RZVG6qd5Au4siZg/Oktomusic]

#figure(image("../common/screenshots/figma_album.png"), caption: "Maquette d'album")

#figure(image("../common/screenshots/figma_search.png"), caption: "Maquette de recherche par album")

== Parcours utilisateurs principaux

Les parcours fonctionnels ont été définis à partir des personas et des user stories.
Ils couvrent les actions indispensables pour une première version utilisable du service.

#[
  #show table: set text(size: 7pt, hyphenate: false)
  #show table: set par(justify: false)

  #table(
    columns: (auto, 1.25fr, 2fr, 1.8fr),
    align: horizon,
    table.header([*ID*], [*Parcours*], [*Description fonctionnelle*], [*Écrans concernés*]),
    [PF-01],
    [Se connecter],
    [L'utilisateur accède à l'application, est redirigé vers le fournisseur OpenID Connect, puis revient dans Oktomusic avec une session applicative ouverte.],
    [Accueil, fournisseur OIDC, retour application],
    [PF-02],
    [Parcourir le catalogue],
    [L'utilisateur consulte les albums, artistes et pistes issus de l'indexation de la bibliothèque musicale.],
    [Bibliothèque, liste albums, page album, page artiste],
    [PF-03],
    [Rechercher un contenu],
    [L'utilisateur saisit une recherche et obtient des résultats regroupant albums, artistes et titres.],
    [Recherche, résultats, pages de détail],
    [PF-04],
    [Lancer la lecture],
    [L'utilisateur lance un titre, un album ou une playlist ; le lecteur persistant affiche le titre en cours et permet le contrôle de la lecture.],
    [Page album, playlist, lecteur persistant],
    [PF-05],
    [Gérer la file d'attente],
    [L'utilisateur consulte les prochains titres, ajoute des pistes et modifie l'ordre de lecture.],
    [Lecteur, file d'attente, listes de pistes],
    [PF-06],
    [Gérer les playlists],
    [L'utilisateur crée une playlist, y ajoute des titres, les réordonne, les supprime et peut exporter la playlist.],
    [Bibliothèque utilisateur, playlist, modale d'ajout, export],
    [PF-07],
    [Consulter les paroles],
    [Lorsque les paroles synchronisées sont disponibles, l'utilisateur les suit pendant l'écoute du titre.],
    [Lecteur, écran paroles],
    [PF-08],
    [Indexer la bibliothèque],
    [L'administrateur déclenche l'indexation, suit son avancement et consulte les avertissements ou erreurs éventuels.],
    [Espace administrateur, statut du job, rapport d'indexation],
  )
]

== Diagramme de séquence : indexation de la bibliothèque

Le parcours d'indexation est le cas d'utilisation technique le plus représentatif du projet.
Il relie l'interface d'administration, l'API GraphQL, la file BullMQ, le worker d'indexation, les outils d'analyse des fichiers audio et la base de données.

#figure(image("../common/sequence_indexation.png"), caption: [Diagramme de séquence du processus d'indexation])

== Règles fonctionnelles retenues

- L'application doit rester utilisable depuis un navigateur moderne, avec une approche web uniquement.
- Le lecteur doit rester disponible pendant la navigation, afin de ne pas interrompre l'écoute lorsque l'utilisateur change d'écran.
- Les actions liées à la lecture doivent être accessibles depuis les vues les plus fréquentes : album, artiste, playlist, recherche et file d'attente.
- Les playlists doivent conserver l'ordre choisi par l'utilisateur (réorganisation possible des pistes).
- L'affichage des artistes doit respecter les crédits multiples et leur ordre lorsque les métadonnées le permettent.
- Les paroles synchronisées sont affichées uniquement lorsqu'elles existent dans les fichiers indexés.
- Les fonctionnalités d'administration, notamment l'indexation de la bibliothèque, sont réservées aux utilisateurs disposant du rôle adéquat.
- Les erreurs d'indexation ne doivent pas bloquer toute la bibliothèque : elles doivent être remontées de manière exploitable pour l'administrateur.

== Hors périmètre fonctionnel de l'interface

Certaines fonctionnalités visibles dans les applications de streaming modernes ont été volontairement écartées du MVP.
Elles sont détaillées dans la section "Hors périmètre initial" du cahier des charges.

Les principales limites côté interface sont l'absence de version mobile dédiée et l'absence de recommandations musicales avancées.

= Architecture logicielle

#figure(image(
  "../common/architecture.excalidraw.svg",
  alt: "Schéma d'architecture",
  fit: "contain",
  format: "svg",
  height: auto,
), caption: [Schéma d'architecture])

== Générale

L’architecture générale suit une séparation en couches afin d’isoler les responsabilités et de faciliter la maintenance.

La couche frontend fournit l’interface utilisateur, gère l’état de lecture et communique avec le backend via GraphQL pour les données applicatives et via REST pour les flux de fichiers.

La couche backend expose les API, applique les règles métier, contrôle l’accès aux ressources et orchestre les traitements longs comme l’indexation.

La couche persistance repose sur PostgreSQL pour les données structurées et Valkey pour les sessions et les files de traitement asynchrone.

Cette organisation permet de distinguer clairement les préoccupations : présentation, logique métier, accès aux données, tâches asynchrones et déploiement.

Elle facilite également la couverture des compétences CDA liées à l’architecture multicouche, à la base relationnelle, aux composants métier, aux accès aux données et à la préparation du déploiement.

=== Langage de programmation

TypeScript #footnote[https://www.typescriptlang.org] a été choisi comme langage de programmation principal pour le développement de l'application, pour ses nombreux avantages :

- *Typage statique* : Les types statiques de TypeScript permettent de détecter beaucoup d'erreurs à la compilation, améliorant ainsi la robustesse et la maintenabilité du code.
- *ESLint* : TypeScript se combine parfaitement avec des outils de linting comme ESLint, permettant d'améliorer encore la robustesse du code.
- *Partage de code* : TypeScript permet de partager facilement du code et des types entre le backend et le frontend, notamment via des packages communs.
- *Écosystème* : TypeScript bénéficie d'un écosystème riche de bibliothèques backend et frontend, et d'un excellent support dans les éditeurs de code, facilitant le développement.

== Backend

Le backend de l'application s'est architecturé autour du framework NestJS #footnote[https://nestjs.com], qui offre une structure standardisée et modulaire au-dessus d'Express.js, avec un très bon support natif de TypeScript.

=== Base de données PostgreSQL + Prisma ORM

Pour la base de données principale, qui stocke les données de l'application (utilisateurs, albums, playlists, etc), le choix a été fait d'utiliser PostgreSQL #footnote[https://www.postgresql.org] pour sa robustesse et ses performances.

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

Cette approche présente plusieurs avantages applicatifs, notamment en laissant l'opérateur du serveur gérer lui-même les aspects liés à la gestion des utilisateurs.
Pas besoin de gérer en interne la gestion des comptes, politiques de mot de passe, réinitialisation, emails, 2FA, etc.

De plus, elle permet de bénéficier d'une sécurité renforcée (voir section #link(<security_oidc>)[Sécurité, OpenID Connect])

== Frontend

Le frontend de l'application, propulsé par le framework Vite#footnote[https://vite.dev], a été développé avec la bibliothèque React.#footnote[https://react.dev]

Vite avec sa toolchain native a apporté un environnement de développement moderne et rapide adapté aux applications web modernes.

React a permis de construire l’interface sous forme de composants réutilisables.

La gestion d'état global de l'application est assurée par la bibliothèque Jotai#footnote[https://jotai.org], qui fonctionne de manière simple et puissante tout en reprenant les patterns usuellement utilisés par React.

La récupération ainsi que la mise en cache des données applicatives est assurée par Apollo Client#footnote[https://www.apollographql.com], qui fournit un client GraphQL complet et performant.

La traduction de l'interface est effectuée à l'aide de la bibliothèque Lingui#footnote[https://lingui.dev], qui fournit une expérience moderne.

React Router#footnote[https://reactrouter.com] a été utilisé pour gérer la navigation dans l'application.

// https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Template_literals

L’état applicatif est structuré autour de plusieurs besoins : état du lecteur, file d’attente, session utilisateur et interactions avec l’API.

La gestion de l’état du lecteur est particulièrement importante car la lecture doit rester stable lorsque l’utilisateur change de page ou manipule une playlist.

#[
  #set text(hyphenate: false)
  L’application exploite de nombreuses capacités natives du navigateur : Progressive Web App, Service Worker, Web Audio API, Media Session API, Audio Session API, Wake Lock, OpenSearch, Picture-in-Picture, etc.
]

Ces choix permettent de rapprocher l’expérience utilisateur d’une application de streaming installable, tout en conservant une distribution web simple.

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

Lors de l'exécution de l'image Docker, les migrations Prisma sont automatiquement appliquées à la base de données PostgreSQL configurée.

```
app-1       | Running Prisma migrations...
app-1       | Loaded Prisma config from prisma.config.ts.
app-1       |
app-1       | Prisma schema loaded from prisma/schema.prisma.
app-1       | Datasource "db": PostgreSQL database "hexamusic", schema "public" at "postgres:5432"
app-1       |
app-1       | 11 migrations found in prisma/migrations
app-1       |
app-1       | Applying migration `20251026213543_basic_user_profile`
app-1       | Applying migration `20251230154153_primary_music_model`
app-1       | Applying migration `20251231184604_add_flac_file_entity`
app-1       | Applying migration `20260102184015_add_album_cover_hash`
app-1       | Applying migration `20260102185908_no_null_hash`
app-1       | Applying migration `20260126092400_add_track_lyrics`
app-1       | Applying migration `20260128131902_add_vibrant_colors`
app-1       | Applying migration `20260303195650_playlists`
app-1       | Applying migration `20260310210820_playlist_visibility_type`
app-1       | Applying migration `20260613143930_last_played_date`
app-1       | Applying migration `20260613170000_user_library`
app-1       |
app-1       | The following migration(s) have been applied:
app-1       |
app-1       | migrations/
app-1       |   └─ 20251026213543_basic_user_profile/
app-1       |     └─ migration.sql
app-1       |   └─ 20251230154153_primary_music_model/
app-1       |     └─ migration.sql
app-1       |   └─ 20251231184604_add_flac_file_entity/
app-1       |     └─ migration.sql
app-1       |   └─ 20260102184015_add_album_cover_hash/
app-1       |     └─ migration.sql
app-1       |   └─ 20260102185908_no_null_hash/
app-1       |     └─ migration.sql
app-1       |   └─ 20260126092400_add_track_lyrics/
app-1       |     └─ migration.sql
app-1       |   └─ 20260128131902_add_vibrant_colors/
app-1       |     └─ migration.sql
app-1       |   └─ 20260303195650_playlists/
app-1       |     └─ migration.sql
app-1       |   └─ 20260310210820_playlist_visibility_type/
app-1       |     └─ migration.sql
app-1       |   └─ 20260613143930_last_played_date/
app-1       |     └─ migration.sql
app-1       |   └─ 20260613170000_user_library/
app-1       |     └─ migration.sql
app-1       |
app-1       | All migrations have been successfully applied.
app-1       | Migrations completed successfully
app-1       | [Nest] 1  - 07/15/2026, 6:47:08 PM     LOG [NestFactory] Starting Nest application...
```

= Spécifications techniques

== Organisation du code <code_organization>

Le code source de l'application est organisé dans un monorepo PNPM #footnote[https://pnpm.io/workspaces] hébergé sur un dépôt GitHub, à l'exception de la version customisée de FFmpeg, gérée dans un dépôt séparé.

Différents packages sont définis pour les différentes parties de l'application (backend, frontend, packages communs, etc).

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
  Parsing et validation de métadonnées FLAC basés sur l'exécutable `metaflac`.
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

Un effort a été fait pour maximiser l'efficacité de ces outils, en fournissant un environnement de développement complet pour les agents autonomes, ainsi que des instructions système détaillées et spécialisées pour chaque partie de l'application.

Ces instructions couvrent des aspects tels que l'architecture du projet (organisation des fichiers), les conventions de code (TypeScript, CSS, nommage, etc.), les exigences de performances et d'accessibilité (CSP, respect des recommandations WCAG 2.2 AAA, etc.).

Des prompts réutilisables ont été créés pour automatiser des tâches courantes, comme la création de nouveaux packages partagés, impliquant des modifications dans plusieurs parties de la base de code (CI/CD, Docker, configuration ESLint et Vitest, etc).
L'automatisation de ces tâches répétitives a permis de réduire le risque d'oublis ou d'erreurs humaines, pouvant causer des erreurs CI/CD.

Les Agents et LLMs utilisés proviennent principalement de la plateforme GitHub Copilot #footnote[https://github.com/features/copilot], mais aussi de Codex#footnote[https://openai.com/codex].
Les modèles utilisés incluent les modèles _GPT-5_ de OpenAI, _Claude Sonnet_ et _Claude Opus_ de Anthropic et _Grok Code Fast 1_ de xAI.

== Conformité RGPD <rgpd>

L'application se veut faciliter la conformité au RGPD.#footnote[https://www.cnil.fr/fr/reglement-europeen-protection-donnees]

Oktomusic ne fournit pas directement un service hébergé : l’application est distribuée comme logiciel auto-hébergeable.
L’opérateur du serveur reste donc responsable du traitement des données personnelles dans son propre contexte d’exploitation.

Le projet limite les données personnelles nécessaires au fonctionnement. L’authentification étant déléguée à un fournisseur OpenID Connect, Oktomusic ne stocke pas de mot de passe utilisateur.

Les données conservées localement sont principalement l’identifiant OIDC de l’utilisateur, les rôles applicatifs, ainsi que les playlists, les éléments de bibliothèque et l’historique d’écoute qui peuvent être supprimés par l'utilisateur à tout moment.

Cette approche réduit la surface de traitement et facilite la conformité : minimisation des données, absence de mot de passe local, configuration explicite, possibilité pour l’opérateur de gérer les comptes depuis son fournisseur d’identité.

Une amélioration prévue consiste à ajouter des outils d’administration dédiés à l’export et à la suppression des données d’un utilisateur.

== Accessibilité <accessibility>

L’accessibilité a été prise en compte dès la conception de l’interface.
Le projet vise une interface utilisable au clavier, lisible, structurée et compatible avec les technologies d’assistance.

Les principaux choix appliqués sont : utilisation de tags HTML sémantiques, contrastes suffisants, états de focus visibles, labels explicites, absence de dépendance exclusive à la couleur et textes alternatifs pour les images porteuses d’information.

La conformité complète au RGAA#footnote[https://accessibilite.numerique.gouv.fr] nécessiterait un audit dédié.
À ce stade, les contrôles réalisés se concentrent essentiellement sur le suivi des bonnes pratiques WCAG#footnote[https://www.w3.org/TR/WCAG22], les vérifications Google Lighthouse#footnote[https://developer.chrome.com/docs/lighthouse/overview] ainsi que des tests manuels des parcours principaux au clavier.

L'utilisation de bibliothèques telles que BaseUI#footnote[https://base-ui.com], compatible WCAG 2.2, permet d'assurer l'accessibilité de nombreux composants interactifs de l'application.

// Lighthouse
// WCAG 2.2 AAA
// RGAA

== Sobriété technique et coût d'hébergement <eco_conception>

L'écoconception a été abordée dans le projet sous l'angle de la sobriété technique et du coût d'exploitation.
Dans le contexte d'une application auto-hébergée, l'objectif principal est de permettre à l'opérateur de faire fonctionner le service sur une machine modeste, sans devoir surdimensionner inutilement le serveur, le stockage ou la bande passante.

Cette démarche est également cohérente avec les attentes environnementales du référentiel, mais elle a surtout été traitée comme un enjeu concret pour l'utilisateur : réduire les ressources consommées permet de réduire le coût mensuel d'hébergement, de faciliter l'installation sur un serveur personnel et d'améliorer la durée de vie de l'infrastructure.

Les principaux choix allant dans ce sens sont :

- *Application web uniquement* : aucune application native séparée à maintenir, distribuer et mettre à jour. Le navigateur sert de client universel.
- *Images de couverture optimisées* : les pochettes sont converties en plusieurs tailles AVIF lors de l'indexation. L'interface charge ensuite une image adaptée à l'usage, ce qui limite la bande passante et le temps de rendu.
- *Cache navigateur et Service Worker* : les fichiers statiques de la PWA et certains flux audio peuvent être servis plus rapidement, avec moins de requêtes réseau répétées.
- *FFmpeg customisé* : l'image dédiée n'embarque que les codecs nécessaires au projet, ce qui réduit la taille finale de l'image Docker et accélère les téléchargements, les déploiements et les mises à jour.
- *Zéro ressource externe au runtime* : l'application ne dépend pas de CDN tiers pour son interface. Cela réduit les appels réseau, simplifie la sécurité HTTP et limite les points de défaillance.
- *Mutualisation dans un monorepo* : les packages partagés évitent la duplication de logique entre frontend, backend et documentation, ce qui réduit la maintenance et le risque de divergences.

Ces choix ne suppriment pas le coût de l'application, notamment parce que le streaming FLAC reste naturellement consommateur de bande passante.
Ils permettent cependant de concentrer les ressources serveur sur les usages réellement utiles : indexer la bibliothèque, servir les métadonnées, diffuser l'audio et maintenir l'expérience utilisateur fluide.

= Réalisations

== Interface utilisateur réalisée

#figure(image("../common/screenshots/interface_album.png"), caption: "Interface d'album")

#figure(image("../common/screenshots/interface_search.png"), caption: "Interface de recherche")

#figure(image("../common/screenshots/interface_queue_library.png"), caption: "Bibliothèque et file d'attente")

#figure(image("../common/screenshots/interface_lyrics.png"), caption: "Visualisation des paroles synchronisées")

#figure(image("../common/screenshots/interface_indexation.png"), caption: "Interface administrateur pour l'indexation")

=== Structure de l'interface et routage

Le cœur de l'interface respecte l'architecture du zoning défini dans la spécification fonctionnelle.

Après l'initialisation des providers indispensables (i18n, session utilisateur), le composant Router gère le cas où la session est authentifiée ou non, et redirige vers l'écran de login si nécessaire.

Lorsque l'utilisateur est authentifié, le composant App gère l'affichage de l'interface principale (header, contenu, panneau et lecteur) ainsi que l'initialisation des providers nécessaires à l'utilisation.

Des états globaux, exploités dans les composants, contrôlent la visibilité des différents panneaux.

Une deuxième logique de routage est appliquée dans le composant PanelCenter, qui gère les routes principales de l'application (accueil, recherche, album, artiste, playlist, utilisateur et paramètres).

Exemple de code simplifié :

```tsx
function Router() {
  const authSession = useAtomValue(authSessionAtom);

  return (
    <I18nProvider i18n={i18n}>
      <AuthSessionInitializer />
      <main id="app-shell">
        <BrowserRouter>
          <Routes>
            <Route path="/login" element={<Login />} />
            <Route
              path="*"
              Component={
                authSession.status === "authenticated" ? App : LoginRedirect
              }
            />
          </Routes>
        </BrowserRouter>
      </main>
    </I18nProvider>
  );
}

function App() {
  const leftExpanded = useAtomValue(panelLeftExpandedAtom);
  const rightVisible = useAtomValue(panelRightVisibleAtom);
  const overlayVisible = useAtomValue(panelOverlayVisibleAtom);
  return (
    <DragDropProvider>
      <PlayerProvider />
      {/*...*/}
      <HeaderMenu />
      {/*...*/}
      <div
        id="oktomusic:content-grid"
        data-left={leftExpanded ? "expanded" : "collapsed"}
        data-right={rightVisible ? "visible" : "hidden"}
      >
        <PanelLeft />
        <PanelCenter />
        {overlayVisible && <PanelOverlay />}
        <PanelToastProvider />
        <PanelRight />
      </div>
      <PlayerControls />
    </DragDropProvider>
  )
}

export function PanelCenter() {
  return (
    <OktoScrollArea id="oktomusic:panel-center" className="rounded bg-zinc-900">
      <Routes>
        <Route element={<ProtectedRoutes />}>
          <Route index element={<Home />} />
          <Route path="/search" element={<Search />} />
          <Route path="/album/:cuid" element={<Album />} />
          <Route path="/playlist/:cuid" element={<Playlist />} />
          <Route path="/artist/:cuid" element={<Artist />} />
          <Route path="/user/:cuid" element={<User />} />
          <Route path="/settings/account" element={<SettingsAccount />} />
          <Route path="/settings/client" element={<SettingsClient />} />
          <Route element={<AdminRoute />}>
            <Route path="/settings/admin" element={<SettingsAdmin />} />
          </Route>
          <Route path="*" element={<Generic404 />} />
        </Route>
      </Routes>
    </OktoScrollArea>
  );
}
```

== Version customisée de FFmpeg <ffmpeg>

L'application exploite les capacités de FFmpeg et metaflac pour l'extraction des métadonnées des fichiers FLAC.

Pour l'inclusion de FFmpeg dans l'image Docker de l'application, le choix a été fait de compiler une version statique et customisée de FFmpeg 8 et de ses dépendances principales à partir des sources officielles.

L'avantage principal de cette approche est de limiter la taille de l'image finale en n'incluant que les codecs audio FLAC et Opus.

Les gains de taille sont significatifs, avec des binaires finaux d'environ 5Mo contre 140Mo pour la distribution de FFmpeg fournie par Alpine Linux.

Ces binaires sont distribués sous forme d'image Docker, pour permettre une intégration facile dans l'image Docker de l'application via un layer séparé.

Le fichier Dockerfile et les pipelines CI/CD de construction de cette image sont disponibles dans un dépôt séparé sur GitHub #footnote[https://github.com/oktomusic/ffmpeg-custom].

L'image a été construite à partir des sources officielles de FFmpeg et de ses dépendances, avec une prise en charge de la cross-compilation native Docker #footnote[https://docs.docker.com/build/building/multi-platform/#cross-compilation] et une vérification des hachages des sources pour garantir l'intégrité des composants utilisés :

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

Un système de parsing spécifique a été développé pour les fichiers LRC, un parseur XML basé sur la bibliothèque `fast-xml-parser` est utilisé pour les fichiers TTML.

Les données parsées sont extraites dans un format commun compatible JSON, inspiré par l'API richsync de Musixmatch#footnote[https://docs.musixmatch.com/api-reference/lyrics-catalog/track-richsync-get], défini par un schéma Zod #footnote[https://zod.dev] et permettant un typage strict en backend.

Des tests unitaires complets ont été écrits pour garantir la robustesse du système de parsing.

Ces données sont stockées directement dans la base de données PostgreSQL, en exploitant le type `jsonb` ainsi qu'un générateur de types TypeScript pour Prisma#footnote[https://github.com/arthurfiorette/prisma-json-types-generator], dans le but de garantir la cohérence des données.

== Système de parsing et de génération de fichiers de playlist

Pour faciliter l'interopérabilité avec d'autres applications, l'application prend en charge l'import et l'export de playlists au format XSPF #footnote[https://xspf.org], JSPF (variante JSON) et M3U #footnote[https://en.wikipedia.org/wiki/M3U], dans le package `@oktomusic/playlists`.

Le modèle de données commun est celui de JSPF, qui permet une manipulation facile des données en TypeScript. Celui-ci est défini par un schéma Zod, permettant une utilisation directe pour parser les fichiers JSPF.

Un parseur basé sur la bibliothèque `fast-xml-parser` est utilisé pour les fichiers XSPF, tandis que les fichiers M3U sont parsés via une approche spécifique basée sur une itération ligne à ligne et des expressions régulières.

Des tests unitaires complets ont été écrits pour garantir la robustesse du système de parsing et de génération de fichiers de playlist.

== Extraction de couleurs dominantes dans les couvertures d'album

L'application intègre un système d'extraction de couleurs dominantes à partir des images de couverture d'album, dans le package `@oktomusic/vibrant`.

Les couvertures d'album subissant une conversion au format AVIF en plusieurs résolutions optimisées à l'aide de la bibliothèque `sharp`#footnote("https://sharp.pixelplumbing.com"), la décision a été prise de développer un adaptateur pour sharp basé sur les algorithmes MMCQ exportés par les modules de la bibliothèque `node-vibrant`#footnote[https://vibrant.dev], permettant d'éviter l'ajout d'une dépendance supplémentaire (`jimp`) et de charger deux fois les images en mémoire au moment de l'indexation.

== Validation des métadonnées FLAC

Pour garantir un système d'indexation robuste et cohérent, notamment en limitant autant que possible la perte de données lors d'une réindexation tout en conservant la qualité des métadonnées, le projet impose des exigences claires aux fichiers exploités.

Les fichiers manipulés par l'application sont au format FLAC et utilisent donc les commentaires Vorbis #footnote[https://xiph.org/vorbis/doc/v-comment.html] comme format de métadonnées.

Le format Vorbis ne définit malheureusement que des recommandations pour les noms et le format des tags, et ne définit pas de standard strict pour les métadonnées musicales.

Une spécification stricte a donc été définie pour les tags gérés par l'application, basée sur les recommandations Vorbis et les conventions MusicBrainz Picard#footnote[https://picard-docs.musicbrainz.org/en/latest/variables/tags_basic.html].

Le choix a été fait d'imposer ce modèle strict pour limiter l'indexation de fichiers ne respectant pas la structure d'un album, et faire correspondre plus simplement le modèle de données plat des fichiers FLAC avec le modèle relationnel de la base de données.

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
- *Multiple*: Un seul fichier peut contenir plusieurs fois le tag, avec des valeurs différentes (ex: plusieurs artistes pour un même album). L'ordre des valeurs est conservé.
- Les tags multiples utilisant des caractères de séparation (ex: `;`) ne sont pas pris en charge, car ils ne correspondent pas au standard Vorbis
- `TOTALTRACKS` est le nombre total de pistes dans le disque `DISCNUMBER`
- `TRACKNUMBER` est le numéro de la piste dans son disque `DISCNUMBER`
- `TOTALTRACKS` et `TOTALDISCS` sont validés pour la cohérence à travers tous les fichiers de l'album
- Les paires `DISCNUMBER` + `TRACKNUMBER` sont validées pour l'unicité à travers tous les fichiers de l'album
- Deux artistes différents avec le même nom ne peuvent pas être distingués. Le processus d'indexation pourrait prendre en charge une clé supplémentaire comme `MUSICBRAINZ_ARTISTID` à l'avenir pour résoudre ce problème.

L'extraction des métadonnées et la validation de format par fichier sont effectuées par le module `@oktomusic/metaflac-parser` et exploitent la sortie standard de l'outil CLI `metaflac` (faisant partie de la bibliothèque FLAC officielle) pour extraire les métadonnées Vorbis.

Un parseur spécifique a été développé pour l'analyse ligne à ligne, les vérifications de format et la génération d'un objet JSON typé pour le backend se faisant via un schéma Zod.

=== Parser ligne à ligne

Source : `packages/metaflac-parser/src/utils.ts`

Les lignes de sortie sont analysées via une expression régulière, les clés sont normalisées en majuscules et les valeurs sont stockées dans un tableau pour gérer les tags multiples.

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
// zPlainDate est une fonction Zod pour valider les dates au format `YYYY-MM-DD` et en sortir un objet Temporal.PlainDate

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

Pour faciliter l'exploitation contextuelle de ces couleurs, des propriétés CSS personnalisées#footnote[https://developer.mozilla.org/en-US/docs/Web/CSS/Reference/At-rules/@property] ainsi que des hooks React ont été définis à cet effet.

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

== Traduction côté client des paroles synchronisées

L'API web Translator#footnote[https://developer.mozilla.org/en-US/docs/Web/API/Translator], disponible actuellement uniquement dans les navigateurs Chromium#footnote[https://developer.chrome.com/docs/ai/translator-api], permet de traduire du texte côté client sans avoir à faire appel à un service tiers.

Les modèles IA utilisés par l'API étant exécutés localement dans le navigateur, la traduction est effectuée de manière sécurisée et privée, sans que les données ne quittent l'appareil de l'utilisateur.

La possibilité pour l'utilisateur de traduire les paroles synchronisées à l'aide de cette API a été intégrée dans la partie frontend de l'application.

#figure(
  image("../common/screenshots/interface_lyrics_translation.png"),
  caption: "Visualisation des paroles avec traduction",
)

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
  table.cell(fill: yellow, "Yellow"),
)

=== Zones d'amélioration

L'exploitation de l'API Trusted Types#footnote[https://developer.mozilla.org/en-US/docs/Web/API/Trusted_Types_API] ainsi que l'API Sanitizer#footnote[https://developer.mozilla.org/en-US/docs/Web/API/HTML_Sanitizer_API], couplées à la directive CSP `require-trusted-types-for`#footnote[https://developer.mozilla.org/en-US/docs/Web/HTTP/Reference/Headers/Content-Security-Policy/require-trusted-types-for] aurait fourni une protection supplémentaire contre les attaques XSS.

L'implémentation a été évaluée, mais a été bloquée par un manque de support du plugin chargé de la génération du Service Worker. Les éléments nécessaires devraient être mis en place dans la prochaine version du plugin.#footnote[https://github.com/vite-pwa/vite-plugin-pwa/issues/933]

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
- de bloquer l'installation de versions de dépendances aux standards de confiance plus faibles que celles déjà installées (signature de publication manquante, etc)

Les versions des dépendances sont figées via un fichier de verrouillage (lockfile), garantissant la reproductibilité des builds.

=== Mise à jour et surveillance des vulnérabilités

Les mises à jour des dépendances sont très régulièrement effectuées, avec une attention particulière portée aux correctifs de sécurité.

La fonctionnalité Dependabot#footnote[https://github.com/security/advanced-security] de la plateforme GitHub permet de créer automatiquement des pull requests pour les mises à jour de dépendances, ainsi que des alertes en cas de vulnérabilités détectées dans les dépendances utilisées.

La mise en place de pipelines CI/CD complets permet de s'assurer de l'absence de régressions lors de ces mises à jour, et d'assurer une intégration rapide des correctifs de sécurité.

=== Analyse statique complémentaire

L'outil d'analyse statique CodeQL#footnote[https://codeql.github.com] de GitHub est entièrement intégré dans les pipelines CI/CD, permettant une analyse continue du code source à la recherche de vulnérabilités connues et de patterns de code potentiellement dangereux, en complément des contrôles de la chaîne d’approvisionnement.

== Distribution

La distribution de l'application aux utilisateurs finaux est faite sous forme d'image Docker, hébergée sur un registre public #footnote[https://artifacthub.io/packages/container/oktomusic/oktomusic] (GitHub Container Registry).

Chaque image est construite exclusivement via les pipelines CI/CD à partir d'un Dockerfile versionné, garantissant reproductibilité, traçabilité et intégrité de chaque build.

Les images sont signées avec Cosign #footnote[https://sigstore.dev], un outil open-source de signature et de vérification des artefacts container, assurant leur provenance et la détection de toute modification non autorisée.

La base d'exécution de l'image est une version DHI (Docker Hardened Image)#footnote[https://www.docker.com/products/hardened-images] de Node.js 24#footnote[https://hub.docker.com/hardened-images/catalog/dhi/node], offrant une configuration durcie et une surface d'attaque réduite par rapport à une image Node.js standard.

Toutes les dépendances externes critiques (comme le code source FFmpeg) font l’objet d’une vérification cryptographique lors de la construction (voir section #link(<ffmpeg>)[FFmpeg]).

= Plan de tests et jeu d'essai

La stratégie de tests combine des tests unitaires, des tests d’intégration ciblés et des vérifications manuelles sur les parcours critiques de l’application.

L’objectif est de sécuriser les briques réutilisables, les traitements métier sensibles et le comportement attendu lors de la démonstration.

Les tests unitaires couvrent principalement les packages partagés :

- parsing des paroles synchronisées
- parsing et génération de playlists
- validation des métadonnées FLAC
- extraction ou normalisation de données et fonctions utilitaires

Ces tests permettent de vérifier des règles métier précises avec des jeux de fixtures reproductibles.

Les tests backend portent sur des services NestJS, la validation des entrées, la logique d'indexation isolée, la génération de headers HTTP et plusieurs utilitaires transverses.

Les tests frontend portent sur la manipulation de données, les hooks clés, les interactions de drag and drop et le service worker de lecture FLAC.

#[
  #show table: set text(size: 7pt, hyphenate: false)
  #show table: set par(justify: false)

  #table(
    columns: (1.3fr, 1.8fr, 2fr),
    align: horizon,
    table.header([*Périmètre testé*], [*Entrées / fixtures*], [*Assertions vérifiées*]),
    [Parsing de paroles synchronisées],
    [Fixtures LRC, Enhanced LRC et TTML, formats de temps valides ou invalides, XML TTML mal formé],
    [Production d'un objet conforme au schéma commun, calcul des fins de lignes, tokens mot à mot, rejet des valeurs invalides],
    [Parsing et génération de playlists],
    [Fixtures M3U, JSPF et XSPF, playlists vides ou complètes, JSON/XML invalides, durées ou numéros de piste invalides],
    [Parsing, génération, échappement XML, validation du schéma JSPF et round-trip entre formats],
    [Métadonnées FLAC et cohérence d'album],
    [Sortie metaflac, dates strictes, numéros de pistes invalides, albums multi-disques incohérents ou incomplets],
    [Normalisation des tags, rejet des dates non strictes, détection des incohérences d'album, doublons et positions manquantes],
    [Logique d'indexation isolée],
    [Présence ou absence de fichiers TTML/LRC, fichiers de paroles invalides, ISRC, titres et durées de pistes],
    [Priorité au TTML, fallback LRC, remontée d'erreurs de parsing, normalisation ISRC/titre et plan de mise à jour d'une piste],
    [Services playlist],
    [Playlists existantes ou absentes, propriétaire, administrateur, autre utilisateur, positions de pistes à ajouter, déplacer ou supprimer],
    [Règles d'accès, création, recherche, ajout, réordonnancement, suppression, export JSPF et sélection des pochettes],
    [Bibliothèque, albums et jobs d'indexation],
    [Historique d'écoute, sauvegarde d'albums ou playlists, recherche d'albums, fichiers de pochette, snapshots BullMQ],
    [Enregistrement et purge d'historique, bibliothèque explicite et virtuelle, filtres de recherche, résolution de pochettes, statut du dernier job],
    [Utilitaires backend et headers HTTP],
    [Dates ISO strictes, chemins enfants, JSON path avec placeholders, CUID2, manifest Vite, CSP, Permissions-Policy, endpoints info/health/OpenSearch],
    [Validation ou rejet des entrées, résolution sûre de chemins, fusion de headers de sécurité, génération de tags assets avec SRI, rendu des contrôleurs simples],
    [Service worker et utilitaires frontend],
    [Requêtes /api/media/{cuid}, OPFS disponible ou absent, Range HTTP avec cache hit/miss, méthodes non-GET, dates, durées, images média, métadonnées média, codes/messages GraphQL, positions de paroles],
    [Réponse FLAC avec headers OPFS, délégation non-GET au réseau, Range depuis cache ou fetch + cache, extraction du CUID, formatage et mapping des données affichées, détection de la ligne ou du mot actif],
    [Hooks et interactions frontend],
    [Web Share API disponible ou non, clipboard, ResizeObserver, couleurs Vibrant, payload de drag and drop de piste],
    [Partage ou copie du lien, toast d'erreur ou de succès, ajustement de taille de texte, application/nettoyage des variables CSS, validation du payload DnD],
    [Packages utilitaires],
    [Image Sharp mockée avec métadonnées, palette manquante, champs Open Graph scalaires, URL, entiers ou enum],
    [Redimensionnement avant pipeline Sharp, retour de palette, erreur si palette absente, compilation de meta tags et rejet des valeurs invalides],
  )
]

Le jeu d’essai le plus représentatif reste l’indexation d’un album FLAC complet, car il mobilise plusieurs compétences : accès au système de fichiers, extraction de métadonnées, validation, normalisation, persistance SQL, traitement asynchrone, gestion d’erreurs et mise à jour de l’interface.

À ce stade, cette chaîne complète est surtout couverte par des tests unitaires et d'intégration ciblés sur ses briques isolées.

= Veille sécurité

La veille sécurité a été menée en complément des mesures déjà détaillées dans les sections #link(<security_http>)[Sécurité HTTP] et #link(<security_supply_chain>)[Supply chain].
Pour éviter les doublons, cette section ne reprend pas l'ensemble des mécanismes de surveillance des dépendances, de signature des images ou d'analyse statique ; ceux-ci sont traités dans la partie dédiée à la chaîne d'approvisionnement.

L'objectif de la veille était surtout d'identifier les évolutions pouvant modifier les choix de sécurité du projet :

- évolution des API navigateur de sécurité, notamment Trusted Types, Sanitizer API, CSP, SRI et Permissions Policy
- bonnes pratiques liées aux Progressive Web Apps et aux Service Workers
- risques liés aux dépendances critiques du frontend et du backend
- durcissement des images Docker et des pipelines de construction
- retours et limitations rencontrés sur les outils utilisés dans le projet

Cette veille a notamment conduit à plusieurs décisions concrètes déjà intégrées dans le projet :

- conserver une politique de zéro ressource externe au runtime, pour simplifier la CSP et limiter les risques d'injection par dépendance externe
- suivre les scores Security Headers, HTTP Observatory et CSP Evaluator pour vérifier régulièrement la configuration HTTP exposée
- étudier l'ajout de Trusted Types et de la Sanitizer API pour renforcer la protection contre les XSS, tout en reportant leur intégration à cause de limitations côté génération du Service Worker
- ouvrir ou suivre des issues upstream lorsque les limites venaient d'outils externes, par exemple `vite-plugin-sri-gen`, `node-vibrant`, `lingui` ou `docker/github-builder`

= Annexes

#table(
  columns: (0.7fr, 1.3fr),
  align: horizon,
  table.header([*Nom*], [*Lien*]),
  [Dépôt GitHub],
  [https://github.com/oktomusic/oktomusic],
  [Dépôt GitHub (FFmpeg)],
  [https://github.com/oktomusic/ffmpeg-custom],
  [Documentation utilisateur],
  [https://oktomusic.afcms.dev],
  [Démonstration vidéo],
  [https://youtu.be/EA4ffNnbFVQ],
  [Maquette Figma],
  [https://www.figma.com/design/bkhuLo4RZVG6qd5Au4siZg/Oktomusic],
)
