"use client";

import { useState } from "react";
import Link from "next/link";
import { Plus, Globe, Eye, Edit, Trash2, MoreVertical, Copy, ExternalLink } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { toast } from "sonner";
import { PublicPage } from "@prisma/client";

interface PagesListProps {
  pages: PublicPage[];
  organizationSlug: string;
  primaryColor: string;
}

const pageTypeLabels: Record<string, string> = {
  "mini-site": "Mini Site",
  "menu": "Digital Menu",
  "rewards": "Rewards Flow",
  "portal": "Customer Portal",
};

export function PagesList({ pages, organizationSlug, primaryColor }: PagesListProps) {
  const [pageToDelete, setPageToDelete] = useState<PublicPage | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const handleDelete = async () => {
    if (!pageToDelete) return;

    setIsDeleting(true);
    try {
      const response = await fetch(`/api/pages/${pageToDelete.id}`, {
        method: "DELETE",
      });

      if (response.ok) {
        toast.success("Page deleted successfully");
        window.location.reload();
      } else {
        toast.error("Failed to delete page");
      }
    } catch (error) {
      console.error("Delete error:", error);
      toast.error("Failed to delete page");
    } finally {
      setIsDeleting(false);
      setPageToDelete(null);
    }
  };

  const handleCopyLink = (slug: string) => {
    const url = `${window.location.origin}/p/${slug}`;
    navigator.clipboard.writeText(url);
    toast.success("Link copied to clipboard");
  };

  const getPageType = (page: PublicPage): string => {
    const content = page.content as Record<string, unknown>;
    return (content?.pageType as string) || "mini-site";
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-end">
        <Link href="/settings/pages/new">
          <Button style={{ backgroundColor: primaryColor }}>
            <Plus className="w-4 h-4 mr-2" />
            Create Page
          </Button>
        </Link>
      </div>

      {pages.length === 0 ? (
        <div className="bg-white rounded-xl border border-gray-200 p-12 text-center">
          <Globe className="w-12 h-12 text-gray-300 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 mb-2">No pages yet</h3>
          <p className="text-gray-500 mb-6">
            Create your first page to start engaging with your customers
          </p>
          <Link href="/settings/pages/new">
            <Button style={{ backgroundColor: primaryColor }}>
              <Plus className="w-4 h-4 mr-2" />
              Create Your First Page
            </Button>
          </Link>
        </div>
      ) : (
        <div className="grid gap-4">
          {pages.map((page) => {
            const pageType = getPageType(page);
            const publicUrl = `/p/${page.slug}`;

            return (
              <div
                key={page.id}
                className="bg-white rounded-xl border border-gray-200 p-4 hover:shadow-sm transition-shadow"
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="flex items-start gap-4 flex-1 min-w-0">
                    <div
                      className="w-10 h-10 rounded-lg flex items-center justify-center shrink-0"
                      style={{ backgroundColor: primaryColor + "15" }}
                    >
                      <Globe className="w-5 h-5" style={{ color: primaryColor } as React.CSSProperties} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <h3 className="font-semibold text-gray-900 truncate">
                          {page.title}
                        </h3>
                        {page.isPublished ? (
                          <Badge variant="success">
                            Published
                          </Badge>
                        ) : (
                          <Badge variant="outline">Draft</Badge>
                        )}
                        {!page.isActive && (
                          <Badge variant="outline" className="text-gray-500">
                            Inactive
                          </Badge>
                        )}
                      </div>
                      <p className="text-sm text-gray-500 mt-1">
                        {pageTypeLabels[pageType] || pageType} • /p/{page.slug}
                      </p>
                      {page.description && (
                        <p className="text-sm text-gray-400 mt-1 truncate">
                          {page.description}
                        </p>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    <a
                      href={publicUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="p-2 text-gray-400 hover:text-gray-600 transition-colors"
                    >
                      <ExternalLink className="w-4 h-4" />
                    </a>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon">
                          <MoreVertical className="w-4 h-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem asChild>
                          <Link href={`/settings/pages/${page.id}`}>
                            <Edit className="w-4 h-4 mr-2" />
                            Edit
                          </Link>
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => handleCopyLink(page.slug)}>
                          <Copy className="w-4 h-4 mr-2" />
                          Copy Link
                        </DropdownMenuItem>
                        <DropdownMenuItem asChild>
                          <a href={publicUrl} target="_blank" rel="noopener noreferrer">
                            <Eye className="w-4 h-4 mr-2" />
                            Preview
                          </a>
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem
                          className="text-red-600"
                          onClick={() => setPageToDelete(page)}
                        >
                          <Trash2 className="w-4 h-4 mr-2" />
                          Delete
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      <AlertDialog open={!!pageToDelete} onOpenChange={() => setPageToDelete(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Page</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete "{pageToDelete?.title}"? This action
              cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              disabled={isDeleting}
              className="bg-red-600 hover:bg-red-700"
            >
              {isDeleting ? "Deleting..." : "Delete"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
