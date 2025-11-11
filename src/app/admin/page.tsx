"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Plus, LogOut, User, Filter, Link2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ExperimentForm } from "@/components/experiment-form";
import { VersionForm } from "@/components/version-form";
import { GrowthBookLinkDialog } from "@/components/growthbook-link-dialog";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { createClient } from "@/lib/supabase/client";

interface Experiment {
  id: string;
  name: string;
  expParameter: string;
  userGroup: string;
  numbersList: string[];
  liveDate: string;
  platforms: string[];
  context: string | null;
  isActive: boolean;
  growthbookFeatureId?: string | null;
}

export default function AdminPage() {
  const router = useRouter();
  const supabase = createClient();
  const [experiments, setExperiments] = useState<Experiment[]>([]);
  const [selectedExperimentId, setSelectedExperimentId] = useState<
    string | null
  >(null);
  const [showVersionForm, setShowVersionForm] = useState(false);
  const [showExperimentForm, setShowExperimentForm] = useState(false);
  const [editingExperiment, setEditingExperiment] =
    useState<Experiment | null>(null);
  const [user, setUser] = useState<{ email?: string } | null>(null);
  const [showGrowthBookLink, setShowGrowthBookLink] = useState(false);
  const [linkingExperiment, setLinkingExperiment] =
    useState<Experiment | null>(null);

  useEffect(() => {
    fetchExperiments();
    checkUser();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const checkUser = async () => {
    const {
      data: { user },
    } = await supabase.auth.getUser();
    setUser(user);
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push("/login");
    router.refresh();
  };

  const fetchExperiments = async () => {
    try {
      const response = await fetch("/api/experiments");
      if (response.ok) {
        const data = await response.json();
        setExperiments(data);
      }
    } catch (error) {
      console.error("Error fetching experiments:", error);
    }
  };

  const handleExperimentSuccess = () => {
    fetchExperiments();
    setShowExperimentForm(false);
    setEditingExperiment(null);
  };

  const handleVersionSuccess = () => {
    setShowVersionForm(false);
    setSelectedExperimentId(null);
    fetchExperiments();
  };

  const handleEdit = (experiment: Experiment) => {
    setEditingExperiment(experiment);
    setShowExperimentForm(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this experiment?")) {
      return;
    }

    try {
      const response = await fetch(`/api/experiments/${id}`, {
        method: "DELETE",
      });

      if (response.ok) {
        fetchExperiments();
      } else {
        alert("Failed to delete experiment");
      }
    } catch (error) {
      console.error("Error deleting experiment:", error);
      alert("Failed to delete experiment");
    }
  };

  const handleLinkToGrowthBook = (experiment: Experiment) => {
    setLinkingExperiment(experiment);
    setShowGrowthBookLink(true);
  };

  const handleLink = async (featureId: string) => {
    if (!linkingExperiment) return;

    const response = await fetch(
      `/api/experiments/${linkingExperiment.id}/link`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ growthbookFeatureId: featureId }),
      }
    );

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || "Failed to link to GrowthBook");
    }

    fetchExperiments();
  };

  const handleUnlink = async () => {
    if (!linkingExperiment) return;

    const response = await fetch(
      `/api/experiments/${linkingExperiment.id}/link`,
      {
        method: "DELETE",
      }
    );

    if (!response.ok) {
      throw new Error("Failed to unlink from GrowthBook");
    }

    fetchExperiments();
  };

  return (
    <div className="min-h-screen">
      <div className="container mx-auto px-4 py-10 max-w-6xl">
        {/* Header Section */}
        <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between mb-10 gap-6 animate-fade-in">
          <div className="flex items-center gap-4">
            <Link href="/">
              <Button
                variant="ghost"
                size="icon"
                className="hover:bg-primary/10 hover:scale-110 transition-all duration-300 h-12 w-12 rounded-xl"
              >
                <ArrowLeft className="h-5 w-5" />
              </Button>
            </Link>
            <div>
              <h1 className="text-5xl md:text-6xl font-bold bg-gradient-to-r from-primary via-primary/80 to-primary/60 bg-clip-text text-transparent mb-3 tracking-tight">
                Admin Panel
              </h1>
              <p className="text-muted-foreground text-lg md:text-xl">
                Create and manage experiments with full control
              </p>
            </div>
          </div>
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 w-full lg:w-auto">
            {user && (
              <div className="flex items-center gap-2 px-4 py-2 rounded-lg bg-primary/5 border-2 border-primary/10">
                <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center">
                  <User className="h-4 w-4 text-primary" />
                </div>
                <span className="text-sm font-medium text-foreground">{user.email}</span>
              </div>
            )}
            <Button
              variant="outline"
              onClick={handleLogout}
              className="hover:bg-destructive/10 hover:text-destructive hover:border-destructive transition-all duration-300 border-2"
            >
              <LogOut className="h-4 w-4 mr-2" />
              Logout
            </Button>
            <Button
              size="lg"
              className="shadow-lg hover:shadow-2xl transition-all duration-300 hover:scale-105 bg-gradient-to-r from-primary to-primary/90 hover:from-primary/90 hover:to-primary group"
              onClick={() => {
                setEditingExperiment(null);
                setShowExperimentForm(true);
              }}
            >
              <Plus className="h-5 w-5 mr-2 group-hover:rotate-90 transition-transform duration-300" />
              New Experiment
            </Button>
          </div>
        </div>

        {showExperimentForm && (
          <div className="mb-8 animate-fade-in">
            <ExperimentForm
              experiment={editingExperiment || undefined}
              onSuccess={handleExperimentSuccess}
              onCancel={() => {
                setShowExperimentForm(false);
                setEditingExperiment(null);
              }}
            />
          </div>
        )}

        <Card className="shadow-lg border-2 hover:border-primary/20 transition-all duration-300 animate-fade-in">
          <CardHeader className="bg-gradient-to-r from-primary/10 via-primary/5 to-transparent border-b">
            <CardTitle className="flex items-center gap-3 text-xl">
              <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center">
                <Filter className="h-5 w-5 text-primary" />
              </div>
              <span>Existing Experiments</span>
              {experiments.length > 0 && (
                <span className="ml-auto text-sm font-normal text-muted-foreground bg-muted px-3 py-1 rounded-full">
                  {experiments.length} total
                </span>
              )}
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-6">
            {experiments.length === 0 ? (
              <div className="text-center py-16">
                <div className="h-20 w-20 rounded-full bg-primary/5 flex items-center justify-center mx-auto mb-4">
                  <Plus className="h-10 w-10 text-primary/30" />
                </div>
                <p className="text-muted-foreground text-lg mb-2">
                  No experiments yet
                </p>
                <p className="text-sm text-muted-foreground">
                  Create your first one to get started!
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                {experiments.map((experiment, index) => (
                  <div
                    key={experiment.id}
                    className="group relative flex items-center justify-between p-5 border-2 rounded-xl hover:border-primary/40 hover:shadow-lg transition-all duration-300 bg-gradient-to-br from-card to-primary/5 hover:to-primary/10"
                    style={{ animationDelay: `${index * 50}ms` }}
                  >
                    <div className="flex-1 min-w-0 pr-4">
                      <div className="flex items-center gap-3 mb-2 flex-wrap">
                        <h3 className="font-bold text-lg text-foreground">{experiment.name}</h3>
                        {experiment.isActive ? (
                          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-green-500/10 text-green-700 border border-green-500/20">
                            <div className="h-1.5 w-1.5 rounded-full bg-green-500 animate-pulse"></div>
                            Active
                          </span>
                        ) : (
                          <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-muted text-muted-foreground border">
                            Inactive
                          </span>
                        )}
                        {experiment.growthbookFeatureId && (
                          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-blue-500/10 text-blue-700 border border-blue-500/20">
                            🚩 GrowthBook
                          </span>
                        )}
                      </div>
                      <p className="text-sm text-muted-foreground">
                        <span className="font-semibold text-foreground">{experiment.expParameter}</span>
                        <span className="mx-2">•</span>
                        <span>{experiment.userGroup}</span>
                      </p>
                    </div>
                    <div className="flex gap-2 flex-shrink-0 flex-wrap">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleLinkToGrowthBook(experiment)}
                        className={
                          experiment.growthbookFeatureId
                            ? "hover:bg-blue-500/10 hover:border-blue-500/30 transition-all duration-300 border-2 border-blue-500/20"
                            : "hover:bg-primary/10 hover:border-primary/30 transition-all duration-300 border-2"
                        }
                      >
                        <Link2 className="h-3.5 w-3.5 mr-1" />
                        {experiment.growthbookFeatureId ? "Relink" : "Link GB"}
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleEdit(experiment)}
                        className="hover:bg-primary/10 hover:border-primary/30 transition-all duration-300 border-2"
                      >
                        Edit
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          setSelectedExperimentId(experiment.id);
                          setShowVersionForm(true);
                        }}
                        className="hover:bg-primary/10 hover:border-primary/30 transition-all duration-300 border-2"
                      >
                        Add Version
                      </Button>
                      <Button
                        variant="destructive"
                        size="sm"
                        onClick={() => handleDelete(experiment.id)}
                        className="hover:bg-destructive hover:scale-105 transition-all duration-300"
                      >
                        Delete
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        <Dialog open={showVersionForm} onOpenChange={setShowVersionForm}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Add Version Change</DialogTitle>
              <DialogDescription>
                Record a change made to this experiment
              </DialogDescription>
            </DialogHeader>
            {selectedExperimentId && (
              <VersionForm
                experimentId={selectedExperimentId}
                onSuccess={handleVersionSuccess}
                onCancel={() => {
                  setShowVersionForm(false);
                  setSelectedExperimentId(null);
                }}
              />
            )}
          </DialogContent>
        </Dialog>

        {linkingExperiment && (
          <GrowthBookLinkDialog
            open={showGrowthBookLink}
            onOpenChange={setShowGrowthBookLink}
            experimentId={linkingExperiment.id}
            experimentName={linkingExperiment.name}
            currentFeatureId={linkingExperiment.growthbookFeatureId}
            onLink={handleLink}
            onUnlink={handleUnlink}
          />
        )}
      </div>
    </div>
  );
}

