import { execSync } from "child_process";

/**
 * Apply storage bucket policies by pushing migrations via the Supabase CLI.
 * Requires the Supabase CLI to be installed and `supabase link` to have been run.
 * Alternatively, paste supabase/migrations/009_storage_buckets.sql into the Supabase SQL editor.
 */
try {
  execSync("npx supabase db push", { stdio: "inherit" });
  console.log("✓ Storage policies updated");
} catch {
  console.error("✗ Failed to apply policies. Run manually: npx supabase db push");
  process.exit(1);
}
