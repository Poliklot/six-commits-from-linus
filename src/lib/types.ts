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

export type FamousIndexRepo = {
  contributors: string[];
  contributorsCount: number;
};

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
};

export type PathNode =
  | { type: "user"; login: string; label?: string }
  | { type: "repo"; fullName: string; label?: string };

export type HandshakeResult =
  | {
      status: "found";
      targetLogin: string;
      targetName: string;
      degrees: number;
      hops: number;
      confidence: Confidence;
      path: PathNode[];
      explanation: string;
    }
  | {
      status: "not_found";
      explanation: string;
    }
  | {
      status: "error";
      message: string;
    };
