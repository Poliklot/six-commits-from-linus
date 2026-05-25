export type Confidence = "strong" | "medium" | "weak";

export type GitHubUser = {
  login: string;
  id: number;
  html_url: string;
};

export type GitHubRepo = {
  id: number;
  name: string;
  full_name: string;
  fork: boolean;
  archived: boolean;
  stargazers_count: number;
  pushed_at: string | null;
};

export type GitHubContributor = {
  login: string;
  id: number;
  contributions: number;
  html_url: string;
};

export type IndexedRepo = {
  contributors: string[];
  contributorsCount: number;
  category?: string;
  indexedFor?: Array<"famous" | "bridge">;
};

export type FamousIndexRepo = IndexedRepo;

export type FamousIndexEntry = {
  login: string;
  name: string;
  category: string;
  repos: Record<string, FamousIndexRepo>;
};

export type ContributorFamousRepo = {
  famousLogin: string;
  famousName: string;
  repo: string;
};

export type FamousIndex = {
  generatedAt: string | null;
  famous: Record<string, FamousIndexEntry>;
  contributorToFamousRepos: Record<string, ContributorFamousRepo[]>;
  repoToContributors?: Record<string, IndexedRepo>;
  contributorToRepos?: Record<string, string[]>;
  stats?: {
    famousCount: number;
    bridgeRepoCount: number;
    indexedRepoCount: number;
    contributorCount: number;
    warningCount: number;
  };
};

export type PathNode =
  | { type: "user"; login: string; label?: string }
  | { type: "repo"; fullName: string; label?: string };

export type HandshakeMatch = {
  targetLogin: string;
  targetName: string;
  targetCategory?: string;
  degrees: number;
  hops: number;
  confidence: Confidence;
  path: PathNode[];
  explanation: string;
  source: "target" | "closest" | "repo-hint" | "profile-scan" | "cached-index";
  verifiedUserInRepo?: boolean;
};

export type HandshakeResult =
  | ({
      status: "found";
      searchMode: "target" | "closest";
      summary: string;
      alternatives: HandshakeMatch[];
      indexGeneratedAt: string | null;
    } & HandshakeMatch)
  | {
      status: "not_found";
      explanation: string;
      indexGeneratedAt?: string | null;
    }
  | {
      status: "error";
      message: string;
    };

export type HandshakeSearchOptions = {
  fromLogin: string;
  toFamousLogin?: string;
  contributedRepo?: string;
  mode: "target" | "closest";
};
