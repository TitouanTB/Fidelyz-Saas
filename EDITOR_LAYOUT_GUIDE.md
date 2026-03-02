# Guide de Layout - Éditeur Temps Réel

## 📐 Structure Générale

```
┌─────────────────────────────────────────────────────────────────┐
│                    Éditeur de Mini-Site                         │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  ┌─────────────────────┐    ┌──────────────────────────────┐  │
│  │   Panneau Gauche    │    │     Panneau Droit           │  │
│  │   (Contrôles)       │    │     (Preview)               │  │
│  │                     │    │                             │  │
│  │  ┌─────────────────┐ │    │  ┌──────────────────────┐  │  │
│  │  │ Design         │ │    │  │   ┌────────────────┐ │  │  │
│  │  │ ▼ Template     │ │    │  │   │  Desktop/Mobile │ │  │  │
│  │  │ ▼ Palette      │ │    │  │   └────────────────┘ │  │  │
│  │  │ ▼ Polices      │ │    │  │                      │  │  │
│  │  │ [✨ Régénérer] │ │    │  │  ┌──────────────────┐ │  │  │
│  │  └─────────────────┘ │    │  │  │                 │ │  │  │
│  │                     │    │  │  │   PREVIEW        │ │  │  │
│  │  ┌─────────────────┐ │    │  │  │   DU MINI-SITE  │ │  │  │
│  │  │ Textes         │ │    │  │  │                 │ │  │  │
│  │  │ ▼ Hero Headline│ │    │  │  │                 │ │  │  │
│  │  │ ▼ Hero Subtitle│ │    │  │  │                 │ │  │  │
│  │  │ ▼ About        │ │    │  │  │                 │ │  │  │
│  │  │ ▼ Specialties  │ │    │  │  │                 │ │  │  │
│  │  │ ▼ CTA Buttons  │ │    │  │  │                 │ │  │  │
│  │  │ [✨ Régénérer] │ │    │  │  └──────────────────┘ │  │  │
│  │  └─────────────────┘ │    │  │                      │  │  │
│  │                     │    │  └──────────────────────┘  │  │
│  │  ┌─────────────────┐ │    │                             │  │
│  │  │ Récompense     │ │    │                             │  │
│  │  │ ▼ Type         │ │    │  [Bouton Fermer]           │  │
│  │  │ ▼ Description  │ │    │                             │  │
│  │  │ ▼ Visites      │ │    │                             │  │
│  │  │ ▼ Validité     │ │    │                             │  │
│  │  │ ▼ Conditions   │ │    │                             │  │
│  │  │ [✨ Régénérer] │ │    │                             │  │
│  │  └─────────────────┘ │    │                             │  │
│  │                     │    │                             │  │
│  │  ┌─────────────────┐ │    │                             │  │
│  │  │ Menu           │ │    │                             │  │
│  │  │ ▼ Catégories   │ │    │                             │  │
│  │  │ [+ Ajouter]    │ │    │                             │  │
│  │  └─────────────────┘ │    │                             │  │
│  │                     │    │                             │  │
│  │  ┌─────────────────┐ │    │                             │  │
│  │  │ Formulaire     │ │    │                             │  │
│  │  │ □ Email ✓      │ │    │                             │  │
│  │  │ □ Phone ✓      │ │    │                             │  │
│  │  │ □ Name ✓       │ │    │                             │  │
│  │  ▼ Bouton texte   │ │    │                             │  │
│  │  ▼ Consentement  │ │    │                             │  │
│  │  └─────────────────┘ │    │                             │  │
│  │                     │    │                             │  │
│  │  ┌─────────────────┐ │    │                             │  │
│  │  │ QR Codes       │ │    │                             │  │
│  │  │ ▼ Taille        │ │    │                             │  │
│  │  │ ▼ Couleur       │ │    │                             │  │
│  │  └─────────────────┘ │    │                             │  │
│  │                     │    │                             │  │
│  │  ┌─────────────────┐ │    │                             │  │
│  │  │ Notifications   │ │    │                             │  │
│  │  │ □ Rappel J+3 ✓ │ │    │                             │  │
│  │  │ ▼ Message       │ │    │                             │  │
│  │  │ □ Réact. J+21 ✓│ │    │                             │  │
│  │  │ ▼ Message       │ │    │                             │  │
│  │  │ □ Réact. J+45 ✓│ │    │                             │  │
│  │  │ ▼ Message       │ │    │                             │  │
│  │  │ [✨ Régénérer] │ │    │                             │  │
│  │  └─────────────────┘ │    │                             │  │
│  │                     │    │                             │  │
│  └─────────────────────┘    └──────────────────────────────┘  │
│                                                                 │
├─────────────────────────────────────────────────────────────────┤
│ [Historique (10)]  │  ✓ Sauvegardé il y a 2s                 │
└─────────────────────────────────────────────────────────────────┘
```

## 🎨 Design des Sections

### Section Collapsible

