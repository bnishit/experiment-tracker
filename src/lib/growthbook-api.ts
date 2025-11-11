/**
 * GrowthBook Features API Client
 *
 * Provides methods to fetch and interact with GrowthBook feature flags via REST API.
 * Handles authentication, error handling, and data transformation.
 */

export interface GrowthBookFeature {
  id: string;
  key: string;
  valueType: 'boolean' | 'string' | 'number' | 'json';
  defaultValue: any;
  description?: string;
  tags: string[];
  environments: {
    [envName: string]: {
      enabled: boolean;
      rules: GrowthBookRule[];
    };
  };
  revision?: {
    version: number;
    comment: string;
    publishedAt: string;
  };
}

export interface GrowthBookRule {
  type: 'force' | 'rollout' | 'experiment';
  description?: string;
  enabled?: boolean;
  condition?: Record<string, any>;
  value?: any;
  variations?: Array<{
    value: any;
    weight: number;
    name?: string;
    key?: string;
  }>;
  coverage?: number;
  hashAttribute?: string;
  trackingKey?: string;
  namespace?: [string, number, number];
}

export interface ExperimentInfo {
  type: 'experiment';
  description?: string;
  variations: Array<{
    value: any;
    weight: number;
    name?: string;
    key?: string;
  }>;
  coverage: number;
  condition?: Record<string, any>;
  trackingKey?: string;
}

export class GrowthBookFeaturesAPI {
  private baseUrl: string;
  private apiKey: string | undefined;

  constructor() {
    this.baseUrl = process.env.GROWTHBOOK_API_URL || 'https://api.growthbook.io/api/v1';
    this.apiKey = process.env.GROWTHBOOK_API_KEY;
  }

  /**
   * Check if GrowthBook API is configured
   */
  isConfigured(): boolean {
    return !!this.apiKey;
  }

