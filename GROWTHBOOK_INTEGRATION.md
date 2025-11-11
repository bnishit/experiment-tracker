# GrowthBook Integration Guide

This document explains how the GrowthBook Feature Flags integration works in the Experiment Tracker application.

## Overview

The Experiment Tracker now integrates with **GrowthBook Feature Flags** to provide a hybrid approach where:
- **Your Database**: Stores custom metadata (friendly names, platforms, live dates, user group labels, context notes, etc.)
- **GrowthBook API**: Provides live feature flag configuration, A/B test variations, targeting rules, and status

## Architecture

```
┌─────────────┐
│   Frontend  │
│   (React)   │
└──────┬──────┘
       │
       ├─ Fetch experiments from your API
       │
       v
┌─────────────────────┐
│  Your Next.js API   │
│  /api/experiments   │
└──────┬──────────────┘
       │
       ├─ Read from Prisma DB (your metadata)
       │
       ├─ Enrich with GrowthBook API (live config)
       │
       v
┌─────────────────────┐
│  GrowthBook REST    │
│  api.growthbook.io  │
└─────────────────────┘
```

## Data Ownership Model

### What GrowthBook Provides
- **Feature Key**: Unique identifier for the feature flag
- **Status**: Enabled/Disabled per environment
- **Variations**: A/B test configurations (Control, Treatment, etc.)
- **Targeting Rules**: Conditions for who sees the experiment
- **Traffic Split**: Percentage distribution across variations
- **Default Value**: Fallback value when no rules match
- **Tags**: GrowthBook categorization

### What Your Database Stores
- **Friendly Name**: "New Checkout Flow" instead of "checkout_v2"
- **Live Date**: When YOU launched to customers (business date)
- **Platforms**: Your categorization (web, mobile, ios, android)
- **User Group**: Human-readable labels ("Premium Users")
- **Context**: Your team's markdown notes
- **Numbers List**: Your internal tracking numbers
- **Version History**: Your change log

## Setup Instructions

### 1. Environment Variables

Create a `.env.local` file with the following variables:

```bash
# Database
DATABASE_URL="postgresql://user:password@host:port/database?sslmode=require"

# Supabase
NEXT_PUBLIC_SUPABASE_URL="https://your-project.supabase.co"
NEXT_PUBLIC_SUPABASE_ANON_KEY="your-anon-key"

# GrowthBook Integration
GROWTHBOOK_API_URL="https://api.growthbook.io/api/v1"
GROWTHBOOK_API_KEY="secret_your_api_key_here"
GROWTHBOOK_PROJECT_ID="prj_your_project_id"  # Optional
```

### 2. Get GrowthBook API Key

1. Log into your GrowthBook account at https://app.growthbook.io
2. Navigate to Settings → API Keys
3. Create a new **Secret Key** with appropriate permissions:
   - **Read-only** if you only want to fetch data
   - **Admin** if you want to create/update features (future enhancement)
4. Copy the key and add it to your `.env.local` file

### 3. Run Database Migration

After setting up your DATABASE_URL, run the migration to add GrowthBook fields:

```bash
npx prisma migrate dev --name add_growthbook_integration
```

This adds the following fields to the `Experiment` model:
- `growthbookFeatureId` - Links to GrowthBook feature ID
- `growthbookProjectId` - Optional GrowthBook project ID
- `lastSyncedAt` - Cache timestamp for GrowthBook data
- `owner` - Optional PM/Engineer name
- `tags` - Optional custom tags

## Features

### 1. View GrowthBook Data

When you view an experiment that's linked to GrowthBook:
- **Feature Status**: Shows if enabled/disabled in production
- **A/B Test Configuration**: Displays all variations with traffic percentages
- **Targeting Rules**: Shows conditions for who sees the experiment
- **Tags**: Displays GrowthBook categorization
- **Revision History**: Shows version and last update date

All GrowthBook data is displayed in blue-themed sections to distinguish it from your local metadata.

