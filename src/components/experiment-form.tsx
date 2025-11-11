"use client";

import { useState, FormEvent } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface Experiment {
  id?: string;
  name: string;
  expParameter: string;
  userGroup: string;
  numbersList: string[];
  liveDate: string;
  platforms: string[];
  context: string | null;
  isActive: boolean;
}

interface ExperimentFormProps {
  experiment?: Experiment;
  onSuccess?: () => void;
  onCancel?: () => void;
}

export function ExperimentForm({
  experiment,
  onSuccess,
  onCancel,
}: ExperimentFormProps) {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState<Experiment>(
    experiment || {
      name: "",
      expParameter: "",
      userGroup: "",
      numbersList: [],
      liveDate: new Date().toISOString().split("T")[0],
      platforms: [],
      context: null,
      isActive: true,
    }
  );
  const [numbersInput, setNumbersInput] = useState(
    experiment?.numbersList.join("\n") || ""
  );
  const [platformInput, setPlatformInput] = useState(
    experiment?.platforms.join(", ") || ""
  );

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const numbersList = numbersInput
        .split("\n")
        .map((n) => n.trim())
        .filter((n) => n.length > 0);
      const platforms = platformInput
        .split(",")
        .map((p) => p.trim())
        .filter((p) => p.length > 0);

      const payload = {
        ...formData,
        numbersList,
        platforms,
        context: formData.context || null,
      };

      const url = experiment?.id
        ? `/api/experiments/${experiment.id}`
        : "/api/experiments";
      const method = experiment?.id ? "PATCH" : "POST";

      const response = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        throw new Error("Failed to save experiment");
      }

      if (onSuccess) {
        onSuccess();
      } else {
        window.location.href = "/";
      }
    } catch (error) {
      console.error("Error saving experiment:", error);
      alert("Failed to save experiment. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="shadow-xl border-2 hover:border-primary/30 transition-all duration-300">
      <CardHeader className="bg-gradient-to-r from-primary/10 via-primary/5 to-transparent border-b">
        <CardTitle className="text-2xl font-bold flex items-center gap-3">
          <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center">
            <span className="text-primary text-lg">✨</span>
          </div>
          {experiment ? "Edit Experiment" : "Create New Experiment"}
        </CardTitle>
      </CardHeader>
      <CardContent className="pt-8 pb-8">
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="md:col-span-2">
              <Label htmlFor="name" className="text-base font-semibold mb-2">
                Experiment Name *
              </Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) =>
                  setFormData({ ...formData, name: e.target.value })
                }
                required
                className="h-11 text-base border-2 focus:border-primary transition-colors"
                placeholder="e.g., New Homepage Layout"
              />
            </div>

            <div>
              <Label htmlFor="expParameter" className="text-base font-semibold mb-2">
                Exp Parameter *
              </Label>
              <Input
                id="expParameter"
                value={formData.expParameter}
                onChange={(e) =>
                  setFormData({ ...formData, expParameter: e.target.value })
                }
                required
                className="h-11 text-base border-2 focus:border-primary transition-colors"
                placeholder="e.g., homepage_v2"
              />
            </div>

            <div>
              <Label htmlFor="userGroup" className="text-base font-semibold mb-2">
                User Group *
              </Label>
              <Input
                id="userGroup"
                value={formData.userGroup}
                onChange={(e) =>
                  setFormData({ ...formData, userGroup: e.target.value })
                }
                required
                className="h-11 text-base border-2 focus:border-primary transition-colors"
                placeholder="e.g., beta_users"
              />
            </div>

            <div>
              <Label htmlFor="liveDate" className="text-base font-semibold mb-2">
                Live Date *
              </Label>
              <Input
                id="liveDate"
                type="date"
                value={formData.liveDate.split("T")[0]}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    liveDate: new Date(e.target.value).toISOString(),
                  })
                }
                required
                className="h-11 text-base border-2 focus:border-primary transition-colors"
              />
            </div>

            <div>
              <Label htmlFor="platforms" className="text-base font-semibold mb-2">
                Platforms
              </Label>
              <Input
                id="platforms"
                value={platformInput}
                onChange={(e) => setPlatformInput(e.target.value)}
                placeholder="web, mobile, ios, android"
                className="h-11 text-base border-2 focus:border-primary transition-colors"
              />
              <p className="text-xs text-muted-foreground mt-1">Comma-separated list</p>
            </div>
          </div>

          <div className="border-2 border-primary/10 rounded-xl p-5 bg-gradient-to-br from-primary/5 to-transparent">
            <Label htmlFor="numbersList" className="text-base font-semibold mb-2 flex items-center gap-2">
              <div className="h-6 w-6 rounded-md bg-primary/10 flex items-center justify-center">
                <span className="text-primary text-xs">#</span>
              </div>
              Numbers List
            </Label>
            <Textarea
              id="numbersList"
              value={numbersInput}
              onChange={(e) => setNumbersInput(e.target.value)}
              placeholder="123456&#10;789012&#10;345678"
              rows={4}
              className="mt-2 text-base border-2 focus:border-primary transition-colors font-mono"
            />
            <p className="text-xs text-muted-foreground mt-2">One number per line (can be hidden from view)</p>
          </div>

          <div className="border-2 border-primary/10 rounded-xl p-5 bg-gradient-to-br from-primary/5 to-transparent">
            <Label htmlFor="context" className="text-base font-semibold mb-2 flex items-center gap-2">
              <div className="h-6 w-6 rounded-md bg-primary/10 flex items-center justify-center">
                <span className="text-primary text-xs">📝</span>
              </div>
              Context / Feature Description
            </Label>
            <Textarea
              id="context"
              value={formData.context || ""}
              onChange={(e) =>
                setFormData({ ...formData, context: e.target.value || null })
              }
              placeholder="Describe the experiment, expected outcomes, and any important notes... (Markdown supported)"
              rows={6}
              className="mt-2 text-base border-2 focus:border-primary transition-colors"
            />
            <p className="text-xs text-muted-foreground mt-2">Markdown formatting supported</p>
          </div>

          <div className="flex items-center gap-3 p-4 border-2 border-primary/10 rounded-xl hover:bg-primary/5 transition-colors cursor-pointer">
            <input
              type="checkbox"
              id="isActive"
              checked={formData.isActive}
              onChange={(e) =>
                setFormData({ ...formData, isActive: e.target.checked })
              }
              className="h-5 w-5 cursor-pointer accent-primary"
            />
            <Label htmlFor="isActive" className="cursor-pointer text-base font-semibold">
              Active Experiment
            </Label>
          </div>

          <div className="flex gap-3 pt-4 border-t-2">
            <Button
              type="submit"
              disabled={loading}
              className="flex-1 h-12 text-base font-semibold shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-[1.02] bg-gradient-to-r from-primary to-primary/90"
            >
              {loading ? (
                <span className="flex items-center gap-2">
                  <div className="h-4 w-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                  Saving...
                </span>
              ) : experiment ? (
                "Update Experiment"
              ) : (
                "Create Experiment"
              )}
            </Button>
            {onCancel && (
              <Button
                type="button"
                variant="outline"
                onClick={onCancel}
                className="flex-1 h-12 text-base font-semibold border-2 hover:bg-muted transition-all duration-300"
              >
                Cancel
              </Button>
            )}
          </div>
        </form>
      </CardContent>
    </Card>
  );
}

