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
    .map((line) => {
      const idx = line.indexOf("=");
      return [line.slice(0, idx), line.slice(idx + 1)];
    })
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
    const { error: eventError } = await supabase.storage.createBucket(
      "event-images",
      { public: true }
    );

    if (eventError) {
      if (!eventError.message.includes("already exists")) {
        throw eventError;
      }
    }
    console.log("✓ Bucket 'event-images' ready");

    // Create member-images bucket
    const { error: memberError } = await supabase.storage.createBucket(
      "member-images",
      { public: true }
    );

    if (memberError) {
      if (!memberError.message.includes("already exists")) {
        throw memberError;
      }
    }
    console.log("✓ Bucket 'member-images' ready");

    // Create partner-images bucket
    const { error: partnerError } = await supabase.storage.createBucket(
      "partner-images",
      { public: true }
    );

    if (partnerError) {
      if (!partnerError.message.includes("already exists")) {
        throw partnerError;
      }
    }
    console.log("✓ Bucket 'partner-images' ready");

    // Create homepage-images bucket
    const { error: homepageError } = await supabase.storage.createBucket(
      "homepage-images",
      { public: true }
    );

    if (homepageError) {
      if (!homepageError.message.includes("already exists")) {
        throw homepageError;
      }
    }
    console.log("✓ Bucket 'homepage-images' ready");

    console.log("✓ Storage setup complete");
  } catch (error) {
    console.error("✗ Failed to create bucket:", error);
    process.exit(1);
  }
}

createBucket();
