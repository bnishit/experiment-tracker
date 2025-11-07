"use client";

import { useState } from "react";
import { format } from "date-fns";
import { ChevronDown, ChevronUp, Eye, EyeOff } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import ReactMarkdown from "react-markdown";

interface Version {
  id: string;
  changeDate: string;
  changes: string;
}

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
  versions: Version[];
}

interface ExperimentTableProps {
  experiments: Experiment[];
}

export function ExperimentTable({ experiments }: ExperimentTableProps) {
  const [expandedRows, setExpandedRows] = useState<Set<string>>(new Set());
  const [selectedExperiment, setSelectedExperiment] =
    useState<Experiment | null>(null);
  const [showNumbers, setShowNumbers] = useState<Record<string, boolean>>({});

  const toggleRow = (id: string) => {
    const newExpanded = new Set(expandedRows);
    if (newExpanded.has(id)) {
      newExpanded.delete(id);
    } else {
      newExpanded.add(id);
    }
    setExpandedRows(newExpanded);
  };

  const toggleNumbers = (id: string) => {
    setShowNumbers((prev) => ({
      ...prev,
      [id]: !prev[id],
    }));
  };

  if (experiments.length === 0) {
    return (
      <Card>
        <CardContent className="py-10 text-center text-muted-foreground">
          No experiments found
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      {experiments.map((experiment) => {
        const isExpanded = expandedRows.has(experiment.id);
        const showNumbersForThis = showNumbers[experiment.id];

        return (
          <Card key={experiment.id} className="overflow-hidden shadow-md hover:shadow-lg transition-all duration-200 border-2 hover:border-primary/30">
            <CardHeader
              className="cursor-pointer hover:bg-gradient-to-r hover:from-primary/5 hover:to-primary/10 transition-all duration-200"
              onClick={() => toggleRow(experiment.id)}
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <CardTitle className="text-xl font-semibold text-foreground">{experiment.name}</CardTitle>
                    {experiment.isActive ? (
                      <Badge className="bg-green-500/10 text-green-700 border-green-500/20">Active</Badge>
                    ) : (
                      <Badge variant="secondary">Inactive</Badge>
                    )}
                  </div>
                  <div className="flex flex-wrap gap-2 text-sm text-muted-foreground">
                    <span>
                      <strong>Exp Parameter:</strong> {experiment.expParameter}
                    </span>
                    <span>•</span>
                    <span>
                      <strong>User Group:</strong> {experiment.userGroup}
                    </span>
                    <span>•</span>
                    <span>
                      <strong>Live Date:</strong>{" "}
                      {format(new Date(experiment.liveDate), "MMM d, yyyy")}
                    </span>
                  </div>
                  <div className="flex flex-wrap gap-2 mt-3">
                    {experiment.platforms.map((platform) => (
                      <Badge key={platform} variant="outline" className="font-medium">
                        {platform}
                      </Badge>
                    ))}
                  </div>
                </div>
                <Button variant="ghost" size="icon">
                  {isExpanded ? (
                    <ChevronUp className="h-4 w-4" />
                  ) : (
                    <ChevronDown className="h-4 w-4" />
                  )}
                </Button>
              </div>
            </CardHeader>

            {isExpanded && (
              <CardContent className="pt-0 space-y-4">
                {experiment.numbersList.length > 0 && (
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <strong className="text-sm">Numbers List:</strong>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={(e) => {
                          e.stopPropagation();
                          toggleNumbers(experiment.id);
                        }}
                      >
                        {showNumbersForThis ? (
                          <>
                            <EyeOff className="h-4 w-4 mr-1" />
                            Hide
                          </>
                        ) : (
                          <>
                            <Eye className="h-4 w-4 mr-1" />
                            Show
                          </>
                        )}
                      </Button>
                    </div>
                    {showNumbersForThis && (
                      <div className="bg-muted p-3 rounded-md text-sm font-mono">
                        {experiment.numbersList.join(", ")}
                      </div>
                    )}
                  </div>
                )}

                {experiment.context && (
                  <div>
                    <strong className="text-sm block mb-2">Context:</strong>
                    <div className="prose prose-sm max-w-none bg-muted p-3 rounded-md">
                      <ReactMarkdown>{experiment.context}</ReactMarkdown>
                    </div>
                  </div>
                )}

                {experiment.versions.length > 0 && (
                  <div>
                    <strong className="text-sm block mb-2">Version History:</strong>
                    <div className="space-y-2">
                      {experiment.versions.map((version) => (
                        <div
                          key={version.id}
                          className="border-l-2 border-primary pl-3 py-2"
                        >
                          <div className="text-xs text-muted-foreground mb-1">
                            {format(new Date(version.changeDate), "MMM d, yyyy")}
                          </div>
                          <div className="text-sm">
                            <ReactMarkdown className="prose prose-sm max-w-none">
                              {version.changes}
                            </ReactMarkdown>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                <Button
                  variant="outline"
                  onClick={() => setSelectedExperiment(experiment)}
                >
                  View Full Details
                </Button>
              </CardContent>
            )}
          </Card>
        );
      })}

      <Dialog
        open={!!selectedExperiment}
        onOpenChange={(open) => !open && setSelectedExperiment(null)}
      >
        {selectedExperiment && (
          <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>{selectedExperiment.name}</DialogTitle>
              <DialogDescription>
                Complete experiment details and version history
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <strong className="text-sm">Exp Parameter:</strong>
                  <p>{selectedExperiment.expParameter}</p>
                </div>
                <div>
                  <strong className="text-sm">User Group:</strong>
                  <p>{selectedExperiment.userGroup}</p>
                </div>
                <div>
                  <strong className="text-sm">Live Date:</strong>
                  <p>
                    {format(
                      new Date(selectedExperiment.liveDate),
                      "MMM d, yyyy"
                    )}
                  </p>
                </div>
                <div>
                  <strong className="text-sm">Status:</strong>
                  <p>
                    {selectedExperiment.isActive ? "Active" : "Inactive"}
                  </p>
                </div>
              </div>

              {selectedExperiment.platforms.length > 0 && (
                <div>
                  <strong className="text-sm block mb-2">Platforms:</strong>
                  <div className="flex flex-wrap gap-2">
                    {selectedExperiment.platforms.map((platform) => (
                      <Badge key={platform}>{platform}</Badge>
                    ))}
                  </div>
                </div>
              )}

              {selectedExperiment.numbersList.length > 0 && (
                <div>
                  <strong className="text-sm block mb-2">Numbers List:</strong>
                  <div className="bg-muted p-3 rounded-md text-sm font-mono">
                    {selectedExperiment.numbersList.join(", ")}
                  </div>
                </div>
              )}

              {selectedExperiment.context && (
                <div>
                  <strong className="text-sm block mb-2">Context:</strong>
                  <div className="prose prose-sm max-w-none bg-muted p-3 rounded-md">
                    <ReactMarkdown>
                      {selectedExperiment.context}
                    </ReactMarkdown>
                  </div>
                </div>
              )}

              {selectedExperiment.versions.length > 0 && (
                <div>
                  <strong className="text-sm block mb-3">Version History:</strong>
                  <div className="space-y-3">
                    {selectedExperiment.versions.map((version) => (
                      <div
                        key={version.id}
                        className="border-l-4 border-primary pl-4 py-2 bg-muted/50 rounded-r"
                      >
                        <div className="text-xs text-muted-foreground mb-2">
                          {format(new Date(version.changeDate), "MMM d, yyyy 'at' h:mm a")}
                        </div>
                        <div className="text-sm">
                          <ReactMarkdown className="prose prose-sm max-w-none">
                            {version.changes}
                          </ReactMarkdown>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </DialogContent>
        )}
      </Dialog>
    </div>
  );
}

