[![CI](https://github.com/philipperackette/paques-autonome/actions/workflows/ci.yml/badge.svg)](https://github.com/philipperackette/paques-autonome/actions/workflows/ci.yml)

# Pâques astronomiques et ecclésiastiques

Calcul des dates de Pâques astronomiques et ecclésiastiques en JavaScript, dans une page autonome.

**En ligne :** https://philipperackette.github.io/paques-autonome/

## Vérifications automatiques

À chaque push et pull request, GitHub Actions lance ESLint et HTMLHint, puis des tests Playwright dans Chromium, sur écran d'ordinateur et de téléphone. Ils vérifient que chaque page s'ouvre sans erreur JavaScript ni défilement horizontal. Tests propres à ce site : les dates de Pâques publiées (occidentales de 2000 à 2030, orthodoxes), Pâques toujours un dimanche entre le 22 mars et le 25 avril de 1900 à 3000, l'équinoxe et le cas de 2019.

Le site lui-même n'a aucune dépendance : `package.json` ne sert qu'à ces vérifications.

```bash
npm ci
npm run lint
npx playwright install chromium
npm test
```
