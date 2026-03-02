import { create } from "zustand";
import { persist } from "zustand/middleware";

export interface MenuItem {
  id: string;
  categoryId: string;
  name: string;
  description?: string;
  price: number;
  imageUrl?: string;
  allergens: string[];
  isAvailable: boolean;
  isVegetarian?: boolean;
  isSpicy?: boolean;
  isSignature?: boolean;
  isNew?: boolean;
  order: number;
}

export interface Version {
  id: string;
  timestamp: Date;
  data: EditorState;
  description?: string;
}

export interface EditorState {
  // Design
  selectedTemplate: string;
  selectedPalette: string;
  selectedFonts: string;
  primaryColor?: string;
  secondaryColor?: string;
  accentColor?: string;
  backgroundColor?: string;
  textColor?: string;

  // Textes
  heroHeadline: string;
  heroSubtitle: string;
  aboutTitle: string;
  aboutParagraph1: string;
  aboutParagraph2: string;
  specialtyNames: string[];
  specialtyDescriptions: string[];
  ctaPrimary: string;
  ctaSecondary: string;

  // Récompense
  rewardType: string;
  rewardDescription: string;
  rewardVisitsRequired: number;
  rewardValidityDays: number;
  rewardConditions: string;

  // Menu
  menuCategories: Array<{
    id: string;
    name: string;
    order: number;
    isVisible: boolean;
  }>;
  menuItems: MenuItem[];

  // Formulaire Client
  formEmailEnabled: boolean;
  formPhoneEnabled: boolean;
  formNameEnabled: boolean;
  formButtonText: string;
  formConsentText: string;

  // QR Codes
  qrColor: string;
  qrSize: number;

  // Notifications
  reminderDelayDays: number;
  reactivationDelayDays: number;
  reactivationDelayDays2: number;
  reminderEnabled: boolean;
  reactivationEnabled: boolean;
  reactivation2Enabled: boolean;
  reminderTemplate: string;
  reactivationTemplate: string;
  reactivation2Template: string;

  // UI
  previewMode: 'mobile' | 'desktop';
  autosaveStatus: 'saved' | 'saving' | 'unsaved';
  lastSavedAt: Date | null;
  isDirty: boolean;
  versions: Version[];
  currentVersionIndex: number;
}

const defaultState: Omit<EditorState, 'versions' | 'currentVersionIndex' | 'lastSavedAt'> = {
  // Design
  selectedTemplate: 'modern',
  selectedPalette: 'violet',
  selectedFonts: 'inter-poppins',
  primaryColor: '#9317FD',
  secondaryColor: '#E879F9',
  accentColor: '#FCD34D',
  backgroundColor: '#FFFFFF',
  textColor: '#1F2937',

  // Textes
  heroHeadline: 'Bienvenue chez {restaurant}',
  heroSubtitle: 'Découvrez nos plats et gagnez des récompenses à chaque visite',
  aboutTitle: 'Notre Histoire',
  aboutParagraph1: 'Passionnés par la cuisine depuis plus de 20 ans',
  aboutParagraph2: 'Nous utilisons des produits frais et locaux pour vous proposer une cuisine authentique',
  specialtyNames: ['Spécialité 1', 'Spécialité 2', 'Spécialité 3'],
  specialtyDescriptions: ['Description 1', 'Description 2', 'Description 3'],
  ctaPrimary: 'Commander maintenant',
  ctaSecondary: 'En savoir plus',

  // Récompense
  rewardType: 'free_item',
  rewardDescription: 'Un plat offert après 10 visites',
  rewardVisitsRequired: 10,
  rewardValidityDays: 30,
  rewardConditions: 'Non cumulable avec autres offres',

  // Menu
  menuCategories: [
    { id: 'cat-1', name: 'Entrées', order: 0, isVisible: true },
    { id: 'cat-2', name: 'Plats', order: 1, isVisible: true },
    { id: 'cat-3', name: 'Desserts', order: 2, isVisible: true },
  ],
  menuItems: [],

  // Formulaire Client
  formEmailEnabled: true,
  formPhoneEnabled: true,
  formNameEnabled: true,
  formButtonText: 'S\'inscrire',
  formConsentText: 'J\'accepte de recevoir des offres promotionnelles',

  // QR Codes
  qrColor: '#000000',
  qrSize: 256,

  // Notifications
  reminderDelayDays: 3,
  reactivationDelayDays: 21,
  reactivationDelayDays2: 45,
  reminderEnabled: true,
  reactivationEnabled: true,
  reactivation2Enabled: true,
  reminderTemplate: 'Coucou ! Cela fait un moment qu\'on ne vous a pas vu. On a hâte de vous revoir !',
  reactivationTemplate: 'On vous a manqué ? Revenez nous voir et profitez d\'une offre spéciale !',
  reactivation2Template: 'Une petite faim ? Nos plats vous attendent avec une surprise !',

  // UI
  previewMode: 'desktop',
  autosaveStatus: 'saved',
  isDirty: false,
};

