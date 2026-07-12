#set document(title: "Présentation de projet Oktomusic", author: "Louis WALTER")

#set text(font: "Inter")

#import "@preview/diatypst:0.9.3": *

#show: slides.with(
  title: "Oktomusic",
  subtitle: "Serveur de streaming musical auto-hébergé",
  authors: ("Louis WALTER"),
  ratio: 16 / 9,
  count: "number",
)

= Présentation du projet

== Résumé

#grid(columns: (1fr, 1fr), gutter: 1em, [
  *Oktomusic*

  - Serveur de streaming musical auto-hébergé
  - Projet open-source sous licence AGPL-3.0
  - Application *web uniquement* : navigateur, PWA et APIs web modernes
  - Authentification déléguée à un fournisseur OpenID Connect
], [
  *Périmètre présenté*

  - Déploiement Docker Compose avec PostgreSQL, Valkey et fournisseur OIDC
  - Indexation d'une bibliothèque musicale FLAC
  - Navigation entre albums, artistes, recherche et bibliothèque utilisateur
  - Lecture audio, file d'attente, paroles synchronisées et playlists
])

= Analyse du besoin

== Contexte et objectif

#grid(
  columns: (1fr, 1fr),
  gutter: 1em,
  [
    *Constat*

    - Les plateformes musicales centralisées donnent peu de contrôle sur les données, l'hébergement et l'évolution du service
    - Les solutions auto-hébergées existantes couvrent souvent la vidéo ou la lecture audio basique, mais moins bien l'expérience musicale moderne
    - Une bibliothèque personnelle demande une bonne prise en charge des métadonnées audio, des albums, des artistes, des paroles et des playlists
  ],
  [
    *Objectif du projet*

    - Concevoir un serveur de streaming musical *open-source* et auto-hébergeable
    - Proposer une application *web uniquement*, exploitant des fonctionnalités web modernes
    - S'intégrer à une infrastructure existante via *OpenID Connect*, sans gérer localement les mots de passe
    - Permettre à l'utilisateur de parcourir, écouter et organiser sa bibliothèque musicale depuis un navigateur
  ],
)

== Utilisateurs et besoins

#grid(columns: (1fr, 1fr), gutter: 1em, [
  *Administrateur / opérateur*

  - Déployer l'application facilement dans une infrastructure Docker
  - Connecter l'application à un fournisseur d'identité existant : Keycloak, Authentik, etc.
  - Indexer une bibliothèque musicale FLAC stockée sur le serveur
  - Bénéficier d'un socle sécurisé : sessions serveur, rôles, configuration explicite
], [
  *Utilisateur final*

  - Se connecter avec son compte habituel grâce à OpenID Connect
  - Rechercher des titres, albums et artistes
  - Écouter la musique avec un lecteur web moderne : file d'attente, Media Session, PWA, service worker
  - Créer, modifier, importer et exporter des playlists
  - Consulter des paroles synchronisées lorsque disponibles
])

== Positionnement face aux alternatives

#grid(columns: (1fr, 1fr), gutter: 1em, [
  #align(center, image("../common/assets/jellyfin.svg", height: 2.5em))

  *Jellyfin*

  - Solution très complète, mais orientée médiathèque généraliste
  - Mauvaise gestion des métadonnées audio pour une bibliothèque musicale exigeante
  - Pas de paroles synchronisées adaptées à l'usage visé
  - Interface perfectible pour une écoute quotidienne
  - Pas d'OpenID Connect en standard
], [
  #align(center, image("../common/assets/navidrome.svg", height: 2.5em))

  *Navidrome*

  - Solution plus spécialisée musique, mais interface moins pratique pour l'usage recherché
  - Thème et fonctionnalités peu pertinents pour une expérience web moderne centrée sur l'écoute
  - Fonctionnalités avancées limitées pour les paroles, playlists et intégration navigateur
  - Pas d'OpenID Connect en standard
])

== Zoning de l'interface

#align(center, image(
  "../common/interface.excalidraw.svg",
  alt: "Zoning de l'interface Oktomusic",
  fit: "contain",
  format: "svg",
  height: auto,
))

= Gestion de projet

== Organisation et suivi

