# Supabase Setup for Nexora MVP

## Method 1: Supabase Dashboard (Recommended)

1. Go to your Supabase project dashboard
2. Navigate to **SQL Editor**
3. Copy and paste the contents of `01-create-tables.sql`
4. Click **Run** to execute

## Method 2: Supabase CLI

```bash
# Install Supabase CLI if not installed
npm install -g supabase

# Login to Supabase
supabase login

# Link to your project
supabase link --project-ref YOUR_PROJECT_REF

# Run the migration
supabase db push --include-all
```

## Method 3: Direct SQL Execution

```bash
# Run SQL file directly (requires project URL and anon key)
psql "postgresql://postgres:[PASSWORD]@[PROJECT_REF].supabase.co:5432/postgres" -f scripts/01-create-tables.sql
```

Your `01-create-tables.sql` file is already Supabase-ready with:
- ✅ RLS policies using `auth.uid()`
- ✅ Proper table structure
- ✅ Authentication integration