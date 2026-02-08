import { cache } from "react";
import { createClient } from "./server";

export const getUser = cache(async () => {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  return user;
});

export const getProfile = cache(async (userId: string) => {
  const supabase = await createClient();
  const { data: profile } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", userId)
    .single();
  return profile;
});

export const getProvider = cache(async (userId: string) => {
  const supabase = await createClient();
  const { data: provider } = await supabase
    .from("providers")
    .select("*")
    .eq("user_id", userId)
    .single();
  return provider;
});

export const getPatient = cache(async (userId: string) => {
  const supabase = await createClient();
  const { data: patient } = await supabase
    .from("patients")
    .select("*")
    .eq("user_id", userId)
    .single();
  return patient;
});
