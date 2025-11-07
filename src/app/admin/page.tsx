"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Plus, LogOut, User } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ExperimentForm } from "@/components/experiment-form";
import { VersionForm } from "@/components/version-form";
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

  return (
    <div className="min-h-screen">
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-4">
            <Link href="/">
              <Button variant="ghost" size="icon" className="hover:bg-primary/10">
                <ArrowLeft className="h-4 w-4" />
              </Button>
            </Link>
            <div>
              <h1 className="text-4xl font-bold bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent mb-2">
                Admin Panel
              </h1>
              <p className="text-muted-foreground text-lg">
                Create and manage experiments
              </p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            {user && (
              <div className="flex items-center gap-2 text-sm text-muted-foreground mr-2">
                <User className="h-4 w-4" />
                <span>{user.email}</span>
              </div>
            )}
            <Button
              variant="outline"
              onClick={handleLogout}
              className="hover:bg-destructive/10 hover:text-destructive hover:border-destructive"
            >
              <LogOut className="h-4 w-4 mr-2" />
              Logout
            </Button>
            <Button 
              size="lg" 
              className="shadow-lg hover:shadow-xl transition-shadow"
              onClick={() => {
                setEditingExperiment(null);
                setShowExperimentForm(true);
              }}
            >
              <Plus className="h-4 w-4 mr-2" />
              New Experiment
            </Button>
          </div>
        </div>

        {showExperimentForm && (
          <div className="mb-8">
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

        <Card className="shadow-md border-2">
          <CardHeader className="bg-gradient-to-r from-primary/5 to-primary/10 border-b">
            <CardTitle className="text-xl">Existing Experiments</CardTitle>
          </CardHeader>
          <CardContent className="pt-6">
            {experiments.length === 0 ? (
              <p className="text-muted-foreground text-center py-8">
                No experiments yet. Create your first one!
              </p>
            ) : (
              <div className="space-y-3">
                {experiments.map((experiment) => (
                  <div
                    key={experiment.id}
                    className="flex items-center justify-between p-4 border-2 rounded-lg hover:border-primary/30 hover:shadow-md transition-all duration-200 bg-card"
                  >
                    <div className="flex-1">
                      <h3 className="font-semibold text-lg mb-1">{experiment.name}</h3>
                      <p className="text-sm text-muted-foreground">
                        <span className="font-medium">{experiment.expParameter}</span> • {experiment.userGroup}
                      </p>
                    </div>
                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleEdit(experiment)}
                        className="hover:bg-primary/10"
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
                        className="hover:bg-primary/10"
                      >
                        Add Version
                      </Button>
                      <Button
                        variant="destructive"
                        size="sm"
                        onClick={() => handleDelete(experiment.id)}
                        className="hover:bg-destructive/90"
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
      </div>
    </div>
  );
}

