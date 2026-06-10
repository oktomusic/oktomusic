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

Composants à déployer en live :

- Configuration du client Keycloak pour Oktomusic
- Déploiement de l'application Oktomusic et de ses dépendances via Docker Compose
- Création du sous-domaine DNS, associé au tunnel Cloudflare

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
