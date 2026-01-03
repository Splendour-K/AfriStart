import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

const DEFAULT_SCHOOL_DOMAIN_PATTERNS: RegExp[] = [
  /\.edu(\.[a-z]{2,3})?$/i,
  /\.ac\.[a-z]{2,3}$/i,
  /\.edu\.[a-z]{2,3}$/i,
  /\.sch\.[a-z]{2,3}$/i,
  /\.ac\.ke$/i,
  /\.ac\.ug$/i,
  /\.ac\.za$/i,
  /\.ac\.ng$/i,
  /\.edu\.ng$/i,
  /\.edu\.gh$/i,
];

/**
 * Determines whether the provided email belongs to a verified school domain.
 * Uses a mix of configurable allow-list and common academic TLD patterns (.edu, .ac.xx, etc.).
 */
export function isVerifiedSchoolEmail(email?: string | null): boolean {
  if (!email) return false;
  const domain = email.split("@")[1]?.toLowerCase();
  if (!domain) return false;

  const customDomains = (import.meta.env.VITE_VERIFIED_SCHOOL_DOMAINS || "")
    .split(",")
    .map((d) => d.trim().toLowerCase())
    .filter(Boolean);

  if (customDomains.includes(domain)) {
    return true;
  }

  return DEFAULT_SCHOOL_DOMAIN_PATTERNS.some((pattern) => pattern.test(domain));
}
