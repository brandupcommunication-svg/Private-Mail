# Private Mail — maquette de refonte

Maquette BrandUp pour **Private Mail, Centre d'Affaire** (Cayenne, Guyane) :
domiciliation d'entreprise, aide administrative, location de bureaux.

Site actuel de référence : https://privatemail-dom.fr

## Lancer la maquette

```bash
~/Maquettes/privatemail-maquette/serve.sh
```

Puis ouvrir http://localhost:4710 (port surchargeable avec `PORT=xxxx`).

## Pages

| Fichier | Rôle |
|---|---|
| `index.html` | Accueil — hero Cayenne, 3 services, le centre, chiffres, étapes, FAQ |
| `domiciliation.html` | Domiciliation d'entreprise — inclus, gestion du courrier, étapes, FAQ |
| `aide-administrative.html` | Aide administrative — 6 interventions, déroulé, FAQ |
| `location-bureaux.html` | Location de bureaux — 3 espaces, équipements, cas d'usage, FAQ |
| `devis.html` | Configurateur de devis en 3 étapes + coordonnées et plan |

## Direction artistique

Palette et typographie d'origine conservées, mise en page reprise à zéro.

| Token | Valeur | Usage |
|---|---|---|
| `--cream` | `#F4F0EB` | fond principal |
| `--cream-deep` | `#EBE4DA` | sections alternées |
| `--gold` | `#AE946F` | couleur d'accent, boutons |
| `--gold-deep` | `#8C7350` | survol, texte d'accent |
| `--gold-light` | `#D9C7AB` | accents sur fond sombre |
| `--ink` | `#1C1815` | encre chaude (sections sombres, texte) |

Typographie : **Playfair Display** (titres) + **Open Sans** (texte), comme le site actuel.

## Axe devis

Le devis est accessible depuis n'importe quel point du site :

- bouton **Demander un devis** dans l'en-tête collant (visible en permanence) ;
- **bouton flottant** en bas à droite sur toutes les pages, doublé d'un bouton d'appel sur mobile ;
- bandeau CTA en fin de chaque page ;
- boutons contextuels dans les sections.

Les liens depuis une page service pré-cochent la prestation :
`devis.html?service=domiciliation` · `?service=administratif` · `?service=bureau`.

Le configurateur (`devis.html`) enchaîne 3 étapes — prestations, besoins, coordonnées —
avec un récapitulatif qui se remplit en direct. Aucun prix n'est affiché : la demande
débouche sur une proposition chiffrée sous 24 h ouvrées.

**Le formulaire n'envoie rien** : il affiche un écran de confirmation. À brancher sur
Formspree, Netlify Forms ou un endpoint côté client lors de la mise en production.

## Socle SEO / GEO

- `title` + `meta description` uniques par page, canonical, Open Graph.
- JSON-LD : `ProfessionalService` (accueil), `Service` + `BreadcrumbList` (pages service),
  `FAQPage` (accueil), `ContactPage` (devis).
- FAQ rédigées en réponses directes, exploitables par les moteurs et les IA.
- Images renommées de façon descriptive, attributs `alt` renseignés.
- `sitemap.xml` et `robots.txt` à la racine.

### GA4 — à compléter

Le suivi est câblé mais **désactivé** : remplacer `G-XXXXXXXXXX` dans
`assets/js/main.js` par l'identifiant GA4 du client. Le script ne se charge
qu'après acceptation de la bannière cookies (conforme RGPD), et l'envoi du
formulaire déclenche un événement `generate_lead`.

## Actions restant côté client

1. Créer / récupérer la propriété **GA4** et fournir l'ID `G-XXXXXXXXXX`.
2. Soumettre le site et le sitemap dans **Google Search Console**.
3. Créer ou revendiquer la fiche **Google Business Profile** (nom, adresse et téléphone
   doivent être strictement identiques à ceux du site).
4. Fournir des **photos du local** (façade, accueil, bureaux, salle de réunion) pour
   remplacer les visuels génériques encore présents.
5. Rédiger les **mentions légales** et la **politique de confidentialité** (liens en
   pied de page actuellement inactifs).

## Assets

Images reprises du site actuel, redimensionnées et renommées, dans `assets/img/`.
Icônes en sprite SVG unique : `assets/icons.svg`.

## Déploiement

`vercel.json` est prêt (URLs propres, cache long sur `assets/`). Un simple
`vercel deploy` depuis le dossier suffit.
