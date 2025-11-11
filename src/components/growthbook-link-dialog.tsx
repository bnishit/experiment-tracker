"use client";

import { useState } from "react";
import { Search, Link2, ExternalLink, Loader2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

interface GrowthBookFeature {
  id: string;
  key: string;
  valueType: string;
  defaultValue: any;
  description?: string;
  enabled: boolean;
  tags: string[];
  hasExperiments: boolean;
  hasRollouts: boolean;
  ruleCount: number;
  alreadyLinked: boolean;
  linkedTo: {
    experimentId: string;
    experimentName: string;
  } | null;
}

interface GrowthBookLinkDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  experimentId: string;
  experimentName: string;
  currentFeatureId?: string | null;
  onLink: (featureId: string) => Promise<void>;
  onUnlink?: () => Promise<void>;
}

export function GrowthBookLinkDialog({
  open,
  onOpenChange,
  experimentId,
  experimentName,
  currentFeatureId,
  onLink,
  onUnlink,
}: GrowthBookLinkDialogProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const [features, setFeatures] = useState<GrowthBookFeature[]>([]);
  const [loading, setLoading] = useState(false);
  const [linking, setLinking] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const searchFeatures = async () => {
    if (!searchTerm.trim()) {
      setError("Please enter a search term");
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const response = await fetch(
        `/api/growthbook/features?search=${encodeURIComponent(searchTerm)}`
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Failed to search features");
      }

      const data = await response.json();
      setFeatures(data.features || []);

      if (data.features.length === 0) {
        setError("No features found matching your search");
      }
    } catch (err) {
      console.error("Error searching features:", err);
      setError(
        err instanceof Error
          ? err.message
          : "Failed to search GrowthBook features"
      );
    } finally {
      setLoading(false);
    }
  };

  const handleLink = async (featureId: string) => {
    setLinking(true);
    setError(null);

    try {
      await onLink(featureId);
      onOpenChange(false);
    } catch (err) {
      console.error("Error linking feature:", err);
      setError(
        err instanceof Error ? err.message : "Failed to link to GrowthBook"
      );
    } finally {
      setLinking(false);
    }
  };

  const handleUnlink = async () => {
    if (!onUnlink) return;

    setLinking(true);
    setError(null);

    try {
      await onUnlink();
      onOpenChange(false);
    } catch (err) {
      console.error("Error unlinking feature:", err);
      setError(
        err instanceof Error ? err.message : "Failed to unlink from GrowthBook"
      );
    } finally {
      setLinking(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Link to GrowthBook Feature</DialogTitle>
          <DialogDescription>
            Search for a feature flag in GrowthBook to link with{" "}
            <strong>{experimentName}</strong>
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {currentFeatureId && (
            <div className="bg-blue-50 dark:bg-blue-950/30 border-2 border-blue-500/20 rounded-lg p-4">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-sm font-medium mb-1">
                    Currently Linked to GrowthBook
                  </p>
                  <code className="text-xs font-mono bg-white dark:bg-background px-2 py-1 rounded">
                    {currentFeatureId}
                  </code>
                </div>
                {onUnlink && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleUnlink}
                    disabled={linking}
                  >
                    {linking ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      "Unlink"
                    )}
                  </Button>
                )}
              </div>
            </div>
          )}

          <div className="space-y-2">
            <Label htmlFor="search">Search GrowthBook Features</Label>
            <div className="flex gap-2">
              <Input
                id="search"
                placeholder="Enter feature key (e.g., checkout_v2)"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && searchFeatures()}
              />
              <Button onClick={searchFeatures} disabled={loading}>
                {loading ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <>
                    <Search className="h-4 w-4 mr-2" />
                    Search
                  </>
                )}
              </Button>
            </div>
          </div>

          {error && (
            <div className="bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-800 rounded-lg p-3">
              <p className="text-sm text-red-800 dark:text-red-200">{error}</p>
            </div>
          )}

          {features.length > 0 && (
            <div className="space-y-2">
              <Label>Search Results ({features.length})</Label>
              <div className="space-y-2 max-h-96 overflow-y-auto">
                {features.map((feature) => (
                  <div
                    key={feature.id}
                    className="border-2 rounded-lg p-4 hover:border-primary/40 transition-colors"
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-2">
                          <code className="font-mono font-semibold text-sm">
                            {feature.key}
                          </code>
                          {feature.enabled ? (
                            <Badge className="bg-green-500/15 text-green-700">
                              Enabled
                            </Badge>
                          ) : (
                            <Badge variant="secondary">Disabled</Badge>
                          )}
                          {feature.hasExperiments && (
                            <Badge variant="outline" className="text-xs">
                              🔬 Has A/B Test
                            </Badge>
                          )}
                        </div>

                        {feature.description && (
                          <p className="text-sm text-muted-foreground mb-2">
                            {feature.description}
                          </p>
                        )}

                        <div className="flex flex-wrap gap-2 text-xs">
                          <span className="text-muted-foreground">
                            Type: <strong>{feature.valueType}</strong>
                          </span>
                          <span className="text-muted-foreground">•</span>
                          <span className="text-muted-foreground">
                            Rules: <strong>{feature.ruleCount}</strong>
                          </span>
                          {feature.tags.length > 0 && (
                            <>
                              <span className="text-muted-foreground">•</span>
                              <div className="flex gap-1">
                                {feature.tags.slice(0, 3).map((tag) => (
                                  <Badge
                                    key={tag}
                                    variant="outline"
                                    className="text-xs h-5"
                                  >
                                    {tag}
                                  </Badge>
                                ))}
                                {feature.tags.length > 3 && (
                                  <span className="text-muted-foreground">
                                    +{feature.tags.length - 3} more
                                  </span>
                                )}
                              </div>
                            </>
                          )}
                        </div>

                        {feature.alreadyLinked && feature.linkedTo && (
                          <div className="mt-2 text-xs text-amber-600 dark:text-amber-400">
                            ⚠️ Already linked to: {feature.linkedTo.experimentName}
                          </div>
                        )}
                      </div>

                      <Button
                        size="sm"
                        onClick={() => handleLink(feature.id)}
                        disabled={
                          linking ||
                          feature.id === currentFeatureId ||
                          (feature.alreadyLinked &&
                            feature.linkedTo?.experimentId !== experimentId)
                        }
                      >
                        {linking ? (
                          <Loader2 className="h-4 w-4 animate-spin" />
                        ) : feature.id === currentFeatureId ? (
                          "Current"
                        ) : feature.alreadyLinked ? (
                          "Linked"
                        ) : (
                          <>
                            <Link2 className="h-4 w-4 mr-1" />
                            Link
                          </>
                        )}
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          <div className="bg-muted/50 rounded-lg p-3">
            <p className="text-xs text-muted-foreground">
              💡 <strong>Tip:</strong> Search by the feature key in GrowthBook
              (e.g., "checkout_v2", "dark_mode"). The feature key should match
              or be related to your experiment parameter.
            </p>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
