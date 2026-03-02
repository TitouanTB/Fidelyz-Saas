import { describe, it, expect, beforeEach } from "vitest";
import { useEditorStore } from "@/store/editor-store";

describe("useEditorStore", () => {
  beforeEach(() => {
    // Reset the store before each test
    useEditorStore.getState().reset();
  });

  it("initializes with default state", () => {
    const state = useEditorStore.getState();
    expect(state.selectedTemplate).toBe("modern");
    expect(state.selectedPalette).toBe("violet");
    expect(state.heroHeadline).toBe("Bienvenue chez {restaurant}");
    expect(state.isDirty).toBe(false);
    expect(state.autosaveStatus).toBe("saved");
  });

  it("updates design settings", () => {
    useEditorStore.getState().setSelectedTemplate("classic");
    expect(useEditorStore.getState().selectedTemplate).toBe("classic");
    expect(useEditorStore.getState().isDirty).toBe(true);
    expect(useEditorStore.getState().autosaveStatus).toBe("unsaved");
  });

  it("updates text settings", () => {
    useEditorStore.getState().setHeroHeadline("New Headline");
    expect(useEditorStore.getState().heroHeadline).toBe("New Headline");
    expect(useEditorStore.getState().isDirty).toBe(true);
  });

  it("updates reward settings", () => {
    useEditorStore.getState().setRewardType("discount_percent");
    expect(useEditorStore.getState().rewardType).toBe("discount_percent");
  });

  it("adds menu category", () => {
    const initialLength = useEditorStore.getState().menuCategories.length;
    useEditorStore.getState().addMenuCategory({
      name: "New Category",
      order: 3,
      isVisible: true,
    });
    expect(useEditorStore.getState().menuCategories.length).toBe(initialLength + 1);
  });

  it("updates menu category", () => {
    const categoryId = useEditorStore.getState().menuCategories[0].id;
    useEditorStore.getState().updateMenuCategory(categoryId, { name: "Updated Name" });
    const category = useEditorStore.getState().menuCategories.find((c) => c.id === categoryId);
    expect(category?.name).toBe("Updated Name");
  });

  it("deletes menu category", () => {
    const categoryId = useEditorStore.getState().menuCategories[0].id;
    useEditorStore.getState().deleteMenuCategory(categoryId);
    const category = useEditorStore.getState().menuCategories.find((c) => c.id === categoryId);
    expect(category).toBeUndefined();
  });

  it("updates form settings", () => {
    useEditorStore.getState().setFormEmailEnabled(false);
    expect(useEditorStore.getState().formEmailEnabled).toBe(false);
  });

  it("updates notification settings", () => {
    useEditorStore.getState().setReminderDelayDays(5);
    expect(useEditorStore.getState().reminderDelayDays).toBe(5);
  });

  it("updates color settings", () => {
    useEditorStore.getState().setPrimaryColor("#FF0000");
    expect(useEditorStore.getState().primaryColor).toBe("#FF0000");
  });

  it("saves version", () => {
    useEditorStore.getState().saveVersion("Test version");
    const versions = useEditorStore.getState().versions;
    expect(versions.length).toBe(1);
    expect(versions[0].description).toBe("Test version");
  });

  it("limits to 10 versions", () => {
    for (let i = 0; i < 15; i++) {
      useEditorStore.getState().saveVersion(`Version ${i}`);
    }
    const versions = useEditorStore.getState().versions;
    expect(versions.length).toBe(10);
  });

  it("restores version", () => {
    useEditorStore.getState().setHeroHeadline("Original");
    useEditorStore.getState().saveVersion("Original version");

    useEditorStore.getState().setHeroHeadline("Modified");
    expect(useEditorStore.getState().heroHeadline).toBe("Modified");

    useEditorStore.getState().restoreVersion(0);
    expect(useEditorStore.getState().heroHeadline).toBe("Original");
  });

  it("sets partial state", () => {
    useEditorStore.getState().setPartialState({
      heroHeadline: "Partial Update",
      selectedTemplate: "minimal",
    });
    const state = useEditorStore.getState();
    expect(state.heroHeadline).toBe("Partial Update");
    expect(state.selectedTemplate).toBe("minimal");
  });

  it("loads from server", () => {
    useEditorStore.getState().loadFromServer({
      heroHeadline: "Server Data",
      selectedTemplate: "vibrant",
    });
    const state = useEditorStore.getState();
    expect(state.heroHeadline).toBe("Server Data");
    expect(state.selectedTemplate).toBe("vibrant");
    expect(state.isDirty).toBe(false);
  });

  it("resets to default state", () => {
    useEditorStore.getState().setHeroHeadline("Custom");
    useEditorStore.getState().setSelectedTemplate("classic");

    useEditorStore.getState().reset();

    const state = useEditorStore.getState();
    expect(state.heroHeadline).toBe("Bienvenue chez {restaurant}");
    expect(state.selectedTemplate).toBe("modern");
    expect(state.versions).toHaveLength(0);
  });
});