  /**
   * Make authenticated request to GrowthBook API
   */
  private async request<T>(endpoint: string): Promise<T> {
    if (!this.apiKey) {
      throw new Error('GrowthBook API key is not configured. Please set GROWTHBOOK_API_KEY in your .env file.');
    }

    const url = `${this.baseUrl}${endpoint}`;

    try {
      const response = await fetch(url, {
        headers: {
          'Authorization': `Bearer ${this.apiKey}`,
          'Content-Type': 'application/json'
        },
        // Add timeout
        signal: AbortSignal.timeout(10000) // 10 second timeout
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(
          `GrowthBook API error: ${response.status} ${response.statusText}. ${errorText}`
        );
      }

      return response.json();
    } catch (error) {
      if (error instanceof Error) {
        if (error.name === 'AbortError') {
          throw new Error('GrowthBook API request timed out');
        }
        throw error;
      }
      throw new Error('Unknown error occurred while fetching from GrowthBook');
    }
  }

  /**
   * List all features with optional filtering
   */
  async listFeatures(options?: {
    projectId?: string;
    limit?: number;
    offset?: number;
  }): Promise<{ features: GrowthBookFeature[]; total: number; hasMore: boolean }> {
    const params = new URLSearchParams();

    if (options?.projectId) {
      params.append('projectId', options.projectId);
    }
    if (options?.limit) {
      params.append('limit', options.limit.toString());
    }
    if (options?.offset) {
      params.append('offset', options.offset.toString());
    }

    const query = params.toString() ? `?${params.toString()}` : '';
    const result = await this.request<{
      features: GrowthBookFeature[];
      total: number;
      hasMore: boolean;
    }>(`/features${query}`);

    return result;
  }

  /**
   * Get single feature by ID with full configuration
   */
  async getFeature(featureId: string): Promise<GrowthBookFeature | null> {
    try {
      const result = await this.request<{ feature: GrowthBookFeature }>(
        `/features/${featureId}?includeRevisions=published`
      );
      return result.feature;
    } catch (error) {
      console.error(`Error fetching feature ${featureId}:`, error);
      return null;
    }
  }

  /**
   * Search features by key or name
   */
  async searchFeatures(searchTerm: string, projectId?: string): Promise<GrowthBookFeature[]> {
    const result = await this.listFeatures({
      projectId,
      limit: 100
    });

    // Filter by key matching search term
    const lowerSearch = searchTerm.toLowerCase();
    return result.features.filter(f =>
      f.key.toLowerCase().includes(lowerSearch) ||
      (f.description && f.description.toLowerCase().includes(lowerSearch))
    );
  }

  /**
   * Find feature by exact key match
   */
  async getFeatureByKey(key: string, projectId?: string): Promise<GrowthBookFeature | null> {
    const features = await this.searchFeatures(key, projectId);
    return features.find(f => f.key === key) || null;
  }

  /**
   * Extract experiment info from feature rules
   */
  extractExperiments(
    feature: GrowthBookFeature,
    environment = 'production'
  ): ExperimentInfo[] {
    const env = feature.environments[environment];
    if (!env) return [];

    return env.rules
      .filter(rule => rule.type === 'experiment' && rule.enabled !== false)
      .map(rule => ({
        type: 'experiment' as const,
        description: rule.description,
        variations: rule.variations || [],
        coverage: rule.coverage || 1,
        condition: rule.condition,
        trackingKey: rule.trackingKey
      }));
  }

  /**
   * Get human-readable targeting summary from conditions
   */
  getTargetingSummary(
    feature: GrowthBookFeature,
    environment = 'production'
  ): string[] {
    const env = feature.environments[environment];
    if (!env || !env.rules.length) return ['All users'];

    const summaries: string[] = [];

    for (const rule of env.rules) {
      if (!rule.condition) continue;

      const conditions: string[] = [];
      for (const [key, value] of Object.entries(rule.condition)) {
        if (typeof value === 'object' && value !== null) {
          // Handle MongoDB-style operators
          if ('$in' in value && Array.isArray(value.$in)) {
            conditions.push(`${key}: ${value.$in.join(', ')}`);
          } else if ('$eq' in value) {
            conditions.push(`${key} = ${value.$eq}`);
          } else if ('$ne' in value) {
            conditions.push(`${key} ≠ ${value.$ne}`);
          } else if ('$gt' in value) {
            conditions.push(`${key} > ${value.$gt}`);
          } else if ('$gte' in value) {
            conditions.push(`${key} ≥ ${value.$gte}`);
          } else if ('$lt' in value) {
            conditions.push(`${key} < ${value.$lt}`);
          } else if ('$lte' in value) {
            conditions.push(`${key} ≤ ${value.$lte}`);
          } else {
            conditions.push(`${key}: ${JSON.stringify(value)}`);
          }
        } else {
          conditions.push(`${key} = ${value}`);
        }
      }

      if (conditions.length > 0) {
        summaries.push(conditions.join(' AND '));
      }
    }

    return summaries.length > 0 ? summaries : ['All users'];
  }

  /**
   * Format rule type for display
   */
  getRuleTypeLabel(rule: GrowthBookRule): string {
    switch (rule.type) {
      case 'experiment':
        return 'A/B Test';
      case 'rollout':
        return 'Gradual Rollout';
      case 'force':
        return 'Override';
      default:
        return rule.type;
    }
  }

  /**
   * Get environment status for a feature
   */
  getEnvironmentStatus(
    feature: GrowthBookFeature,
    environment = 'production'
  ): {
    enabled: boolean;
    hasExperiments: boolean;
    hasRollouts: boolean;
    hasOverrides: boolean;
    ruleCount: number;
  } {
    const env = feature.environments[environment];

    if (!env) {
      return {
        enabled: false,
        hasExperiments: false,
        hasRollouts: false,
        hasOverrides: false,
        ruleCount: 0
      };
    }

    return {
      enabled: env.enabled,
      hasExperiments: env.rules.some(r => r.type === 'experiment'),
      hasRollouts: env.rules.some(r => r.type === 'rollout'),
      hasOverrides: env.rules.some(r => r.type === 'force'),
      ruleCount: env.rules.length
    };
  }

  /**
   * Check if a feature has any targeting conditions
   */
  hasTargeting(feature: GrowthBookFeature, environment = 'production'): boolean {
    const env = feature.environments[environment];
    if (!env) return false;

    return env.rules.some(rule => rule.condition && Object.keys(rule.condition).length > 0);
  }
}

// Export singleton instance
export const growthbookAPI = new GrowthBookFeaturesAPI();
