import { describe, it, expect, beforeEach } from "vitest";
import { useUIStore } from "@/store/ui-store";

describe("useUIStore", () => {
  beforeEach(() => {
    useUIStore.setState({
      modals: {},
      sidebarOpen: true,
    });
  });

  it("should have initial state", () => {
    const state = useUIStore.getState();
    expect(state.modals).toEqual({});
    expect(state.sidebarOpen).toBe(true);
  });

  it("should open modal", () => {
    useUIStore.getState().openModal("test-modal");
    
    const state = useUIStore.getState();
    expect(state.modals["test-modal"]).toBe(true);
  });

  it("should close modal", () => {
    useUIStore.setState({ modals: { "test-modal": true } });
    
    useUIStore.getState().closeModal("test-modal");
    
    const state = useUIStore.getState();
    expect(state.modals["test-modal"]).toBe(false);
  });

  it("should toggle modal", () => {
    useUIStore.getState().toggleModal("test-modal");
    expect(useUIStore.getState().modals["test-modal"]).toBe(true);
    
    useUIStore.getState().toggleModal("test-modal");
    expect(useUIStore.getState().modals["test-modal"]).toBe(false);
  });

  it("should toggle sidebar", () => {
    useUIStore.setState({ sidebarOpen: true });
    
    useUIStore.getState().toggleSidebar();
    expect(useUIStore.getState().sidebarOpen).toBe(false);
    
    useUIStore.getState().toggleSidebar();
    expect(useUIStore.getState().sidebarOpen).toBe(true);
  });

  it("should set sidebar open state", () => {
    useUIStore.getState().setSidebarOpen(false);
    expect(useUIStore.getState().sidebarOpen).toBe(false);
    
    useUIStore.getState().setSidebarOpen(true);
    expect(useUIStore.getState().sidebarOpen).toBe(true);
  });

  it("should handle multiple modals independently", () => {
    useUIStore.getState().openModal("modal-1");
    useUIStore.getState().openModal("modal-2");
    useUIStore.getState().closeModal("modal-1");
    
    const state = useUIStore.getState();
    expect(state.modals["modal-1"]).toBe(false);
    expect(state.modals["modal-2"]).toBe(true);
  });
});
