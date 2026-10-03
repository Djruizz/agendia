import type { Database, Json } from "./database.types";

export type SocialNetworkKey =
  | "instagram"
  | "facebook"
  | "tiktok"
  | "whatsapp"
  | "x"
  | "youtube"
  | "threads"
  | "linkedin"
  | "pinterest"
  | "telegram"
  | "twitch"
  | "spotify"
  | "snapchat"
  | "other";

export interface BusinessSocialItem {
  [key: string]: Json | undefined;
  network: SocialNetworkKey | string;
  url: string;
}

export type BusinessSocials = BusinessSocialItem[];

export type BusinessProfile = Database["public"]["Tables"]["business_profiles"]["Row"];
export type BusinessProfileInsert = Database["public"]["Tables"]["business_profiles"]["Insert"];
export type BusinessProfileUpdate = Database["public"]["Tables"]["business_profiles"]["Update"];
