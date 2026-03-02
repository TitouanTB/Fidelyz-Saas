'use client';

import { useEffect, useState } from 'react';
import { useEditorStore } from '@/store/editor-store';
import { useAutosave } from '@/hooks/useAutosave';
import { useAIRegenerate } from '@/hooks/useAIRegenerate';
import { SectionCollapsible } from '@/components/editor/SectionCollapsible';
import { TemplateSelector } from '@/components/editor/TemplateSelector';
import { ColorPicker } from '@/components/editor/ColorPicker';
import { AutosaveIndicator } from '@/components/editor/AutosaveIndicator';
import { HistoryTimeline } from '@/components/editor/HistoryTimeline';
import { PreviewPane } from '@/components/editor/PreviewPane';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';
import { Palette, Type, Sparkles, Award, Utensils, UserForm, QrCode, Bell, RefreshCw } from 'lucide-react';
import { toast } from 'sonner';

export default function EditorPage() {
  const editorStore = useEditorStore();

  // Custom hooks
  const { autosaveStatus, lastSavedAt } = useAutosave();
  const { regenerate, isRegenerating } = useAIRegenerate();

  // State
  const [currentOrganization, setCurrentOrganization] = useState<any>(null);

  // Selectors
  const {
    // Design
    selectedTemplate,
    selectedPalette,
    selectedFonts,
    primaryColor,
    secondaryColor,
    accentColor,
    backgroundColor,
    textColor,

    // Textes
    heroHeadline,
    heroSubtitle,
    aboutTitle,
    aboutParagraph1,
    aboutParagraph2,
    specialtyNames,
    specialtyDescriptions,
    ctaPrimary,
    ctaSecondary,

    // Récompense
    rewardType,
    rewardDescription,
    rewardVisitsRequired,
    rewardValidityDays,
    rewardConditions,

    // Menu
    menuCategories,
    menuItems,

    // Formulaire
    formEmailEnabled,
    formPhoneEnabled,
    formNameEnabled,
    formButtonText,
    formConsentText,

    // QR Codes
    qrColor,
    qrSize,

    // Notifications
    reminderDelayDays,
    reactivationDelayDays,
    reactivationDelayDays2,
    reminderEnabled,
    reactivationEnabled,
    reactivation2Enabled,
    reminderTemplate,
    reactivationTemplate,
    reactivation2Template,

    // UI
    previewMode,
    autosaveStatus,
    lastSavedAt,
    versions,
    currentVersionIndex,

    // Setters
    setSelectedTemplate,
    setSelectedPalette,
    setSelectedFonts,
    setPrimaryColor,
    setSecondaryColor,
    setAccentColor,
    setBackgroundColor,
    setTextColor,
    setHeroHeadline,
    setHeroSubtitle,
    setAboutTitle,
    setAboutParagraph1,
    setAboutParagraph2,
    setSpecialtyNames,
    setSpecialtyDescriptions,
    setCtaPrimary,
    setCtaSecondary,
    setRewardType,
    setRewardDescription,
    setRewardVisitsRequired,
    setRewardValidityDays,
    setRewardConditions,
    addMenuCategory,
    updateMenuCategory,
    deleteMenuCategory,
    reorderMenuCategories,
    addMenuItem,
    updateMenuItem,
    deleteMenuItem,
    reorderMenuItems,
    setFormEmailEnabled,
    setFormPhoneEnabled,
    setFormNameEnabled,
    setFormButtonText,
    setFormConsentText,
    setQrColor,
    setQrSize,
    setReminderDelayDays,
    setReactivationDelayDays,
    setReactivationDelayDays2,
    setReminderEnabled,
    setReactivationEnabled,
    setReactivation2Enabled,
    setReminderTemplate,
    setReactivationTemplate,
    setReactivation2Template,
    setPreviewMode,
    setAutosaveStatus,
    setLastSavedAt,
    setIsDirty,
    setPartialState,
    loadFromServer,
    saveVersion,
    restoreVersion,
  } = editorStore;

  // Load initial data
  useEffect(() => {
    async function loadEditorData() {
      try {
        const response = await fetch('/api/settings/autosave');
        if (response.ok) {
          const data = await response.json();
          if (data.data) {
            loadFromServer(data.data);
          }
        }
      } catch (error) {
        console.error('Failed to load editor data:', error);
      }
    }
    loadEditorData();
  }, [loadFromServer]);

  // Regenerate section with AI
  const handleRegenerate = async (section: string) => {
    try {
      await regenerate(section, {
        organizationName: currentOrganization?.name,
        industry: currentOrganization?.industry,
        description: currentOrganization?.description,
        currentData: editorStore,
      });
    } catch (error) {
      console.error('Regeneration failed:', error);
    }
  };

  return (
    <div className="flex h-screen bg-gray-50">
      {/* Left Panel - Controls */}
      <div className="flex-1 overflow-y-auto">
        <div className="p-6 max-w-4xl mx-auto">
          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">
                Éditeur de mini-site
              </h1>
              <p className="text-gray-600 mt-1">
                Personnalisez votre mini-site en temps réel
              </p>
            </div>
            <div className="flex items-center gap-3">
              <HistoryTimeline
                versions={versions}
                currentVersionIndex={currentVersionIndex}
                onRestore={restoreVersion}
              />
              <AutosaveIndicator status={autosaveStatus} lastSavedAt={lastSavedAt} />
            </div>
          </div>

          {/* Sections */}
          <div className="space-y-4">
            {/* Design Section */}
            <SectionCollapsible
              title="Design"
              icon={<Palette className="h-5 w-5 text-purple-600" />}
              defaultOpen={true}
            >
              <TemplateSelector
                selectedTemplate={selectedTemplate}
                selectedPalette={selectedPalette}
                selectedFonts={selectedFonts}
                onTemplateChange={setSelectedTemplate}
                onPaletteChange={setSelectedPalette}
                onFontsChange={setSelectedFonts}
              />
              {selectedPalette === 'custom' && (
                <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <ColorPicker
                    label="Couleur principale"
                    value={primaryColor || '#9317FD'}
                    onChange={setPrimaryColor}
                  />
                  <ColorPicker
                    label="Couleur secondaire"
                    value={secondaryColor || '#E879F9'}
                    onChange={setSecondaryColor}
                  />
                  <ColorPicker
                    label="Couleur d'accent"
                    value={accentColor || '#FCD34D'}
                    onChange={setAccentColor}
                  />
                  <ColorPicker
                    label="Couleur de fond"
                    value={backgroundColor || '#FFFFFF'}
                    onChange={setBackgroundColor}
                  />
                  <ColorPicker
                    label="Couleur du texte"
                    value={textColor || '#1F2937'}
                    onChange={setTextColor}
                    validateContrast={true}
                    backgroundColor={backgroundColor || '#FFFFFF'}
                  />
                </div>
              )}
            </SectionCollapsible>

            {/* Textes Section */}
            <SectionCollapsible
              title="Textes"
              icon={<Type className="h-5 w-5 text-blue-600" />}
              onRegenerate={() => handleRegenerate('hero')}
              isLoading={isRegenerating}
            >
              <div className="space-y-6">
                <div>
                  <Label>Headline Hero</Label>
                  <Input
                    value={heroHeadline}
                    onChange={(e) => setHeroHeadline(e.target.value)}
                    placeholder="Ex: Bienvenue chez {restaurant}"
                  />
                </div>
                <div>
                  <Label>Sous-titre Hero</Label>
                  <Textarea
                    value={heroSubtitle}
                    onChange={(e) => setHeroSubtitle(e.target.value)}
                    placeholder="Description courte et accrocheuse"
                    rows={2}
                  />
                </div>
                <div>
                  <Label>Titre Section À propos</Label>
                  <Input
                    value={aboutTitle}
                    onChange={(e) => setAboutTitle(e.target.value)}
                    placeholder="Ex: Notre Histoire"
                  />
                </div>
                <div>
                  <Label>Paragraphe 1 - À propos</Label>
                  <Textarea
                    value={aboutParagraph1}
                    onChange={(e) => setAboutParagraph1(e.target.value)}
                    placeholder="Premier paragraphe décrivant votre restaurant"
                    rows={3}
                  />
                </div>
                <div>
                  <Label>Paragraphe 2 - À propos</Label>
                  <Textarea
                    value={aboutParagraph2}
                    onChange={(e) => setAboutParagraph2(e.target.value)}
                    placeholder="Second paragraphe"
                    rows={3}
                  />
                </div>
                <div>
                  <Label>Noms des spécialités (une par ligne)</Label>
                  <Textarea
                    value={specialtyNames.join('\n')}
                    onChange={(e) => setSpecialtyNames(e.target.value.split('\n').filter(Boolean))}
                    placeholder="Spécialité 1&#10;Spécialité 2&#10;Spécialité 3"
                    rows={3}
                  />
                </div>
                <div>
                  <Label>Descriptions des spécialités (une par ligne)</Label>
                  <Textarea
                    value={specialtyDescriptions.join('\n')}
                    onChange={(e) => setSpecialtyDescriptions(e.target.value.split('\n').filter(Boolean))}
                    placeholder="Description 1&#10;Description 2&#10;Description 3"
                    rows={3}
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label>Bouton CTA Principal</Label>
                    <Input
                      value={ctaPrimary}
                      onChange={(e) => setCtaPrimary(e.target.value)}
                      placeholder="Ex: Commander"
                    />
                  </div>
                  <div>
                    <Label>Bouton CTA Secondaire</Label>
                    <Input
                      value={ctaSecondary}
                      onChange={(e) => setCtaSecondary(e.target.value)}
                      placeholder="Ex: En savoir plus"
                    />
                  </div>
                </div>
              </div>
            </SectionCollapsible>

            {/* Récompense Section */}
            <SectionCollapsible
              title="Récompense"
              icon={<Award className="h-5 w-5 text-yellow-600" />}
              onRegenerate={() => handleRegenerate('reward')}
              isLoading={isRegenerating}
            >
              <div className="space-y-6">
                <div>
                  <Label>Type de récompense</Label>
                  <Select value={rewardType} onValueChange={setRewardType}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="free_item">Plat offert</SelectItem>
                      <SelectItem value="discount_percent">Réduction %</SelectItem>
                      <SelectItem value="discount_fixed">Réduction €</SelectItem>
                      <SelectItem value="dessert">Dessert offert</SelectItem>
                      <SelectItem value="drink">Boisson offerte</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>Description de la récompense</Label>
                  <Textarea
                    value={rewardDescription}
                    onChange={(e) => setRewardDescription(e.target.value)}
                    placeholder="Décrivez la récompense de manière attractive"
                    rows={2}
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label>Visites requises</Label>
                    <Input
                      type="number"
                      value={rewardVisitsRequired}
                      onChange={(e) => setRewardVisitsRequired(parseInt(e.target.value) || 0)}
                      min={1}
                      max={100}
                    />
                  </div>
                  <div>
                    <Label>Validité (jours)</Label>
                    <Input
                      type="number"
                      value={rewardValidityDays}
                      onChange={(e) => setRewardValidityDays(parseInt(e.target.value) || 0)}
                      min={1}
                      max={365}
                    />
                  </div>
                </div>
                <div>
                  <Label>Conditions</Label>
                  <Textarea
                    value={rewardConditions}
                    onChange={(e) => setRewardConditions(e.target.value)}
                    placeholder="Conditions de la récompense"
                    rows={2}
                  />
                </div>
              </div>
            </SectionCollapsible>

            {/* Menu Section */}
            <SectionCollapsible
              title="Menu"
              icon={<Utensils className="h-5 w-5 text-green-600" />}
              defaultOpen={true}
            >
              <div className="space-y-6">
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <Label>Catégories</Label>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => addMenuCategory({ name: 'Nouvelle catégorie', order: menuCategories.length, isVisible: true })}
                    >
                      + Ajouter
                    </Button>
                  </div>
                  <div className="space-y-2">
                    {menuCategories.map((category) => (
                      <Card key={category.id} className="p-3">
                        <div className="flex items-center gap-2">
                          <Input
                            value={category.name}
                            onChange={(e) => updateMenuCategory(category.id, { name: e.target.value })}
                            className="flex-1"
                          />
                          <Switch
                            checked={category.isVisible}
                            onCheckedChange={(checked) => updateMenuCategory(category.id, { isVisible: checked })}
                          />
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            onClick={() => deleteMenuCategory(category.id)}
                            className="text-red-600 hover:text-red-700"
                          >
                            <RefreshCw className="h-4 w-4" />
                          </Button>
                        </div>
                      </Card>
                    ))}
                  </div>
                </div>
              </div>
            </SectionCollapsible>

            {/* Formulaire Client Section */}
            <SectionCollapsible
              title="Formulaire Client"
              icon={<UserForm className="h-5 w-5 text-indigo-600" />}
            >
              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <Label htmlFor="email-enabled">Champ Email</Label>
                  <Switch
                    id="email-enabled"
                    checked={formEmailEnabled}
                    onCheckedChange={setFormEmailEnabled}
                  />
                </div>
                <div className="flex items-center justify-between">
                  <Label htmlFor="phone-enabled">Champ Téléphone</Label>
                  <Switch
                    id="phone-enabled"
                    checked={formPhoneEnabled}
                    onCheckedChange={setFormPhoneEnabled}
                  />
                </div>
                <div className="flex items-center justify-between">
                  <Label htmlFor="name-enabled">Champ Nom</Label>
                  <Switch
                    id="name-enabled"
                    checked={formNameEnabled}
                    onCheckedChange={setFormNameEnabled}
                  />
                </div>
                <div>
                  <Label>Texte du bouton</Label>
                  <Input
                    value={formButtonText}
                    onChange={(e) => setFormButtonText(e.target.value)}
                    placeholder="Ex: S'inscrire"
                  />
                </div>
                <div>
                  <Label>Texte de consentement</Label>
                  <Textarea
                    value={formConsentText}
                    onChange={(e) => setFormConsentText(e.target.value)}
                    placeholder="J'accepte de recevoir des offres promotionnelles"
                    rows={2}
                  />
                </div>
              </div>
            </SectionCollapsible>

            {/* QR Codes Section */}
            <SectionCollapsible
              title="QR Codes"
              icon={<QrCode className="h-5 w-5 text-gray-600" />}
            >
              <div className="space-y-6">
                <div>
                  <Label>Taille du QR Code</Label>
                  <Input
                    type="number"
                    value={qrSize}
                    onChange={(e) => setQrSize(parseInt(e.target.value) || 256)}
                    min={128}
                    max={512}
                  />
                </div>
                <ColorPicker
                  label="Couleur du QR Code"
                  value={qrColor}
                  onChange={setQrColor}
                  validateContrast={true}
                  backgroundColor="#FFFFFF"
                />
              </div>
            </SectionCollapsible>

            {/* Notifications Section */}
            <SectionCollapsible
              title="Notifications"
              icon={<Bell className="h-5 w-5 text-red-600" />}
              onRegenerate={() => handleRegenerate('notifications')}
              isLoading={isRegenerating}
            >
              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <div>
                    <Label htmlFor="reminder-enabled">Rappel (J+{reminderDelayDays})</Label>
                    <p className="text-xs text-gray-500">
                      Envoyer un rappel après {reminderDelayDays} jours sans visite
                    </p>
                  </div>
                  <div className="flex items-center gap-3">
                    <Input
                      type="number"
                      value={reminderDelayDays}
                      onChange={(e) => setReminderDelayDays(parseInt(e.target.value) || 3)}
                      min={1}
                      max={30}
                      className="w-20"
                    />
                    <Switch
                      id="reminder-enabled"
                      checked={reminderEnabled}
                      onCheckedChange={setReminderEnabled}
                    />
                  </div>
                </div>
                <div>
                  <Label>Message de rappel</Label>
                  <Textarea
                    value={reminderTemplate}
                    onChange={(e) => setReminderTemplate(e.target.value)}
                    rows={3}
                  />
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <Label htmlFor="reactivation-enabled">Réactivation (J+{reactivationDelayDays})</Label>
                    <p className="text-xs text-gray-500">
                      Envoyer une réactivation après {reactivationDelayDays} jours sans visite
                    </p>
                  </div>
                  <div className="flex items-center gap-3">
                    <Input
                      type="number"
                      value={reactivationDelayDays}
                      onChange={(e) => setReactivationDelayDays(parseInt(e.target.value) || 21)}
                      min={1}
                      max={90}
                      className="w-20"
                    />
                    <Switch
                      id="reactivation-enabled"
                      checked={reactivationEnabled}
                      onCheckedChange={setReactivationEnabled}
                    />
                  </div>
                </div>
                <div>
                  <Label>Message de réactivation</Label>
                  <Textarea
                    value={reactivationTemplate}
                    onChange={(e) => setReactivationTemplate(e.target.value)}
                    rows={3}
                  />
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <Label htmlFor="reactivation2-enabled">Réactivation 2 (J+{reactivationDelayDays2})</Label>
                    <p className="text-xs text-gray-500">
                      Dernier rappel après {reactivationDelayDays2} jours
                    </p>
                  </div>
                  <div className="flex items-center gap-3">
                    <Input
                      type="number"
                      value={reactivationDelayDays2}
                      onChange={(e) => setReactivationDelayDays2(parseInt(e.target.value) || 45)}
                      min={1}
                      max={180}
                      className="w-20"
                    />
                    <Switch
                      id="reactivation2-enabled"
                      checked={reactivation2Enabled}
                      onCheckedChange={setReactivation2Enabled}
                    />
                  </div>
                </div>
                <div>
                  <Label>Message de réactivation 2</Label>
                  <Textarea
                    value={reactivation2Template}
                    onChange={(e) => setReactivation2Template(e.target.value)}
                    rows={3}
                  />
                </div>
              </div>
            </SectionCollapsible>
          </div>
        </div>
      </div>

      {/* Right Panel - Preview */}
      <div className="hidden lg:block w-[480px] bg-gray-100 p-4">
        <PreviewPane />
      </div>
    </div>
  );
}
