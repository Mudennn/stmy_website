import { createClient } from "@supabase/supabase-js";
import * as fs from "fs";
import * as path from "path";

// Load .env.local
const envPath = path.join(process.cwd(), ".env.local");
const envContent = fs.readFileSync(envPath, "utf-8");
const envVars = Object.fromEntries(
  envContent
    .split("\n")
    .filter((line) => line && !line.startsWith("#"))
    .map((line) => line.split("="))
);

const supabaseUrl = envVars["NEXT_PUBLIC_SUPABASE_URL"];
const supabaseServiceKey = envVars["SUPABASE_SERVICE_ROLE_KEY"];

const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false,
  },
});

async function fixPolicies() {
  try {
    // Read the migration file
    const migrationPath = path.join(process.cwd(), "supabase/migrations/009_storage_buckets.sql");
    const sql = fs.readFileSync(migrationPath, "utf-8");

    // Execute the migration
    const { error } = await supabase.rpc("exec", { sql });

    if (error) {
      console.error("✗ Failed to apply policies:", error);
      process.exit(1);
    }

    console.log("✓ Storage policies updated");
  } catch (error) {
    console.error("✗ Error:", error);
    process.exit(1);
  }
}

fixPolicies();