#grid(columns: (1fr, 1fr), gutter: 1em, [
  *Méthode*

  - Cadrage à partir d'un besoin réaliste
  - Développement itératif orienté MVP
  - Découpage par domaines : auth, indexation, catalogue, lecteur, playlists, déploiement
  - Documentation utilisateur et technique maintenue avec le code
], [
  *Traçabilité*

  - Monorepo GitHub, commits réguliers et workflows CI
  - Validation continue : build, lint, typecheck et tests par package
  - Contributions upstream : rapports de bugs et demandes d'amélioration sur des dépendances
  - Packaging final : image Docker, documentation d'installation et support de présentation
])

== Suivi avec GitHub Projects

#align(center, image(
  "../common/github_project.png",
  alt: "Tableau Kanban GitHub Projects du projet Oktomusic",
  fit: "contain",
  height: auto,
))

= Architecture globale

== Vue d'ensemble

#align(center, image(
  "../common/architecture.excalidraw.svg",
  alt: "Schéma d'architecture",
  fit: "contain",
  format: "svg",
  height: auto,
))

== Modèle de données simplifié

#grid(columns: (1fr, 1fr), gutter: 1em, [
*Catalogue musical*

- `Album` contient des `Track`
- `Artist` est lié aux albums et aux pistes via tables de jointure ordonnées
- `FlacFile` relie une piste à son fichier source
- Les paroles synchronisées sont stockées en `jsonb` sur les pistes
- Les couleurs dominantes des couvertures sont précalculées
], [
*Données utilisateur*

- `User` est créé depuis l'identité OpenID Connect (`oidcSub`)
- Rôles `USER` et `ADMIN`
- `Playlist` et `PlaylistTrack` stockent l'ordre des titres
- `UserLibraryItem` gère la bibliothèque personnelle
- `UserItemPlayHistory` historise les écoutes récentes
])

== Modèle conceptuel de données

#grid(
  columns: (0.34fr, 0.66fr),
  gutter: 0.8em,
  [
    *Lecture métier*

    - Catalogue musical séparé des données utilisateur
    - Albums, pistes, artistes et fichiers FLAC pour l'indexation
    - Comptes, playlists, bibliothèque et historique pour l'usage
    - Associations explicites pour conserver l'ordre des crédits
  ],
  [
    #align(
      center,
      image("../common/database_mcd.png", alt: "Modèle conceptuel de données Oktomusic", fit: "contain", height: 6.6cm),
    )
  ],
)

== Modèle logique de données

#grid(
  columns: (0.34fr, 0.66fr),
  gutter: 0.8em,
  [
    *Passage au relationnel*

    - Tables de jointure pour les relations plusieurs-à-plusieurs
    - Ordre stocké pour les artistes et les playlists
    - Contraintes et index pour cohérence et requêtes courantes
  ],
  [
    #align(
      center,
      image("../common/database_mld.png", alt: "Modèle logique de données Oktomusic", fit: "contain", height: 6.6cm),
    )
  ],
)

== Modèle physique de données

#grid(
  columns: (0.34fr, 0.66fr),
  gutter: 0.8em,
  [
  *Implémentation Prisma*

  - Schéma source pour migrations et client TypeScript
  - Types PostgreSQL, contraintes et suppressions en cascade
  - Paroles synchronisées stockées en `jsonb`
  ],
  [
    #align(
      center,
      image("../common/database_prisma.png", alt: "Modèle physique de données Oktomusic", fit: "contain", height: 6.6cm),
    )
  ],
)

== Choix technologiques

#grid(columns: (1fr, 1fr), gutter: 1em, [
  *Backend et données*

  - TypeScript partagé entre frontend, backend et packages
  - NestJS pour structurer les modules, contrôleurs, services et guards
  - GraphQL pour l'API applicative, REST pour les flux fichiers
  - PostgreSQL + Prisma pour la base relationnelle
  - Valkey + BullMQ pour sessions et traitements asynchrones
], [
  *Frontend et distribution*

  - Vite + React pour l'interface
  - Jotai pour l'état du lecteur et de l'application
  - TailwindCSS et composants réutilisables pour l'UI
  - Lingui pour l'internationalisation
  - Image Docker officielle publiée sur le GitHub Container Registry
])

= Réalisation technique

== Organisation du code

#grid(columns: (1fr, 1fr), gutter: 1em, [
*Monorepo applicatif*

- `apps/backend` : NestJS, API GraphQL + REST média, authentification, indexation
- `apps/frontend` : application Vite + React, interface, PWA
- `apps/website` : site web de documentation utilisateur (déployé sur Cloudflare Pages)
- Outillage commun : PNPM workspaces, TypeScript, ESLint, Vitest, CI GitHub Actions
], [
  *Packages mutualisés*

  - Domaine technique isolé des applications principales
  - Packages testables indépendamment
  - Réutilisation entre backend, frontend et site de documentation
  - Moins de duplication sur les formats : paroles, playlists, métadonnées, images
  - CI séparée par package pour repérer rapidement les régressions
])

