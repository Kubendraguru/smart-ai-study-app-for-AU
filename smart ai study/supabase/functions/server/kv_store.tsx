// Simple KV Store using Supabase

import { createClient } from "jsr:@supabase/supabase-js@2";

// Supabase configuration
const SUPABASE_URL = "https://kiovptmeuwvazxlanqha.supabase.co";
const SUPABASE_KEY = "sb_publishable_IcX1X2Zrbbu0cbfflLrJUQ_-NQYk0TX";

// Create client
const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

// Table name
const TABLE = "kv_store_5f863bfa";

// Set a key-value pair
export const set = async (key: string, value: any): Promise<void> => {
  const { error } = await supabase.from(TABLE).upsert({
    key,
    value
  });

  if (error) throw new Error(error.message);
};

// Get a value
export const get = async (key: string): Promise<any> => {
  const { data, error } = await supabase
    .from(TABLE)
    .select("value")
    .eq("key", key)
    .maybeSingle();

  if (error) throw new Error(error.message);

  return data?.value;
};

// Delete a key
export const del = async (key: string): Promise<void> => {
  const { error } = await supabase
    .from(TABLE)
    .delete()
    .eq("key", key);

  if (error) throw new Error(error.message);
};

// Multiple set
export const mset = async (keys: string[], values: any[]): Promise<void> => {
  const rows = keys.map((k, i) => ({
    key: k,
    value: values[i]
  }));

  const { error } = await supabase.from(TABLE).upsert(rows);

  if (error) throw new Error(error.message);
};

// Multiple get
export const mget = async (keys: string[]): Promise<any[]> => {
  const { data, error } = await supabase
    .from(TABLE)
    .select("key,value")
    .in("key", keys);

  if (error) throw new Error(error.message);

  return data?.map((d) => d.value) ?? [];
};

// Delete multiple
export const mdel = async (keys: string[]): Promise<void> => {
  const { error } = await supabase
    .from(TABLE)
    .delete()
    .in("key", keys);

  if (error) throw new Error(error.message);
};

// Search by prefix
export const getByPrefix = async (prefix: string): Promise<any[]> => {
  const { data, error } = await supabase
    .from(TABLE)
    .select("key,value")
    .like("key", prefix + "%");

  if (error) throw new Error(error.message);

  return data?.map((d) => d.value) ?? [];
};