### 2. Link Experiments to GrowthBook Features

From the Admin Panel:
1. Click the **"Link GB"** button next to any experiment
2. Search for features by key (e.g., "checkout_v2")
3. Browse results showing:
   - Feature key and status
   - Whether it has A/B tests or rollouts
   - If it's already linked to another experiment
4. Click **"Link"** to connect the experiment
5. The experiment will now show live GrowthBook data

### 3. Unlink from GrowthBook

1. Click the **"Relink"** button on a linked experiment
2. In the dialog, click **"Unlink"** at the top
3. The experiment will no longer fetch GrowthBook data

### 4. Caching Strategy

GrowthBook data is cached for **5 minutes** to:
- Reduce API calls
- Improve response time
- Stay within API rate limits

The cache is automatically refreshed when:
- 5 minutes have passed since last fetch
- You manually sync (future feature)

## API Endpoints

### GET /api/experiments/:id
Fetches experiment with merged GrowthBook data.

**Response**:
```json
{
  "id": "clx123",
  "name": "New Checkout Flow",
  "expParameter": "checkout_v2",
  "platforms": ["web", "mobile"],
  "liveDate": "2025-01-15",
  "userGroup": "Premium Users",
  "growthbookFeatureId": "feat_abc123",
  "growthbook": {
    "key": "checkout_v2",
    "enabled": true,
    "valueType": "boolean",
    "defaultValue": false,
    "experiments": [
      {
        "variations": [
          { "name": "Control", "value": false, "weight": 0.5 },
          { "name": "Treatment", "value": true, "weight": 0.5 }
        ],
        "coverage": 1.0
      }
    ],
    "targetingSummary": ["userGroup: premium_users, beta_users"]
  }
}
```

### POST /api/experiments/:id/link
Links an experiment to a GrowthBook feature.

**Request Body**:
```json
{
  "growthbookFeatureId": "feat_abc123"
}
```

**Response**:
```json
{
  "success": true,
  "experiment": { ... },
  "feature": {
    "key": "checkout_v2",
    "enabled": true,
    "valueType": "boolean"
  }
}
```

### DELETE /api/experiments/:id/link
Unlinks an experiment from GrowthBook.

**Response**:
```json
{
  "success": true,
  "experiment": { ... }
}
```

### POST /api/experiments/:id/sync
Force refreshes GrowthBook data for an experiment.

**Response**:
```json
{
  "success": true,
  "lastSyncedAt": "2025-11-11T10:35:00Z",
  "growthbook": { ... }
}
```

### GET /api/growthbook/features?search=<term>
Searches GrowthBook features.

**Response**:
```json
{
  "features": [
    {
      "id": "feat_abc123",
      "key": "checkout_v2",
      "valueType": "boolean",
      "enabled": true,
      "hasExperiments": true,
      "alreadyLinked": false,
      "linkedTo": null
    }
  ],
  "count": 1
}
```

## UI Components

### 1. GrowthBook Badge
- Shows **🚩 GrowthBook** badge on linked experiments
- Appears in both public dashboard and admin panel
- Blue-themed to stand out from Active/Inactive badges

### 2. GrowthBook Section (Expanded View)
When you expand an experiment card:
- Shows feature key, status, type, and default value
- Displays A/B test variations with traffic percentages
- Lists GrowthBook tags
- All in a blue-themed section

### 3. GrowthBook Modal Details
The "View Full Details" modal includes:
- Complete feature configuration
- A/B test setup with coverage percentages
- Targeting conditions in human-readable format
- Version history from GrowthBook

### 4. Link Dialog
Interactive dialog to search and link features:
- Real-time search with filtering
- Shows feature status and configuration
- Indicates if features are already linked
- Allows unlinking existing connections

## Code Structure

