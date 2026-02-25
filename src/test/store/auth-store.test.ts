import { describe, it, expect, beforeEach } from "vitest";
import { useAuthStore } from "@/store/auth-store";

describe("useAuthStore", () => {
  beforeEach(() => {
    // Reset the store to initial state
    useAuthStore.setState({
      user: null,
      isAuthenticated: false,
      isLoading: false, // Set to false for test (persisted state)
    });
  });

  it("should have initial state", () => {
    const state = useAuthStore.getState();
    expect(state.user).toBeNull();
    expect(state.isAuthenticated).toBe(false);
    // Note: isLoading initial value is true but gets set to false after hydration
  });

  it("should set user and update isAuthenticated", () => {
    const mockUser = { id: "user_123", email: "test@example.com" } as any;
    
    useAuthStore.getState().setUser(mockUser);
    
    const state = useAuthStore.getState();
    expect(state.user).toEqual(mockUser);
    expect(state.isAuthenticated).toBe(true);
    expect(state.isLoading).toBe(false);
  });

  it("should set loading state", () => {
    useAuthStore.getState().setLoading(true);
    expect(useAuthStore.getState().isLoading).toBe(true);
    
    useAuthStore.getState().setLoading(false);
    expect(useAuthStore.getState().isLoading).toBe(false);
  });

  it("should clear auth state", () => {
    const mockUser = { id: "user_123" } as any;
    useAuthStore.getState().setUser(mockUser);
    
    useAuthStore.getState().clearAuth();
    
    const state = useAuthStore.getState();
    expect(state.user).toBeNull();
    expect(state.isAuthenticated).toBe(false);
    expect(state.isLoading).toBe(false);
  });

  it("should set null user and update isAuthenticated to false", () => {
    const mockUser = { id: "user_123" } as any;
    useAuthStore.getState().setUser(mockUser);
    
    useAuthStore.getState().setUser(null);
    
    const state = useAuthStore.getState();
    expect(state.user).toBeNull();
    expect(state.isAuthenticated).toBe(false);
  });
});