== Indexation de la bibliothèque

#grid(columns: (1fr, 1fr), gutter: 1em, [
  *Traitement asynchrone*

  - Déclenchement depuis l'espace administrateur
  - Job BullMQ persisté dans Valkey
  - Suivi de progression dans l'interface via subscriptions GraphQL
  - Rapports d'erreurs et d'avertissements exploitables
], [
*Pipeline métier*

- Découverte des dossiers et fichiers FLAC
- Extraction via `metaflac` / `ffprobe`
- Validation et normalisation des métadonnées
- Synchronisation albums, artistes, pistes et fichiers en base PostgreSQL
- Analyse des couvertures, création de thumbnails optimisées et intégration des paroles synchronisées
])

== Traitement média

#align(center, image("../common/assets/ffmpeg.svg", height: 3em))

#grid(columns: (1fr, 1fr), gutter: 1em, [
  *FFmpeg custom*

  - Compilation statique de
    - #link("https://ffmpeg.org")[FFmpeg 8]
    - #link("https://xiph.org/flac")[metaflac]
  - Image dédiée intégrable comme layer Docker
  - Support ciblé sur les codecs nécessaires : FLAC et Opus
  - Vérification des sources par hash pendant le build
], [
  *Résultat*

  - Binaire final d'environ 5 Mo contre environ 140 Mo avec la distribution Alpine
  - Image d'application plus légère
  - Surface d'attaque réduite
  - Build reproductible et compatible multi-architecture#footnote[https://github.com/oktomusic/ffmpeg-custom]
])

== Backend métier et accès aux données

#grid(columns: (1fr, 1fr), gutter: 1em, [
  *API applicative*

  - API GraphQL pour albums, artistes, pistes, recherche, bibliothèque et playlists
  - Mutations de création, modification, suppression et réordonnancement des playlists
  - Authentification et support des rôles via OpenID Connect
  - Endpoints REST pour le streaming audio et l'export de playlists
], [
*Persistance*

- PostgreSQL comme base relationnelle principale
- Prisma pour les migrations et l'accès aux données
- Modèle utilisateur, bibliothèque, historique, albums, artistes, pistes et playlists
- Stockage `jsonb` des paroles synchronisées avec typage TypeScript
])

== Sécurité applicative

#grid(columns: (1fr, 1fr), gutter: 1em, [
  *Authentification et accès*

  - Oktomusic est un Relying Party OpenID Connect
  - Authorization Code Flow avec PKCE et sessions serveur
  - Aucun mot de passe utilisateur stocké par l'application
  - Rôles extraits des claims OIDC et contrôlés par des guards NestJS
  - Endpoints média et mutations protégés par session
], [
  *Navigateur et supply chain*

  - Politique "zéro ressource externe" au runtime
  - CSP restrictive, SRI, Permissions Policy et CORS limité
  - Validation des entrées par pipes, schémas Zod et types Prisma
  - Dependabot, CodeQL, lockfile PNPM et CI
  - Images Docker signées par le pipeline CD
])

== Interface et expérience web

#grid(
  columns: (1fr, 1fr),
  gutter: 1em,
  [
    *Interface utilisateur*

    - Shell en trois zones : bibliothèque, contenu, file d'attente
    - Lecteur persistant en bas de l'écran
    - Recherche albums, artistes et titres
    - Gestion de playlists avec ajout, suppression et réordonnancement
    - Visualisation des paroles synchronisées
  ],
  [
  *Fonctionnalités modernes*

  - PWA avec manifest et service worker
  - Media Session API pour l'intégration aux contrôles système
  - Wake Lock pour éviter la mise en veille pendant l'écoute
  - Streaming FLAC avec support des requêtes HTTP `Range`
  - Traduction locale des paroles via l'API #link("https://developer.mozilla.org/en-US/docs/Web/API/Translator")[Translator] (Chromium)
  - Mini-lecteur Picture-in-Picture
  - Mode Kiosque pour systèmes embarqués (interface de chaîne HiFi, etc)
  ],
)

== Briques spécialisées

