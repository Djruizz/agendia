import type { Database } from "./database.types";

export type BusinessProfile = Database["public"]["Tables"]["business_profiles"]["Row"];
export type BusinessProfileInsert = Database["public"]["Tables"]["business_profiles"]["Insert"];
export type BusinessProfileUpdate = Database["public"]["Tables"]["business_profiles"]["Update"];
