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

= Architecture globale

== Vue d'ensemble

#align(center, image(
  "../common/architecture.excalidraw.svg",
  alt: "Schéma d'architecture",
  fit: "contain",
  format: "svg",
  height: auto,
))

== Choix technologiques

- Language : *TypeScript*
- Backend : *NestJS*, avec *Prisma* et *GraphQL*
- Frontend :
  - *React*: librarie d'interface
  - *Jotai*: state management
  - *TailwindCSS*: framework CSS
  - *Lingui*: internationalisation

= Démonstration

== Scénario de démonstration

- Déploiement du logiciel sur une infrastructure auto-hébergée de production
- Indexation d'une bibliothèque musicale
- Utilisation de l'interface utilisateur
  - Mise en valeur des fonctionnalités PWA de l'application
  - Utilisation de la recherche
  - Utilisation des fonctionalités de lecture
  - Utilisation des fonctionalités de gestion de bibliothèque
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
  - Connection OAuth2 avec GitHub
  - Comptes déjà créés pour la démonstration
- Configuration du client Keycloak pour Oktomusic
- Création du sous-domaine DNS, associé au tunnel Cloudflare

Composants à déployer en live :

- Déploiement de l'application Oktomusic et de ses dépendances via Docker Compose

= Bilan

== Compétences mobilisées

TODO

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
  - Solution de persistance custom nécéssaire (plugins Apollo GraphQL non maintenus)
- Suggestions d'écoute et recherche avancée
  - Intégration possible d'#link("https://github.com/NeptuneHub/AudioMuse-AI", "AudioMuse-AI") pour l'analyse audio et les recommendations
  - Combiné à l'ajout de métadonnées enrichies, intégration d'un système de recherche plus poussé (type #link("https://opensearch.org", "OpenSearch"))

= Questions
