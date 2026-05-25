import type { Confidence } from "./types";

export function calculateConfidence(
  userRepoContributorsCount: number,
  famousRepoContributorsCount: number,
): Confidence {
  const max = Math.max(userRepoContributorsCount, famousRepoContributorsCount);

  if (max <= 100) return "strong";
  if (max <= 500) return "medium";
  return "weak";
}

export const CONFIDENCE_COPY: Record<Confidence, string> = {
  strong: "Smaller repositories, likely more meaningful.",
  medium: "Moderate-size repositories.",
  weak: "Large repositories, connection may be noisy.",
};
