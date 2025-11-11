"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Plus, Search, Filter } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ExperimentTable } from "@/components/experiment-table";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

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
  versions: Array<{
    id: string;
    changeDate: string;
    changes: string;
  }>;
}

export default function Home() {
  const [experiments, setExperiments] = useState<Experiment[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [platformFilter, setPlatformFilter] = useState("");
  const [userGroupFilter, setUserGroupFilter] = useState("");
  const [activeFilter, setActiveFilter] = useState<string>("all");

  useEffect(() => {
    fetchExperiments();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [search, platformFilter, userGroupFilter, activeFilter]);

  const fetchExperiments = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (search) params.append("search", search);
      if (platformFilter) params.append("platform", platformFilter);
      if (userGroupFilter) params.append("userGroup", userGroupFilter);
      if (activeFilter !== "all") params.append("isActive", activeFilter);

      const response = await fetch(`/api/experiments?${params.toString()}`);
      if (response.ok) {
        const data = await response.json();
        setExperiments(data);
      }
    } catch (error) {
      console.error("Error fetching experiments:", error);
    } finally {
      setLoading(false);
    }
  };

  const allPlatforms = Array.from(
    new Set(experiments.flatMap((e) => e.platforms))
  ).sort();
  const allUserGroups = Array.from(
    new Set(experiments.map((e) => e.userGroup))
  ).sort();

  return (
    <div className="min-h-screen">
      <div className="container mx-auto px-4 py-10 max-w-7xl">
        {/* Header Section */}
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between mb-10 gap-6 animate-fade-in">
          <div>
            <h1 className="text-5xl md:text-6xl font-bold bg-gradient-to-r from-primary via-primary/80 to-primary/60 bg-clip-text text-transparent mb-3 tracking-tight">
              Experiment Tracker
            </h1>
            <p className="text-muted-foreground text-lg md:text-xl">
              View and manage all experiments with ease
            </p>
          </div>
          <Link href="/admin">
            <Button
              size="lg"
              className="shadow-lg hover:shadow-2xl transition-all duration-300 hover:scale-105 bg-gradient-to-r from-primary to-primary/90 hover:from-primary/90 hover:to-primary group"
            >
              <Plus className="h-5 w-5 mr-2 group-hover:rotate-90 transition-transform duration-300" />
              Create Experiment
            </Button>
          </Link>
        </div>

        {/* Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8 animate-fade-in">
          <Card className="border-2 shadow-md hover:shadow-lg transition-all duration-300 hover:border-primary/30 bg-gradient-to-br from-card to-primary/5">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Total Experiments</p>
                  <p className="text-3xl font-bold text-foreground mt-1">{experiments.length}</p>
                </div>
                <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center">
                  <Filter className="h-6 w-6 text-primary" />
                </div>
              </div>
            </CardContent>
          </Card>
          <Card className="border-2 shadow-md hover:shadow-lg transition-all duration-300 hover:border-green-500/30 bg-gradient-to-br from-card to-green-500/5">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Active</p>
                  <p className="text-3xl font-bold text-green-700 mt-1">
                    {experiments.filter(e => e.isActive).length}
                  </p>
                </div>
                <div className="h-12 w-12 rounded-full bg-green-500/10 flex items-center justify-center">
                  <div className="h-3 w-3 rounded-full bg-green-500 animate-pulse"></div>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card className="border-2 shadow-md hover:shadow-lg transition-all duration-300 hover:border-muted/50 bg-gradient-to-br from-card to-muted/30">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Inactive</p>
                  <p className="text-3xl font-bold text-muted-foreground mt-1">
                    {experiments.filter(e => !e.isActive).length}
                  </p>
                </div>
                <div className="h-12 w-12 rounded-full bg-muted flex items-center justify-center">
                  <div className="h-3 w-3 rounded-full bg-muted-foreground/50"></div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Filters Card */}
        <Card className="mb-8 shadow-lg border-2 hover:border-primary/20 transition-all duration-300 animate-fade-in backdrop-blur-sm bg-card/95">
          <CardHeader className="bg-gradient-to-r from-primary/10 via-primary/5 to-transparent border-b">
            <CardTitle className="flex items-center gap-3 text-xl">
              <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center">
                <Filter className="h-5 w-5 text-primary" />
              </div>
              <span>Filter Experiments</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-6">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-5">
              <div>
                <label className="text-sm font-semibold mb-2 block text-foreground">Search</label>
                <div className="relative">
                  <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground pointer-events-none" />
                  <Input
                    placeholder="Search by name or parameter..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    className="pl-10 border-2 focus:border-primary transition-colors"
                  />
                </div>
              </div>

              <div>
                <label className="text-sm font-semibold mb-2 block text-foreground">
                  Platform
                </label>
                <select
                  value={platformFilter}
                  onChange={(e) => setPlatformFilter(e.target.value)}
                  className="flex h-10 w-full rounded-md border-2 border-input bg-background px-3 py-2 text-sm ring-offset-background transition-colors focus-visible:outline-none focus-visible:border-primary focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                >
                  <option value="">All Platforms</option>
                  {allPlatforms.map((platform) => (
                    <option key={platform} value={platform}>
                      {platform}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-sm font-semibold mb-2 block text-foreground">
                  User Group
                </label>
                <select
                  value={userGroupFilter}
                  onChange={(e) => setUserGroupFilter(e.target.value)}
                  className="flex h-10 w-full rounded-md border-2 border-input bg-background px-3 py-2 text-sm ring-offset-background transition-colors focus-visible:outline-none focus-visible:border-primary focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                >
                  <option value="">All User Groups</option>
                  {allUserGroups.map((group) => (
                    <option key={group} value={group}>
                      {group}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-sm font-semibold mb-2 block text-foreground">Status</label>
                <select
                  value={activeFilter}
                  onChange={(e) => setActiveFilter(e.target.value)}
                  className="flex h-10 w-full rounded-md border-2 border-input bg-background px-3 py-2 text-sm ring-offset-background transition-colors focus-visible:outline-none focus-visible:border-primary focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                >
                  <option value="all">All</option>
                  <option value="true">Active</option>
                  <option value="false">Inactive</option>
                </select>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Results */}
        {loading ? (
          <Card className="animate-fade-in">
            <CardContent className="py-16 text-center">
              <div className="loading-shimmer h-8 w-48 mx-auto rounded-md mb-3"></div>
              <p className="text-muted-foreground">Loading experiments...</p>
            </CardContent>
          </Card>
        ) : (
          <div className="animate-fade-in">
            <ExperimentTable experiments={experiments} />
          </div>
        )}
      </div>
    </div>
  );
}

