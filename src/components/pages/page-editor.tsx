"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, Eye, Save, Palette, Layout, Type, Image, Settings } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { toast } from "sonner";
import { PublicPage, Reward, LoyaltyConfig } from "@prisma/client";
import { generateSlug } from "@/lib/utils";
import { MiniSiteEditor } from "./editors/mini-site-editor";
import { DigitalMenuEditor } from "./editors/digital-menu-editor";

interface PageEditorProps {
  page?: PublicPage;
  organization: {
    name: string;
    slug: string;
    primaryColor: string;
    logoUrl?: string | null;
    description?: string | null;
  };
  rewards: Reward[];
  loyaltyConfig: LoyaltyConfig | null;
}

const pageTypes = [
  { value: "mini-site", label: "Mini Site", description: "Landing page with hero, benefits, and CTA" },
  { value: "menu", label: "Digital Menu", description: "Interactive menu with categories and products" },
  { value: "rewards", label: "Rewards Flow", description: "Page for customers to claim rewards" },
  { value: "portal", label: "Customer Portal", description: "Customer account dashboard" },
];

export function PageEditor({ page, organization, rewards, loyaltyConfig }: PageEditorProps) {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [activeTab, setActiveTab] = useState("content");

  const existingContent = page?.content as Record<string, unknown> | null;

  const [title, setTitle] = useState(page?.title || "");
  const [slug, setSlug] = useState(page?.slug || "");
  const [description, setDescription] = useState(page?.description || "");
  const [pageType, setPageType] = useState((existingContent?.pageType as string) || "mini-site");
  const [isActive, setIsActive] = useState(page?.isActive ?? true);
  const [isPublished, setIsPublished] = useState(page?.isPublished ?? false);

  const [theme, setTheme] = useState({
    primaryColor: (existingContent?.theme as Record<string, string>)?.primaryColor || organization.primaryColor,
    secondaryColor: (existingContent?.theme as Record<string, string>)?.secondaryColor || "#8b5cf6",
    accentColor: (existingContent?.theme as Record<string, string>)?.accentColor || "#f59e0b",
  });

  const [pageContent, setPageContent] = useState<Record<string, unknown>>(
    existingContent || {}
  );

  useEffect(() => {
    if (title && !page && !slug) {
      setSlug(generateSlug(title));
    }
  }, [title, page, slug]);

  const handleSave = async (publish = false) => {
    if (!title.trim()) {
      toast.error("Please enter a page title");
      return;
    }

    setIsLoading(true);
    try {
      const content = {
        ...pageContent,
        pageType,
        theme,
      };

      const body = {
        title,
        slug: slug || generateSlug(title),
        description,
        pageType,
        content,
        isActive,
        isPublished: publish ? true : isPublished,
      };

      const url = page ? `/api/pages/${page.id}` : "/api/pages";
      const method = page ? "PUT" : "POST";

      const response = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });

      if (response.ok) {
        toast.success(publish ? "Page published successfully" : "Page saved successfully");
        if (!page) {
          const data = await response.json();
          router.push(`/settings/pages/${data.page.id}`);
        } else {
          router.refresh();
        }
      } else {
        const error = await response.json();
        toast.error(error.error || "Failed to save page");
      }
    } catch (error) {
      console.error("Save error:", error);
      toast.error("Failed to save page");
    } finally {
      setIsLoading(false);
    }
  };

  const renderContentEditor = () => {
    switch (pageType) {
      case "menu":
        return (
          <DigitalMenuEditor
            content={pageContent}
            onChange={setPageContent}
          />
        );
      case "mini-site":
      default:
        return (
          <MiniSiteEditor
            content={pageContent}
            onChange={setPageContent}
            organization={organization}
            loyaltyConfig={loyaltyConfig}
            rewards={rewards}
          />
        );
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => router.push("/settings/pages")}
          >
            <ArrowLeft className="w-4 h-4" />
          </Button>
          <div>
            <h2 className="text-lg font-semibold">
              {page ? `Edit: ${page.title}` : "New Page"}
            </h2>
            <p className="text-sm text-gray-500">
              {page ? `/p/${page.slug}` : "Configure your page below"}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {page && (
            <a
              href={`/p/${page.slug}`}
              target="_blank"
              rel="noopener noreferrer"
            >
              <Button variant="outline">
                <Eye className="w-4 h-4 mr-2" />
                Preview
              </Button>
            </a>
          )}
          <Button
            variant="outline"
            onClick={() => handleSave(false)}
            disabled={isLoading}
          >
            <Save className="w-4 h-4 mr-2" />
            Save Draft
          </Button>
          <Button
            onClick={() => handleSave(true)}
            disabled={isLoading}
            style={{ backgroundColor: organization.primaryColor }}
          >
            {isPublished ? "Update" : "Publish"}
          </Button>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="content">
            <Layout className="w-4 h-4 mr-2" />
            Content
          </TabsTrigger>
          <TabsTrigger value="design">
            <Palette className="w-4 h-4 mr-2" />
            Design
          </TabsTrigger>
          <TabsTrigger value="settings">
            <Settings className="w-4 h-4 mr-2" />
            Settings
          </TabsTrigger>
        </TabsList>

        <TabsContent value="content" className="space-y-6 mt-6">
          <div className="bg-white rounded-xl border border-gray-200 p-6 space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="title">Page Title</Label>
                <Input
                  id="title"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="Enter page title"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="slug">URL Slug</Label>
                <div className="flex items-center">
                  <span className="text-gray-500 text-sm mr-1">/p/</span>
                  <Input
                    id="slug"
                    value={slug}
                    onChange={(e) => setSlug(e.target.value)}
                    placeholder="page-url"
                  />
                </div>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Brief description of the page"
                rows={2}
              />
            </div>

            <div className="space-y-2">
              <Label>Page Type</Label>
              <div className="grid grid-cols-2 gap-3">
                {pageTypes.map((type) => (
                  <button
                    key={type.value}
                    onClick={() => setPageType(type.value)}
                    className={`p-4 rounded-xl border text-left transition-colors ${
                      pageType === type.value
                        ? "border-indigo-500 bg-indigo-50"
                        : "border-gray-200 hover:border-gray-300"
                    }`}
                  >
                    <p className="font-medium text-gray-900">{type.label}</p>
                    <p className="text-sm text-gray-500 mt-1">{type.description}</p>
                  </button>
                ))}
              </div>
            </div>
          </div>

          {renderContentEditor()}
        </TabsContent>

        <TabsContent value="design" className="space-y-6 mt-6">
          <div className="bg-white rounded-xl border border-gray-200 p-6 space-y-6">
            <h3 className="font-semibold text-gray-900">Brand Colors</h3>
            <div className="grid grid-cols-3 gap-6">
              <div className="space-y-2">
                <Label htmlFor="primaryColor">Primary Color</Label>
                <div className="flex items-center gap-2">
                  <input
                    type="color"
                    id="primaryColor"
                    value={theme.primaryColor}
                    onChange={(e) => setTheme({ ...theme, primaryColor: e.target.value })}
                    className="w-10 h-10 rounded cursor-pointer"
                  />
                  <Input
                    value={theme.primaryColor}
                    onChange={(e) => setTheme({ ...theme, primaryColor: e.target.value })}
                    className="flex-1"
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="secondaryColor">Secondary Color</Label>
                <div className="flex items-center gap-2">
                  <input
                    type="color"
                    id="secondaryColor"
                    value={theme.secondaryColor}
                    onChange={(e) => setTheme({ ...theme, secondaryColor: e.target.value })}
                    className="w-10 h-10 rounded cursor-pointer"
                  />
                  <Input
                    value={theme.secondaryColor}
                    onChange={(e) => setTheme({ ...theme, secondaryColor: e.target.value })}
                    className="flex-1"
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="accentColor">Accent Color</Label>
                <div className="flex items-center gap-2">
                  <input
                    type="color"
                    id="accentColor"
                    value={theme.accentColor}
                    onChange={(e) => setTheme({ ...theme, accentColor: e.target.value })}
                    className="w-10 h-10 rounded cursor-pointer"
                  />
                  <Input
                    value={theme.accentColor}
                    onChange={(e) => setTheme({ ...theme, accentColor: e.target.value })}
                    className="flex-1"
                  />
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl border border-gray-200 p-6 space-y-4">
            <h3 className="font-semibold text-gray-900">Preview</h3>
            <div className="h-32 rounded-xl" style={{ background: `linear-gradient(135deg, ${theme.primaryColor} 0%, ${theme.secondaryColor} 100%)` }}>
              <div className="h-full flex items-center justify-center">
                <span className="text-white font-bold text-lg">{organization.name}</span>
              </div>
            </div>
          </div>
        </TabsContent>

        <TabsContent value="settings" className="space-y-6 mt-6">
          <div className="bg-white rounded-xl border border-gray-200 p-6 space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h4 className="font-medium text-gray-900">Active</h4>
                <p className="text-sm text-gray-500">Make this page visible to visitors</p>
              </div>
              <Switch checked={isActive} onCheckedChange={setIsActive} />
            </div>
            <div className="flex items-center justify-between">
              <div>
                <h4 className="font-medium text-gray-900">Published</h4>
                <p className="text-sm text-gray-500">Page is live and accessible</p>
              </div>
              <Switch checked={isPublished} onCheckedChange={setIsPublished} />
            </div>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