interface EditorActions {
  // Design setters
  setSelectedTemplate: (template: string) => void;
  setSelectedPalette: (palette: string) => void;
  setSelectedFonts: (fonts: string) => void;
  setPrimaryColor: (color: string) => void;
  setSecondaryColor: (color: string) => void;
  setAccentColor: (color: string) => void;
  setBackgroundColor: (color: string) => void;
  setTextColor: (color: string) => void;

  // Text setters
  setHeroHeadline: (text: string) => void;
  setHeroSubtitle: (text: string) => void;
  setAboutTitle: (text: string) => void;
  setAboutParagraph1: (text: string) => void;
  setAboutParagraph2: (text: string) => void;
  setSpecialtyNames: (names: string[]) => void;
  setSpecialtyDescriptions: (descriptions: string[]) => void;
  setCtaPrimary: (text: string) => void;
  setCtaSecondary: (text: string) => void;

  // Reward setters
  setRewardType: (type: string) => void;
  setRewardDescription: (description: string) => void;
  setRewardVisitsRequired: (visits: number) => void;
  setRewardValidityDays: (days: number) => void;
  setRewardConditions: (conditions: string) => void;

  // Menu setters
  addMenuCategory: (category: Omit<EditorState['menuCategories'][0], 'id'>) => void;
  updateMenuCategory: (id: string, data: Partial<EditorState['menuCategories'][0]>) => void;
  deleteMenuCategory: (id: string) => void;
  reorderMenuCategories: (categories: EditorState['menuCategories']) => void;
  addMenuItem: (item: Omit<MenuItem, 'id'>) => void;
  updateMenuItem: (id: string, data: Partial<MenuItem>) => void;
  deleteMenuItem: (id: string) => void;
  reorderMenuItems: (items: MenuItem[]) => void;

  // Form setters
  setFormEmailEnabled: (enabled: boolean) => void;
  setFormPhoneEnabled: (enabled: boolean) => void;
  setFormNameEnabled: (enabled: boolean) => void;
  setFormButtonText: (text: string) => void;
  setFormConsentText: (text: string) => void;

  // QR Code setters
  setQrColor: (color: string) => void;
  setQrSize: (size: number) => void;

  // Notification setters
  setReminderDelayDays: (days: number) => void;
  setReactivationDelayDays: (days: number) => void;
  setReactivationDelayDays2: (days: number) => void;
  setReminderEnabled: (enabled: boolean) => void;
  setReactivationEnabled: (enabled: boolean) => void;
  setReactivation2Enabled: (enabled: boolean) => void;
  setReminderTemplate: (template: string) => void;
  setReactivationTemplate: (template: string) => void;
  setReactivation2Template: (template: string) => void;

  // UI setters
  setPreviewMode: (mode: 'mobile' | 'desktop') => void;
  setAutosaveStatus: (status: 'saved' | 'saving' | 'unsaved') => void;
  setLastSavedAt: (date: Date | null) => void;
  setIsDirty: (dirty: boolean) => void;

  // Bulk actions
  setPartialState: (updates: Partial<EditorState>) => void;
  loadFromServer: (data: Partial<EditorState>) => void;

  // Version history
  saveVersion: (description?: string) => void;
  restoreVersion: (index: number) => void;
  getVersions: () => Version[];

  // Reset
  reset: () => void;
}

export type EditorStore = EditorState & EditorActions;

