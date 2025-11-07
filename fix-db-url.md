The password in your connection string contains special characters that might need URL encoding.

For Supabase, the easiest solution is to:

1. Go to Supabase Dashboard > Project Settings > Database
2. Under "Connection string", select "URI" mode
3. Copy the ENTIRE string they provide (it's already properly formatted)
4. Replace your DATABASE_URL in .env with that exact string

The connection string should look like one of these formats:

Option 1 (Connection Pooler - Recommended):
postgresql://postgres.peyovrwqjjhgjivnbjlm:[PASSWORD]@aws-0-us-east-1.pooler.supabase.com:6543/postgres?sslmode=require

Option 2 (Direct Connection):
postgresql://postgres:[PASSWORD]@db.peyovrwqjjhgjivnbjlm.supabase.co:5432/postgres?sslmode=require

Make sure to copy the EXACT string from Supabase dashboard - it handles URL encoding automatically.

If your password has special characters, Supabase's connection string generator will encode them properly.
