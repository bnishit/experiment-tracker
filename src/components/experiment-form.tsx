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
    <Card className="shadow-lg border-2">
      <CardHeader className="bg-gradient-to-r from-primary/5 to-primary/10 border-b">
        <CardTitle className="text-xl">
          {experiment ? "Edit Experiment" : "Create New Experiment"}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-5 pt-2">
          <div>
            <Label htmlFor="name">Experiment Name *</Label>
            <Input
              id="name"
              value={formData.name}
              onChange={(e) =>
                setFormData({ ...formData, name: e.target.value })
              }
              required
            />
          </div>

          <div>
            <Label htmlFor="expParameter">Exp Parameter *</Label>
            <Input
              id="expParameter"
              value={formData.expParameter}
              onChange={(e) =>
                setFormData({ ...formData, expParameter: e.target.value })
              }
              required
            />
          </div>

          <div>
            <Label htmlFor="userGroup">User Group *</Label>
            <Input
              id="userGroup"
              value={formData.userGroup}
              onChange={(e) =>
                setFormData({ ...formData, userGroup: e.target.value })
              }
              required
            />
          </div>

          <div>
            <Label htmlFor="liveDate">Live Date *</Label>
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
            />
          </div>

          <div>
            <Label htmlFor="platforms">Platforms (comma-separated)</Label>
            <Input
              id="platforms"
              value={platformInput}
              onChange={(e) => setPlatformInput(e.target.value)}
              placeholder="web, mobile, ios, android"
            />
          </div>

          <div>
            <Label htmlFor="numbersList">
              Numbers List (one per line, can be hidden)
            </Label>
            <Textarea
              id="numbersList"
              value={numbersInput}
              onChange={(e) => setNumbersInput(e.target.value)}
              placeholder="123456&#10;789012&#10;345678"
              rows={4}
            />
          </div>

          <div>
            <Label htmlFor="context">Context / Feature Description</Label>
            <Textarea
              id="context"
              value={formData.context || ""}
              onChange={(e) =>
                setFormData({ ...formData, context: e.target.value || null })
              }
              placeholder="Markdown supported..."
              rows={6}
            />
          </div>

          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              id="isActive"
              checked={formData.isActive}
              onChange={(e) =>
                setFormData({ ...formData, isActive: e.target.checked })
              }
              className="h-4 w-4"
            />
            <Label htmlFor="isActive" className="cursor-pointer">
              Active
            </Label>
          </div>

          <div className="flex gap-2">
            <Button type="submit" disabled={loading}>
              {loading ? "Saving..." : experiment ? "Update" : "Create"}
            </Button>
            {onCancel && (
              <Button type="button" variant="outline" onClick={onCancel}>
                Cancel
              </Button>
            )}
          </div>
        </form>
      </CardContent>
    </Card>
  );
}

