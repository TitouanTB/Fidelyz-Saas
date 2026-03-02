# Système de Personnalisation Temps Réel

## Overview

Le système d'édition temps réel permet aux restaurateurs de personnaliser leur mini-site avec un aperçu instantané, une sauvegarde automatique, un historique des versions et la possibilité de régénérer des sections avec l'IA.

## Architecture

### Components

#### Store: `src/store/editor-store.ts`
- Gère l'état complet de l'éditeur avec Zustand
- Persiste les données côté client avec `zustand/middleware`
- Inclut tous les setters pour les champs de personnalisation
- Gère l'historique des versions (10 dernières versions)

#### API Routes

**`/api/settings/autosave`**
- **POST**: Sauvegarde automatique de l'état de l'éditeur
- **GET**: Récupère l'état sauvegardé

**`/api/onboarding/regenerate`**
- **POST**: Régénère une section spécifique avec l'IA Google Generative AI
- Sections disponibles: `hero`, `about`, `specialties`, `cta`, `reward`, `notifications`, `all`

#### Editor Components

**`SectionCollapsible`**
- Section avec toggle expand/collapse
- Bouton optionnel "Régénérer avec l'IA"

**`TemplateSelector`**
- Sélecteur de template (5 choix)
- Sélecteur de palette de couleurs (8 palettes + custom)
- Sélecteur de paire de polices (6 combinaisons)

**`ColorPicker`**
- Input color avec validation
- Validation automatique du contraste (WCAG AA 4.5:1)

**`AutosaveIndicator`**
- Indicateur visuel de l'état de sauvegarde
- Affichage du temps écoulé depuis la dernière sauvegarde

**`HistoryTimeline`**
- Timeline des 10 dernières versions
- Bouton de restauration pour chaque version

**`PreviewPane`**
- Panneau de prévisualisation en temps réel
- Toggle mobile/desktop

## Utilisation

### Page de l'éditeur
`src/app/dashboard/settings/editor/page.tsx`

### Fonctionnalités principales

1. **Édition en temps réel**
   - Toutes les modifications sont instantanément répercutées dans le store
   - L'aperçu se met à jour automatiquement (à implémenter avec iframe)

2. **Sauvegarde automatique**
   - Debounce de 1 seconde côté client
   - Sauvegarde automatique toutes les 30 secondes
   - Pas de bouton "Enregistrer" - tout est automatique

3. **Historique des versions**
   - Les 10 dernières versions sont sauvegardées automatiquement
   - Possibilité de revenir à n'importe quelle version
   - Stocké dans le store et dans Organization.metadata

4. **Régénération IA par section**
   - Bouton "Régénérer avec l'IA" dans chaque section
   - Ne modifie que la section demandée
   - Utilise Google Generative AI (gemini-1.5-pro)

5. **Personnalisation complète**
   - Design: template, couleurs, polices
   - Textes: headline, sous-titre, about, spécialités, CTA
   - Récompense: type, description, conditions
   - Menu: catégories et plats
   - Formulaire: champs activés/désactivés
   - QR Codes: couleur, taille
   - Notifications: messages et délais

## Personnalisation absolue

Le système respecte le principe absolu: le restaurateur peut modifier ABSOLUMENT TOUT à n'importe quel moment.

- Aucun élément n'est verrouillé
- La génération IA est un point de départ, jamais un résultat final imposé
- Toutes les modifications sont instantanées et sauvegardées automatiquement

## Structure des données

### EditorState (store)
```typescript
{
  // Design
  selectedTemplate: string
  selectedPalette: string
  selectedFonts: string
  primaryColor?: string
  secondaryColor?: string
  accentColor?: string

  // Textes
  heroHeadline: string
  heroSubtitle: string
  aboutTitle: string
  aboutParagraph1: string
  aboutParagraph2: string
  specialtyNames: string[]
  specialtyDescriptions: string[]
  ctaPrimary: string
  ctaSecondary: string

  // Récompense
  rewardType: string
  rewardDescription: string
  rewardVisitsRequired: number
  rewardValidityDays: number
  rewardConditions: string

  // Menu
  menuCategories: MenuCategory[]
  menuItems: MenuItem[]

  // Formulaire
  formEmailEnabled: boolean
  formPhoneEnabled: boolean
  formNameEnabled: boolean
  formButtonText: string
  formConsentText: string

  // QR Codes
  qrColor: string
  qrSize: number

  // Notifications
  reminderDelayDays: number
  reactivationDelayDays: number
  reactivationDelayDays2: number
  reminderEnabled: boolean
  reactivationEnabled: boolean
  reactivation2Enabled: boolean
  reminderTemplate: string
  reactivationTemplate: string
  reactivation2Template: string

  // UI
  previewMode: 'mobile' | 'desktop'
  autosaveStatus: 'saved' | 'saving' | 'unsaved'
  lastSavedAt: Date | null
  isDirty: boolean
  versions: Version[]
  currentVersionIndex: number
}
```

## Migration Prisma

Un champ `metadata` a été ajouté au model Organization:
```prisma
model Organization {
  // ... autres champs
  metadata Json?
  // ... autres champs
}
```

Migration: `prisma/migrations/20250302_add_organization_metadata/migration.sql`

## Templates disponibles

1. **Moderne** - Design épuré et contemporain
2. **Classique** - Style intemporel et élégant
3. **Vibrant** - Couleurs vives et dynamiques
4. **Minimaliste** - Ligne claire et épurée
5. **Chaleureux** - Atmosphère accueillante

## Palettes de couleurs

1. **Violet** - #9317FD, #E879F9, #FCD34D
2. **Bleu** - #2563EB, #60A5FA, #93C5FD
3. **Vert** - #059669, #34D399, #6EE7B7
4. **Orange** - #EA580C, #FB923C, #FDBA74
5. **Rouge** - #DC2626, #F87171, #FCA5A5
6. **Turquoise** - #0D9488, #2DD4BF, #5EEAD4
7. **Rose** - #DB2777, #F472B6, #F9A8D4
8. **Personnalisé** - Couleurs custom via ColorPicker

## Paires de polices

1. **Inter + Poppins** - Moderne et lisible
2. **Playfair + Lato** - Élégant et professionnel
3. **Merriweather + Open Sans** - Classique et équilibré
4. **Montserrat + Roboto** - Dynamique et moderne
5. **Raleway + Open Sans** - Léger et aéré
6. **Lora + Muli** - Sérif et sans-serif

## Intégration avec existant

- Utilise les models Organization, MenuCategory, MenuItem
- Sauvegarde dans Organization.metadata
- Compatible avec le système de notifications existant
- Utilise l'authentification Supabase existante

## Prochaines étapes

1. Implémenter la prévisualisation avec iframe réel du mini-site généré
2. Connecter les données du menu avec les models MenuCategory et MenuItem existants
3. Ajouter la génération de QR codes avec téléchargement PNG/SVG/PDF
4. Ajouter le drag and drop pour réordonner les catégories et plats
5. Tester l'intégration complète avec le système de fidélité existant

## Testing

Pour tester le système:

1. Naviguer vers `/dashboard/settings/editor`
2. Modifier les différentes sections
3. Vérifier que l'autosave fonctionne
4. Tester la régénération IA par section
5. Vérifier l'historique des versions
6. Tester la restauration d'une version
7. Vérifier le mobile/desktop toggle

## Performance

- Debounce de 1 seconde avant l'envoi au serveur
- Sauvegarde automatique toutes les 30 secondes
- Persisted state côté client pour éviter les pertes
- Optimisé avec Zustand (performant et léger)