```
┌────────────────────────────────────┐
│ 🎨 Design                    [✨]  [▼]│
├────────────────────────────────────┤
│                                    │
│ Template Grid:                     │
│ ┌────┐ ┌────┐ ┌────┐              │
│ │ M  │ │ C  │ │ V  │              │
│ │    │ │    │ │    │              │
│ └────┘ └────┘ └────┘              │
│ Mod    Clas  Vib                  │
│                                    │
│ Palette Grid:                      │
│ ┌──┐ ┌──┐ ┌──┐                   │
│ │▓▓│ │▓▓│ │▓▓│                   │
│ │▓▓│ │▓▓│ │▓▓│                   │
│ │▓▓│ │▓▓│ │▓▓│                   │
│ └──┘ └──┘ └──┘                   │
│ Vio   Ble  Ver                   │
│                                    │
└────────────────────────────────────┘
```

### Color Picker

```
┌─────────────────────────────────┐
│ Couleur principale              │
├─────────────────────────────────┤
│ ┌────┐  ┌──────────────────┐   │
│ │    │  │ #9317FD         │   │
│ │ #  │  └──────────────────┘   │
│ │▓▓▓│                            │
│ └────┘                            │
│                                   │
│ ✓ Contraste: 7.2:1 - Bon          │
└─────────────────────────────────┘
```

### Autosave Indicator

```
États:
1. ⏳ Sauvegarde...          (saving)
2. ✓ Sauvegardé il y a 2s    (saved)
3. 💾 Modifications non sauvegardées (unsaved)
```

### History Timeline (Dialog)

```
┌──────────────────────────────┐
│ Historique des versions      │
│ Les 10 dernières versions   │
├──────────────────────────────┤
│                              │
│ ┌────────────────────────┐  │
│ │ Version 1 [Actuelle]   │  │
│ │ Sauvegarde automatique │  │
│ │ 02 mars 2025 à 14:32   │  │
│ │              [🔄] [🗑]  │  │
│ └────────────────────────┘  │
│                              │
│ ┌────────────────────────┐  │
│ │ Version 2              │  │
│ │ Test changement       │  │
│ │ 02 mars 2025 à 14:15   │  │
│ │         [↩️] [🗑]       │  │
│ └────────────────────────┘  │
│                              │
└──────────────────────────────┘
```

### Preview Pane

```
┌──────────────────────────────────────┐
│ Aperçu en temps réel                │
├──────────────────────────────────────┤
│ [Desktop ●] [Mobile ○]         [✕]  │
├──────────────────────────────────────┤
│                                      │
│     ┌──────────────────────┐        │
│     │                      │        │
│     │   PREVIEW DU         │        │
│     │   MINI-SITE          │        │
│     │                      │        │
│     │   (ou Mobile)        │        │
│     │                      │        │
│     └──────────────────────┘        │
│                                      │
└──────────────────────────────────────┘
```

## 📱 Responsive Design

### Desktop (> 1024px)
- 2 colonnes: Panneau gauche (flex-1) + Panneau droite (480px fixe)
- Sections expansées par défaut
- Preview toujours visible

### Tablet (768px - 1024px)
- Panneau preview caché par défaut
- Bouton flottant pour afficher la preview
- Sections collapsibles

### Mobile (< 768px)
- Une seule colonne
- Sections toutes collapsibles
- Preview en mode overlay plein écran
- Bouton flottant pour la preview

## 🎯 UX Principles

1. **Feedback Immédiat**: Chaque modification est instantanément visible
2. **Pas de pertes**: Autosave automatique et persisté localement
3. **Flexibilité**: Tout peut être modifié à tout moment
4. **Simplicité**: Interface claire avec sections bien organisées
5. **Performance**: Debounce et optimisations pour éviter les lags

## 🔗 Navigation

- **Menu principal**: Dashboard → Settings → Editor
- **Raccourcis clavier** (à implémenter):
  - `Ctrl/Cmd + S`: Sauvegarde manuelle
  - `Ctrl/Cmd + Z`: Undo local
  - `Ctrl/Cmd + Y`: Redo local
  - `Ctrl/Cmd + P`: Toggle preview

## 📊 Status Bar

```
┌───────────────────────────────────────────────────┐
│ 📜 Historique (10)  │  ✓ Sauvegardé il y a 2s    │
└───────────────────────────────────────────────────┘
```

- **Historique**: Ouvre le dialogue des versions
- **Sauvegardé**: État actuel avec temps depuis dernière sauvegarde
- **Couleurs**:
  - Green: Sauvegardé
  - Yellow: En cours de sauvegarde
  - Gray: Non sauvegardé

## 🎨 Color Scheme

- **Primary**: Purple (#9317FD)
- **Secondary**: Pink (#E879F9)
- **Accent**: Yellow (#FCD34D)
- **Background**: Gray (#F9FAFB)
- **Text**: Dark Gray (#1F2937)
- **Border**: Light Gray (#E5E7EB)

## 🔄 États des Composants

### Bouton "Régénérer avec l'IA"
- **Normal**: Icône Sparkles + Texte violet
- **Hover**: Fond violet clair
- **Loading**: "Génération..." + spinner
- **Disabled**: Grisé

### Section Collapsible
- **Collapsed**: Chevron right, bordure grise
- **Expanded**: Chevron down, fond blanc
- **Dirty**: Petit indicateur violet (optionnel)

### Switch
- **On**: Fond violet
- **Off**: Fond gris
- **Transition**: 150ms ease-in-out
