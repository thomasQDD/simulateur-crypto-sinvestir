# Simulateur Plus-Value Crypto — S'investir

Transposition du [simulateur crypto S'investir](https://sinvestir.fr/simulateur-crypto-monnaie/)
aux couleurs et standards de la suite d'outils [simulateurs.sinvestir.fr](https://simulateurs.sinvestir.fr/).

Calculez la performance passée d'un investissement crypto — **en une seule fois** ou en
**DCA** (quotidien / hebdomadaire / mensuel) — à partir de données de marché historiques,
sur Bitcoin, Ethereum et des milliers de cryptomonnaies.

- 🔗 **Démo en ligne** : _(à compléter après déploiement Vercel)_
- 🔗 **Aperçu embarquable** : `…/embed`
- 📦 **Repo** : _(lien Git)_

---

## 🚀 Lancer le projet

```bash
npm install
cp .env.example .env.local   # puis renseigner COINGECKO_API_KEY
npm run dev                  # http://localhost:3000
```

| Script           | Rôle                                |
| ---------------- | ----------------------------------- |
| `npm run dev`    | Serveur de développement            |
| `npm run build`  | Build de production                 |
| `npm run start`  | Serveur de production               |
| `npm test`       | Tests unitaires de la logique DCA   |
| `npm run lint`   | ESLint                              |

### Clé API CoinGecko

Les prix proviennent de l'API **CoinGecko**. La récupération de l'historique
(`market_chart/range`) nécessite une **clé Demo (gratuite)** au-delà des 365 derniers jours :

1. Créer une clé sur https://www.coingecko.com/en/api/pricing (plan **Demo**, gratuit).
2. La renseigner dans `.env.local` :
   ```
   COINGECKO_API_KEY=CG-xxxxxxxxxxxxxxxx
   ```
3. Sur Vercel : ajouter la même variable d'environnement (`COINGECKO_API_KEY`).

> Sans clé, l'application fonctionne mais l'API publique limite l'historique aux **365 derniers jours**.

---

## 🧱 Stack & partis pris

| Choix | Pourquoi |
| ----- | -------- |
| **Next.js 16 (App Router) + TypeScript** | Aligné sur la stack interne S'investir ; déploiement natif Vercel ; les **Route Handlers** servent de proxy à CoinGecko et **protègent la clé API** (jamais exposée au client). |
| **Tailwind CSS v4** | Tokens de design centralisés (couleurs, typo) ; itération rapide et fidèle à la charte. |
| **Graphe en SVG « maison »** (zéro dépendance) | L'app S'investir n'utilise aucune librairie de chart : on reste fidèle **et** on minimise les dépendances (exigence d'embarquabilité). Aire + courbes + tooltip + axes faits main. |
| **CoinGecko (Demo API)** | Données historiques fiables, des milliers de cryptos ; clé en variable d'environnement. |
| **Pas d'authentification / Supabase** | Hors périmètre du test. Le simulateur est un **composant autonome**, prêt à être branché à Supabase (sauvegarde des simulations) plus tard. |

**Fidélité au design** : couleurs (`#0049C6`, accent `#1098F7`, or `#F8D047`, fond navy
dégradé), typographies (**Plus Jakarta Sans** + **Lexend**), composants (sidebar, topbar,
inputs « underline », result cards, barre de proportion bleu/or, toggle Graphiques/Calendrier)
ont été relevés directement sur l'app réelle pour coller au plus près.

---

## 🗂️ Structure

```
src/
  app/
    page.tsx              # Démo : shell de la suite + simulateur
    embed/page.tsx        # Version embarquable (sans shell) pour iframe
    api/coins/route.ts    # Proxy CoinGecko : liste/recherche de cryptos (caché)
    api/history/route.ts  # Proxy CoinGecko : prix historiques (caché)
    layout.tsx, globals.css
  components/
    shell/                # AppShell, Sidebar, Topbar (chrome de la suite)
    simulator/            # SimulateurCrypto, SimulationForm, CryptoCombobox,
                          # ResultsPanel, PerformanceChart, CalendarView
    ui/                   # Card, Field, Pill, Segmented, InfoTooltip, Logo, icons
  lib/
    dca.ts                # Logique de simulation (pure, testée)
    dca.test.ts           # Tests unitaires
    coingecko.ts          # Client serveur CoinGecko
    format.ts             # Formatage € / % / quantités (locale fr-FR)
    types.ts
```

---

## 🧮 Logique de simulation (`src/lib/dca.ts`)

Fonction **pure et testée** (`npm test`) :

1. Génère les **dates d'achat** entre `Depuis` et `Jusqu'au` selon la fréquence
   (une fois / jour / semaine / mois — quantième mensuel clampé pour les mois courts).
2. Pour chaque date : récupère le prix le plus proche, cumule `unités += montant / prix`.
3. Calcule **Investi**, **Acquis** (quantité), **Prix moyen d'acquisition**,
   **Capital final** (`unités × prix de fin`), **Performance %**.
4. Construit la **série temporelle** (valeur du portefeuille vs investi cumulé) pour le graphe.

---

## 🔌 Embarquabilité

Le composant `<SimulateurCrypto />` est **autonome** (aucune dépendance au shell). Une route
dédiée `/embed` le rend seul, prête à être intégrée depuis `sinvestir.fr` :

```html
<iframe
  src="https://<votre-démo>.vercel.app/embed"
  width="100%"
  height="1400"
  style="border:0"
  title="Simulateur Plus-Value Crypto"
></iframe>
```

Les paramètres d'un scénario sont **partageables par URL** (deep-link), ex. :
`/embed?coin=bitcoin&sym=btc&name=Bitcoin&amount=100&freq=monthly&from=2024-01-01&to=2026-01-01`
(c'est ce que produit le bouton « Partager mes résultats »).

---

## 💡 Regard de partenaire — pistes d'amélioration

- **Combler un manque** : la suite ne propose pas (encore) de simulateur de plus-value crypto
  en DCA — seulement un comparateur de plateformes. Cet outil s'y intègre directement.
- **Comparaison multi-scénarios** : DCA vs one-shot côte à côte, ou deux cryptos en parallèle.
- **Cache des prix côté Supabase/Edge** : fiabiliser et réduire les appels à l'API CoinGecko.
- **Design system partagé** : mutualiser les tokens (couleurs, typo, composants) entre tous
  les simulateurs pour accélérer la création de nouveaux outils.
- **Export** : PNG/PDF des résultats, et sauvegarde réelle des simulations (via le compte).

---

## ⚠️ Avertissement

Outil pédagogique. Simulations **rétrospectives** basées sur des données passées : elles ne
préjugent pas des performances futures et ne constituent pas un conseil en investissement.
Les crypto-actifs sont très volatils (risque de perte en capital).