#grid(columns: (1fr, 1fr), gutter: 1em, [
  *Formats et interopérabilité*

  - Paroles : modèle JSON commun avec parsing des formats LRC, Enhanced LRC et TTML
  - Playlists : export XSPF, JSPF et M3U
  - Couvertures : conversion optimisée et extraction de couleurs dominantes via sharp et node-vibrant
  - Documentation OpenAPI complète
], [
  *Utilisation dans l'application*

  - Enrichissement automatique des albums pendant l'indexation
  - Affichage dynamique des couleurs de couverture dans l'interface
  - Visualisation de paroles synchronisées pendant la lecture
  - Export de playlists pour faciliter la portabilité des données
])

== Tests et qualité

#grid(columns: (1fr, 1fr), gutter: 1em, [
  *Stratégie de tests*

  - Tests unitaires Vitest sur les packages communs
  - Tests backend sur services métier, pipes, headers et utilitaires
  - Tests frontend sur logique de lecteur, drag and drop, formats et service worker
  - Jeux de fixtures pour paroles, playlists et métadonnées
], [
*Contrôle continu*

- Workflows GitHub Actions par application et par package
- Build, lint, typecheck et tests avant construction Docker
- Build multi-architecture `linux/amd64` et `linux/arm64`
])

= Démonstration

== Scénario de démonstration

- Déploiement du logiciel sur une infrastructure auto-hébergée de production
- Indexation d'une bibliothèque musicale
- Utilisation de l'interface utilisateur
  - Mise en valeur des fonctionnalités PWA de l'application
  - Utilisation de la recherche
  - Utilisation des fonctionnalités de lecture
  - Utilisation des fonctionnalités de gestion de bibliothèque
  - Création de playlists

== Déploiement attendu

#align(
  center,
  image("../common/setup.excalidraw.svg", alt: "Schéma de setup", fit: "contain", format: "svg", height: auto),
)

== Cible du déploiement

- Station de travail
  - Fedora 44 workstation
- Intégration dans une infrastructure Docker Compose de production
- Déploiement 100% à distance

== Détails du déploiement

Composants déjà en place :

- Tunnel Cloudflare
- Reverse proxy Traefik (configuration TLS durcie et gestion de certificats automatisée)
- Instance Keycloak sécurisée
  - Connexion OAuth2 avec GitHub
  - Comptes déjà créés pour la démonstration
- Configuration du client Keycloak pour Oktomusic
- Création du sous-domaine DNS, associé au tunnel Cloudflare

Composants à déployer en live :

- Déploiement de l'application Oktomusic et de ses dépendances via Docker Compose

= Bilan

== Compétences CDA couvertes

#grid(columns: (1fr, 1fr, 1fr), gutter: 0.7em, [
  *Conception*

  - Analyse du besoin, utilisateurs, alternatives
  - Zoning de l'interface et parcours principal
  - Architecture multicouche frontend / backend / données
  - Base relationnelle PostgreSQL modélisée avec Prisma
], [
  *Développement*

  - Environnement : monorepo, Docker, CI
  - Interfaces utilisateur React/PWA
  - Composants métier : indexation, playlists, recherche, streaming
], [
  *Qualité et production*

  - Tests unitaires et fonctionnels via Vitest
  - Documentation utilisateur (site web) et technique
  - Production DevOps : CI/CD GitHub Actions pour les tests et la publication
  - Sécurité : applicative et supply chain
])

#v(0.4em)

Le projet couvre les trois blocs CDA : application sécurisée, architecture en couches avec base relationnelle, préparation au déploiement et démarche DevOps.

== Pistes d'amélioration

- Interface utilisateur mobile
  - Trop différente de la version desktop pour se baser uniquement sur une approche CSS
  - Gros travail de mise en place et test de la navigation par gestes
- Transcodage des pistes musicales
  - Permettrait de réduire la consommation de bande passante et d'espace de stockage
  - Briques technologiques déjà en place (ffmpeg)
- Mode hors ligne
  - Possible sur la plateforme web moderne
  - Permettrait d'écouter sa musique même sans connexion internet
  - Mise en cache + téléchargement des musiques facile avec le Service Worker
  - Solution de persistance custom nécessaire (plugins Apollo GraphQL non maintenus)
- Suggestions d'écoute et recherche avancée
  - Intégration possible d'#link("https://github.com/NeptuneHub/AudioMuse-AI", "AudioMuse-AI") pour l'analyse audio et les recommandations
  - Combiné à l'ajout de métadonnées enrichies, intégration d'un système de recherche plus poussé (type #link("https://opensearch.org", "OpenSearch"))

= Questions
