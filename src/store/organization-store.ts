import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { Organization, Plan } from "@/types";

interface OrganizationState {
  currentOrganization: Organization | null;
  organizations: Organization[];
  isLoading: boolean;
  setCurrentOrganization: (organization: Organization | null) => void;
  setOrganizations: (organizations: Organization[]) => void;
  addOrganization: (organization: Organization) => void;
  updateOrganization: (id: string, data: Partial<Organization>) => void;
  removeOrganization: (id: string) => void;
  setLoading: (loading: boolean) => void;
}

export const useOrganizationStore = create<OrganizationState>()(
  persist(
    (set) => ({
      currentOrganization: null,
      organizations: [],
      isLoading: false,
      setCurrentOrganization: (organization) =>
        set({ currentOrganization: organization }),
      setOrganizations: (organizations) => set({ organizations }),
      addOrganization: (organization) =>
        set((state) => ({
          organizations: [...state.organizations, organization],
        })),
      updateOrganization: (id, data) =>
        set((state) => ({
          organizations: state.organizations.map((org) =>
            org.id === id ? { ...org, ...data } : org
          ),
          currentOrganization:
            state.currentOrganization?.id === id
              ? { ...state.currentOrganization, ...data }
              : state.currentOrganization,
        })),
      removeOrganization: (id) =>
        set((state) => ({
          organizations: state.organizations.filter((org) => org.id !== id),
          currentOrganization:
            state.currentOrganization?.id === id
              ? null
              : state.currentOrganization,
        })),
      setLoading: (loading) => set({ isLoading: loading }),
    }),
    {
      name: "fidelyz-organization",
      partialize: (state) => ({
        currentOrganization: state.currentOrganization,
        organizations: state.organizations,
      }),
    }
  )
);