```
src/
├── lib/
│   └── growthbook-api.ts          # GrowthBook API client
├── components/
│   ├── experiment-table.tsx        # Updated with GrowthBook display
│   └── growthbook-link-dialog.tsx  # Link dialog component
└── app/
    ├── api/
    │   ├── experiments/
    │   │   └── [id]/
    │   │       ├── route.ts         # Updated with GrowthBook enrichment
    │   │       ├── link/route.ts    # Link/unlink endpoints
    │   │       └── sync/route.ts    # Manual sync endpoint
    │   └── growthbook/
    │       └── features/route.ts    # Search features endpoint
    └── admin/
        └── page.tsx                 # Updated with link button
```

## Workflow Examples

### Creating a New Experiment

1. **In Your App**:
   - Create experiment with your metadata
   - Set friendly name, platforms, live date, etc.
   - Save to your database

2. **Link to GrowthBook** (optional):
   - Click "Link GB" button
   - Search for matching feature in GrowthBook
   - Link the two together

3. **View Merged Data**:
   - Your metadata + live GrowthBook configuration
   - All displayed in one unified view

### Importing from GrowthBook

1. Click "Link GB" on any experiment
2. Search for GrowthBook features
3. Find features not yet linked
4. Link them to existing experiments OR
5. Create new experiments for unlinked features

## Error Handling

The integration gracefully handles errors:

- **GrowthBook API Down**: Displays your local data without GrowthBook enrichment
- **Invalid API Key**: Shows error message but app continues to work
- **Feature Not Found**: Allows unlinking and re-linking
- **Rate Limits**: Caching reduces likelihood of hitting limits

Errors are logged to console for debugging.

## Best Practices

1. **Naming Convention**: Use consistent naming between your `expParameter` field and GrowthBook feature keys
   - Example: `expParameter: "checkout_v2"` → GrowthBook key: `checkout_v2`

2. **Documentation**: Use your `context` field to document business decisions that aren't in GrowthBook

3. **Version History**: Track business-level changes in your version history
   - GrowthBook tracks configuration changes
   - You track launch milestones and business decisions

4. **Platforms**: Use your platforms field for your categorization
   - GrowthBook's targeting rules may differ from your platform labels

5. **Caching**: The 5-minute cache is optimal for most use cases
   - Modify `CACHE_TTL` in route.ts if needed

## Future Enhancements

Potential features to implement:
- [ ] Bulk import from GrowthBook
- [ ] Sync button to force refresh
- [ ] Webhook integration for real-time updates
- [ ] Create GrowthBook features from your app
- [ ] Display experiment results/metrics (requires separate GrowthBook setup)
- [ ] SDK integration for client-side feature flags

## Troubleshooting

### GrowthBook Data Not Showing

1. Check environment variables are set:
   ```bash
   echo $GROWTHBOOK_API_KEY
   ```

2. Verify experiment is linked:
   - Check `growthbookFeatureId` field in database

3. Check cache:
   - Wait 5 minutes or restart server to clear cache

4. Check GrowthBook API:
   - Test API key with curl:
   ```bash
   curl -H "Authorization: Bearer $GROWTHBOOK_API_KEY" \
        https://api.growthbook.io/api/v1/features
   ```

### "Failed to Link" Error

- Verify the GrowthBook feature ID exists
- Check API key has correct permissions
- Ensure feature isn't already linked to another experiment

### Prisma Errors After Migration

If you see Prisma errors:
```bash
npx prisma generate
npx prisma db push  # Alternative to migrate dev
```

## Support

- **GrowthBook Docs**: https://docs.growthbook.io
- **GrowthBook API Docs**: https://docs.growthbook.io/api
- **Prisma Docs**: https://www.prisma.io/docs

## Summary

This integration gives you the best of both worlds:
- ✅ Your custom business metadata
- ✅ Live GrowthBook feature flag configuration
- ✅ Graceful degradation if GrowthBook is unavailable
- ✅ Flexible linking - not all experiments need to be in GrowthBook
- ✅ Beautiful UI that clearly separates your data from GrowthBook data

The hybrid approach ensures you maintain full control while leveraging GrowthBook's powerful feature flag and A/B testing capabilities.
