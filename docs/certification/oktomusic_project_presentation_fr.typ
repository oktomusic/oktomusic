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

== Architecture logicielle

#align(center, image(
  "../common/architecture.excalidraw.svg",
  alt: "Schéma d'architecture",
  fit: "contain",
  format: "svg",
  height: auto,
))

== Déploiement de démonstration

#align(
  center,
  image("../common/setup.excalidraw.svg", alt: "Schéma de setup", fit: "contain", format: "svg", height: auto),
)
