import { Hono } from "jsr:@hono/hono";
import { cors } from "jsr:@hono/hono/cors";
import { logger } from "jsr:@hono/hono/logger";
import { createClient } from "jsr:@supabase/supabase-js@2";

// Supabase connection
const supabase = createClient(
  "https://kiovptmeuwvazxlanqha.supabase.co",
  "sb_publishable_IcX1X2Zrbbu0cbfflLrJUQ_-NQYk0TX"
);

const app = new Hono();

app.use("*", logger());
app.use("*", cors());

// Root route
app.get("/", (c) => {
  return c.text("AI Study Backend Running 🚀");
});

// Save data
app.post("/set", async (c) => {
  const body = await c.req.json();

  const { key, value } = body;

  const { error } = await supabase
    .from("kv_store_5f863bfa")
    .upsert({ key, value });

  if (error) {
    return c.json({ error: error.message });
  }

  return c.json({ message: "Data stored successfully" });
});

// Get data
app.get("/get/:key", async (c) => {
  const key = c.req.param("key");

  const { data, error } = await supabase
    .from("kv_store_5f863bfa")
    .select("value")
    .eq("key", key)
    .maybeSingle();

  if (error) {
    return c.json({ error: error.message });
  }

  return c.json({ data: data?.value });
});

// Delete data
app.delete("/delete/:key", async (c) => {
  const key = c.req.param("key");

  const { error } = await supabase
    .from("kv_store_5f863bfa")
    .delete()
    .eq("key", key);

  if (error) {
    return c.json({ error: error.message });
  }

  return c.json({ message: "Deleted successfully" });
});

// Start server
Deno.serve(app.fetch);