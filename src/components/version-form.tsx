"use client";

import { useState, FormEvent } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface VersionFormProps {
  experimentId: string;
  onSuccess?: () => void;
  onCancel?: () => void;
}

export function VersionForm({
  experimentId,
  onSuccess,
  onCancel,
}: VersionFormProps) {
  const [loading, setLoading] = useState(false);
  const [changeDate, setChangeDate] = useState(
    new Date().toISOString().split("T")[0]
  );
  const [changes, setChanges] = useState("");

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await fetch(
        `/api/experiments/${experimentId}/versions`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            changeDate: new Date(changeDate).toISOString(),
            changes,
          }),
        }
      );

      if (!response.ok) {
        throw new Error("Failed to create version");
      }

      if (onSuccess) {
        onSuccess();
      } else {
        setChangeDate(new Date().toISOString().split("T")[0]);
        setChanges("");
      }
    } catch (error) {
      console.error("Error creating version:", error);
      alert("Failed to create version. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="shadow-lg border-2">
      <CardHeader className="bg-gradient-to-r from-primary/5 to-primary/10 border-b">
        <CardTitle className="text-xl">Add Version Change</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="changeDate">Change Date *</Label>
            <Input
              id="changeDate"
              type="date"
              value={changeDate}
              onChange={(e) => setChangeDate(e.target.value)}
              required
            />
          </div>

          <div>
            <Label htmlFor="changes">Changes *</Label>
            <Textarea
              id="changes"
              value={changes}
              onChange={(e) => setChanges(e.target.value)}
              placeholder="Describe the changes made in this version (Markdown supported)..."
              rows={6}
              required
            />
          </div>

          <div className="flex gap-2">
            <Button type="submit" disabled={loading}>
              {loading ? "Saving..." : "Add Version"}
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

