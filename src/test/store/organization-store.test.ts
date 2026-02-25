import { describe, it, expect, beforeEach } from "vitest";
import { useOrganizationStore } from "@/store/organization-store";

const mockOrganization = {
  id: "org_123",
  name: "Test Org",
  slug: "test-org",
  plan: "FREE" as const,
};

describe("useOrganizationStore", () => {
  beforeEach(() => {
    useOrganizationStore.setState({
      currentOrganization: null,
      organizations: [],
      isLoading: false,
    });
  });

  it("should have initial state", () => {
    const state = useOrganizationStore.getState();
    expect(state.currentOrganization).toBeNull();
    expect(state.organizations).toEqual([]);
    expect(state.isLoading).toBe(false);
  });

  it("should set current organization", () => {
    useOrganizationStore.getState().setCurrentOrganization(mockOrganization);
    
    const state = useOrganizationStore.getState();
    expect(state.currentOrganization).toEqual(mockOrganization);
  });

  it("should set organizations list", () => {
    const orgs = [
      { ...mockOrganization, id: "org_1" },
      { ...mockOrganization, id: "org_2" },
    ];
    
    useOrganizationStore.getState().setOrganizations(orgs);
    
    const state = useOrganizationStore.getState();
    expect(state.organizations).toEqual(orgs);
    expect(state.organizations).toHaveLength(2);
  });

  it("should add organization", () => {
    useOrganizationStore.getState().addOrganization(mockOrganization);
    
    const state = useOrganizationStore.getState();
    expect(state.organizations).toHaveLength(1);
    expect(state.organizations[0]).toEqual(mockOrganization);
  });

  it("should update organization", () => {
    useOrganizationStore.setState({
      organizations: [mockOrganization],
      currentOrganization: mockOrganization,
    });
    
    useOrganizationStore.getState().updateOrganization("org_123", { name: "Updated Org" });
    
    const state = useOrganizationStore.getState();
    expect(state.organizations[0].name).toBe("Updated Org");
    expect(state.currentOrganization?.name).toBe("Updated Org");
  });

  it("should not update currentOrganization if ID doesn't match", () => {
    useOrganizationStore.setState({
      organizations: [mockOrganization],
      currentOrganization: mockOrganization,
    });
    
    useOrganizationStore.getState().updateOrganization("org_999", { name: "Updated Org" });
    
    const state = useOrganizationStore.getState();
    expect(state.currentOrganization?.name).toBe("Test Org");
  });

  it("should remove organization", () => {
    useOrganizationStore.setState({
      organizations: [
        { ...mockOrganization, id: "org_1" },
        { ...mockOrganization, id: "org_2" },
      ],
      currentOrganization: { ...mockOrganization, id: "org_1" },
    });
    
    useOrganizationStore.getState().removeOrganization("org_1");
    
    const state = useOrganizationStore.getState();
    expect(state.organizations).toHaveLength(1);
    expect(state.organizations[0].id).toBe("org_2");
    expect(state.currentOrganization).toBeNull();
  });

  it("should not clear currentOrganization if removed org is different", () => {
    useOrganizationStore.setState({
      organizations: [{ ...mockOrganization, id: "org_1" }],
      currentOrganization: { ...mockOrganization, id: "org_2" },
    });
    
    useOrganizationStore.getState().removeOrganization("org_1");
    
    const state = useOrganizationStore.getState();
    expect(state.currentOrganization?.id).toBe("org_2");
  });

  it("should set loading state", () => {
    useOrganizationStore.getState().setLoading(true);
    expect(useOrganizationStore.getState().isLoading).toBe(true);
    
    useOrganizationStore.getState().setLoading(false);
    expect(useOrganizationStore.getState().isLoading).toBe(false);
  });
});
