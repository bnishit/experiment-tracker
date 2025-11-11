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
      <Card className="animate-fade-in">
        <CardContent className="py-16 text-center">
          <div className="h-20 w-20 rounded-full bg-muted flex items-center justify-center mx-auto mb-4">
            <Eye className="h-10 w-10 text-muted-foreground/30" />
          </div>
          <p className="text-muted-foreground text-lg">No experiments found</p>
          <p className="text-sm text-muted-foreground mt-2">Try adjusting your filters</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-5">
      {experiments.map((experiment, index) => {
        const isExpanded = expandedRows.has(experiment.id);
        const showNumbersForThis = showNumbers[experiment.id];

        return (
          <Card
            key={experiment.id}
            className="overflow-hidden shadow-lg hover:shadow-2xl transition-all duration-300 border-2 hover:border-primary/40 bg-gradient-to-br from-card to-primary/5 hover:to-primary/10 animate-fade-in"
            style={{ animationDelay: `${index * 50}ms` }}
          >
            <CardHeader
              className="cursor-pointer hover:bg-gradient-to-r hover:from-primary/10 hover:via-primary/5 hover:to-transparent transition-all duration-300 group"
              onClick={() => toggleRow(experiment.id)}
            >
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-3 mb-3">
                    <CardTitle className="text-2xl font-bold text-foreground group-hover:text-primary transition-colors">
                      {experiment.name}
                    </CardTitle>
                    {experiment.isActive ? (
                      <Badge className="bg-green-500/15 text-green-700 border-green-500/30 border-2 px-3 py-1 hover:bg-green-500/20 transition-colors">
                        <div className="h-2 w-2 rounded-full bg-green-500 animate-pulse mr-1.5"></div>
                        Active
                      </Badge>
                    ) : (
                      <Badge variant="secondary" className="border-2 px-3 py-1">
                        Inactive
                      </Badge>
                    )}
                  </div>
                  <div className="flex flex-wrap gap-3 text-sm mb-4">
                    <span className="text-foreground">
                      <strong className="font-semibold">Parameter:</strong>{" "}
                      <span className="text-primary font-medium">{experiment.expParameter}</span>
                    </span>
                    <span className="text-muted-foreground">•</span>
                    <span className="text-foreground">
                      <strong className="font-semibold">Group:</strong>{" "}
                      <span className="text-muted-foreground">{experiment.userGroup}</span>
                    </span>
                    <span className="text-muted-foreground">•</span>
                    <span className="text-foreground">
                      <strong className="font-semibold">Live:</strong>{" "}
                      <span className="text-muted-foreground">
                        {format(new Date(experiment.liveDate), "MMM d, yyyy")}
                      </span>
                    </span>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {experiment.platforms.map((platform) => (
                      <Badge
                        key={platform}
                        variant="outline"
                        className="font-medium border-2 hover:border-primary/40 hover:bg-primary/5 transition-colors px-3 py-1"
                      >
                        {platform}
                      </Badge>
                    ))}
                  </div>
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  className="flex-shrink-0 hover:bg-primary/10 transition-all duration-300 h-10 w-10 rounded-xl group-hover:scale-110"
                >
                  {isExpanded ? (
                    <ChevronUp className="h-5 w-5 text-primary" />
                  ) : (
                    <ChevronDown className="h-5 w-5" />
                  )}
                </Button>
              </div>
            </CardHeader>

            {isExpanded && (
              <CardContent className="pt-6 pb-6 space-y-6 border-t-2 border-primary/10 bg-gradient-to-b from-primary/5 to-transparent animate-fade-in">
                {experiment.numbersList.length > 0 && (
                  <div className="bg-card rounded-xl p-4 border-2 border-primary/10">
                    <div className="flex items-center justify-between mb-3">
                      <strong className="text-sm font-semibold text-foreground flex items-center gap-2">
                        <div className="h-6 w-6 rounded-md bg-primary/10 flex items-center justify-center">
                          <Eye className="h-3.5 w-3.5 text-primary" />
                        </div>
                        Numbers List
                      </strong>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={(e) => {
                          e.stopPropagation();
                          toggleNumbers(experiment.id);
                        }}
                        className="hover:bg-primary/10 border-2 transition-all duration-300"
                      >
                        {showNumbersForThis ? (
                          <>
                            <EyeOff className="h-4 w-4 mr-1.5" />
                            Hide
                          </>
                        ) : (
                          <>
                            <Eye className="h-4 w-4 mr-1.5" />
                            Show
                          </>
                        )}
                      </Button>
                    </div>
                    {showNumbersForThis && (
                      <div className="bg-gradient-to-br from-muted to-muted/50 p-4 rounded-lg text-sm font-mono border-2 border-border animate-fade-in">
                        {experiment.numbersList.join(", ")}
                      </div>
                    )}
                  </div>
                )}

                {experiment.context && (
                  <div className="bg-card rounded-xl p-4 border-2 border-primary/10">
                    <strong className="text-sm font-semibold text-foreground flex items-center gap-2 mb-3">
                      <div className="h-6 w-6 rounded-md bg-primary/10 flex items-center justify-center">
                        <span className="text-primary text-xs">📝</span>
                      </div>
                      Context
                    </strong>
                    <div className="prose prose-sm max-w-none bg-gradient-to-br from-muted to-muted/50 p-4 rounded-lg border-2 border-border">
                      <ReactMarkdown>{experiment.context}</ReactMarkdown>
                    </div>
                  </div>
                )}

                {experiment.versions.length > 0 && (
                  <div className="bg-card rounded-xl p-4 border-2 border-primary/10">
                    <strong className="text-sm font-semibold text-foreground flex items-center gap-2 mb-4">
                      <div className="h-6 w-6 rounded-md bg-primary/10 flex items-center justify-center">
                        <span className="text-primary text-xs">📋</span>
                      </div>
                      Version History
                      <span className="ml-auto text-xs font-normal text-muted-foreground bg-muted px-2 py-1 rounded-full">
                        {experiment.versions.length} changes
                      </span>
                    </strong>
                    <div className="space-y-3">
                      {experiment.versions.map((version, vIndex) => (
                        <div
                          key={version.id}
                          className="border-l-4 border-primary pl-4 py-3 bg-gradient-to-r from-primary/5 to-transparent rounded-r-lg hover:from-primary/10 transition-colors duration-300"
                          style={{ animationDelay: `${vIndex * 50}ms` }}
                        >
                          <div className="text-xs font-semibold text-primary mb-2 flex items-center gap-2">
                            <div className="h-1.5 w-1.5 rounded-full bg-primary"></div>
                            {format(new Date(version.changeDate), "MMM d, yyyy")}
                          </div>
                          <div className="text-sm text-foreground">
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
                  className="w-full border-2 hover:border-primary/40 hover:bg-primary/10 transition-all duration-300 hover:scale-[1.02] font-semibold"
                >
                  <Eye className="h-4 w-4 mr-2" />
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

