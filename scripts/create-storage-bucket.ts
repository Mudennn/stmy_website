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

async function createBucket() {
  try {
    // Create event-images bucket
    const { error } = await supabase.storage.createBucket(
      "event-images",
      { public: true }
    );

    if (error) {
      if (error.message.includes("already exists")) {
        console.log("✓ Bucket 'event-images' already exists");
      } else {
        throw error;
      }
    } else {
      console.log("✓ Created bucket 'event-images'");
    }

    console.log("✓ Storage setup complete");
  } catch (error) {
    console.error("✗ Failed to create bucket:", error);
    process.exit(1);
  }
}

createBucket();