export const useEditorStore = create<EditorStore>()(
  persist(
    (set, get) => ({
      ...defaultState,
      lastSavedAt: null,
      versions: [],
      currentVersionIndex: -1,

      // Design setters
      setSelectedTemplate: (template) => set({ selectedTemplate: template, isDirty: true, autosaveStatus: 'unsaved' }),
      setSelectedPalette: (palette) => set({ selectedPalette: palette, isDirty: true, autosaveStatus: 'unsaved' }),
      setSelectedFonts: (fonts) => set({ selectedFonts: fonts, isDirty: true, autosaveStatus: 'unsaved' }),
      setPrimaryColor: (color) => set({ primaryColor: color, isDirty: true, autosaveStatus: 'unsaved' }),
      setSecondaryColor: (color) => set({ secondaryColor: color, isDirty: true, autosaveStatus: 'unsaved' }),
      setAccentColor: (color) => set({ accentColor: color, isDirty: true, autosaveStatus: 'unsaved' }),
      setBackgroundColor: (color) => set({ backgroundColor: color, isDirty: true, autosaveStatus: 'unsaved' }),
      setTextColor: (color) => set({ textColor: color, isDirty: true, autosaveStatus: 'unsaved' }),

      // Text setters
      setHeroHeadline: (text) => set({ heroHeadline: text, isDirty: true, autosaveStatus: 'unsaved' }),
      setHeroSubtitle: (text) => set({ heroSubtitle: text, isDirty: true, autosaveStatus: 'unsaved' }),
      setAboutTitle: (text) => set({ aboutTitle: text, isDirty: true, autosaveStatus: 'unsaved' }),
      setAboutParagraph1: (text) => set({ aboutParagraph1: text, isDirty: true, autosaveStatus: 'unsaved' }),
      setAboutParagraph2: (text) => set({ aboutParagraph2: text, isDirty: true, autosaveStatus: 'unsaved' }),
      setSpecialtyNames: (names) => set({ specialtyNames: names, isDirty: true, autosaveStatus: 'unsaved' }),
      setSpecialtyDescriptions: (descriptions) => set({ specialtyDescriptions: descriptions, isDirty: true, autosaveStatus: 'unsaved' }),
      setCtaPrimary: (text) => set({ ctaPrimary: text, isDirty: true, autosaveStatus: 'unsaved' }),
      setCtaSecondary: (text) => set({ ctaSecondary: text, isDirty: true, autosaveStatus: 'unsaved' }),

      // Reward setters
      setRewardType: (type) => set({ rewardType: type, isDirty: true, autosaveStatus: 'unsaved' }),
      setRewardDescription: (description) => set({ rewardDescription: description, isDirty: true, autosaveStatus: 'unsaved' }),
      setRewardVisitsRequired: (visits) => set({ rewardVisitsRequired: visits, isDirty: true, autosaveStatus: 'unsaved' }),
      setRewardValidityDays: (days) => set({ rewardValidityDays: days, isDirty: true, autosaveStatus: 'unsaved' }),
      setRewardConditions: (conditions) => set({ rewardConditions: conditions, isDirty: true, autosaveStatus: 'unsaved' }),

      // Menu setters
      addMenuCategory: (category) =>
        set((state) => ({
          menuCategories: [
            ...state.menuCategories,
            { ...category, id: `cat-${Date.now()}` },
          ],
          isDirty: true,
          autosaveStatus: 'unsaved',
        })),
      updateMenuCategory: (id, data) =>
        set((state) => ({
          menuCategories: state.menuCategories.map((cat) =>
            cat.id === id ? { ...cat, ...data } : cat
          ),
          isDirty: true,
          autosaveStatus: 'unsaved',
        })),
      deleteMenuCategory: (id) =>
        set((state) => ({
          menuCategories: state.menuCategories.filter((cat) => cat.id !== id),
          menuItems: state.menuItems.filter((item) => item.categoryId !== id),
          isDirty: true,
          autosaveStatus: 'unsaved',
        })),
      reorderMenuCategories: (categories) =>
        set({ menuCategories: categories, isDirty: true, autosaveStatus: 'unsaved' }),
      addMenuItem: (item) =>
        set((state) => ({
          menuItems: [...state.menuItems, { ...item, id: `item-${Date.now()}` }],
          isDirty: true,
          autosaveStatus: 'unsaved',
        })),
      updateMenuItem: (id, data) =>
        set((state) => ({
          menuItems: state.menuItems.map((item) =>
            item.id === id ? { ...item, ...data } : item
          ),
          isDirty: true,
          autosaveStatus: 'unsaved',
        })),
      deleteMenuItem: (id) =>
        set((state) => ({
          menuItems: state.menuItems.filter((item) => item.id !== id),
          isDirty: true,
          autosaveStatus: 'unsaved',
        })),
      reorderMenuItems: (items) =>
        set({ menuItems: items, isDirty: true, autosaveStatus: 'unsaved' }),

      // Form setters
      setFormEmailEnabled: (enabled) => set({ formEmailEnabled: enabled, isDirty: true, autosaveStatus: 'unsaved' }),
      setFormPhoneEnabled: (enabled) => set({ formPhoneEnabled: enabled, isDirty: true, autosaveStatus: 'unsaved' }),
      setFormNameEnabled: (enabled) => set({ formNameEnabled: enabled, isDirty: true, autosaveStatus: 'unsaved' }),
      setFormButtonText: (text) => set({ formButtonText: text, isDirty: true, autosaveStatus: 'unsaved' }),
      setFormConsentText: (text) => set({ formConsentText: text, isDirty: true, autosaveStatus: 'unsaved' }),

      // QR Code setters
      setQrColor: (color) => set({ qrColor: color, isDirty: true, autosaveStatus: 'unsaved' }),
      setQrSize: (size) => set({ qrSize: size, isDirty: true, autosaveStatus: 'unsaved' }),

      // Notification setters
      setReminderDelayDays: (days) => set({ reminderDelayDays: days, isDirty: true, autosaveStatus: 'unsaved' }),
      setReactivationDelayDays: (days) => set({ reactivationDelayDays: days, isDirty: true, autosaveStatus: 'unsaved' }),
      setReactivationDelayDays2: (days) => set({ reactivationDelayDays2: days, isDirty: true, autosaveStatus: 'unsaved' }),
      setReminderEnabled: (enabled) => set({ reminderEnabled: enabled, isDirty: true, autosaveStatus: 'unsaved' }),
      setReactivationEnabled: (enabled) => set({ reactivationEnabled: enabled, isDirty: true, autosaveStatus: 'unsaved' }),
      setReactivation2Enabled: (enabled) => set({ reactivation2Enabled: enabled, isDirty: true, autosaveStatus: 'unsaved' }),
      setReminderTemplate: (template) => set({ reminderTemplate: template, isDirty: true, autosaveStatus: 'unsaved' }),
      setReactivationTemplate: (template) => set({ reactivationTemplate: template, isDirty: true, autosaveStatus: 'unsaved' }),
      setReactivation2Template: (template) => set({ reactivation2Template: template, isDirty: true, autosaveStatus: 'unsaved' }),

      // UI setters
      setPreviewMode: (mode) => set({ previewMode: mode }),
      setAutosaveStatus: (status) => set({ autosaveStatus: status }),
      setLastSavedAt: (date) => set({ lastSavedAt: date }),
      setIsDirty: (dirty) => set({ isDirty: dirty }),

      // Bulk actions
      setPartialState: (updates) => set({ ...updates, isDirty: true, autosaveStatus: 'unsaved' }),
      loadFromServer: (data) => set({ ...data, isDirty: false, autosaveStatus: 'saved' }),

      // Version history
      saveVersion: (description) =>
        set((state) => {
          const version: Version = {
            id: `v-${Date.now()}`,
            timestamp: new Date(),
            data: { ...state, versions: [], currentVersionIndex: -1 },
            description,
          };
          const versions = [version, ...state.versions].slice(0, 10);
          return { versions, currentVersionIndex: 0 };
        }),
      restoreVersion: (index) =>
        set((state) => {
          if (index >= 0 && index < state.versions.length) {
            const version = state.versions[index];
            return {
              ...version.data,
              versions: state.versions,
              currentVersionIndex: index,
              isDirty: true,
              autosaveStatus: 'unsaved',
            };
          }
          return state;
        }),
      getVersions: () => get().versions,

      // Reset
      reset: () =>
        set({
          ...defaultState,
          versions: [],
          currentVersionIndex: -1,
          lastSavedAt: null,
        }),
    }),
    {
      name: 'fidelyz-editor',
      partialize: (state) => ({
        // Persist everything except transient UI states
        ...state,
      }),
    }
  )
);
