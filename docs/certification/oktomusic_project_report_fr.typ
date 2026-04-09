#set page(paper: "a4")
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

(architecture)

#image("../common/project.excalidraw.svg")

= Spécifications techniques

= Réalisations

(captures d'écrans, etc)

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

// TODO: ajouter réellement Integrity-Policy

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

Tout au long du développement, les instances de pré-production de l'application ont été régulièrement testées à l'aide d'outils d'analyse de sécurité HTTP tels que Security Headers#footnote[https://securityheaders.com] (Snyk) et HTTP Observatory#footnote[https://developer.mozilla.org/en-US/observatory] (Mozilla), dans le but d'obtenir les meilleurs résultats possibles.

Pour l'instance de pré-production (reverse proxy Traefik), les résultats obtenus sont les suivants :

#table(
  columns: (auto, auto),
  align: horizon,
  table.header([*Outil*], [*Score*]),
  [Security Headers],
  table.cell(fill: green, "A+"),
  [HTTP Observatory],
  table.cell(fill: green, "A+ (140/100)"),
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

Elles sont construites à partir de bases officielles et versionnées, et toutes les dépendances externes critiques (comme le code source FFmpeg) font l’objet d’une vérification cryptographique lors de la construction (voir section #link(<security>)[FFmpeg]).

// TODO: fix link to FFmpeg section

= Plan de tests et jeu d'essai

= Veille sécurité

= Annexes
