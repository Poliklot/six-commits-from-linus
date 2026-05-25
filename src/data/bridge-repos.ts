export type BridgeRepo = {
  fullName: string;
  category: string;
  weight?: number;
  notes?: string;
};

export const BRIDGE_REPOS: BridgeRepo[] = [
  // JavaScript core / formatter / compiler ecosystem
  { fullName: "prettier/prettier", category: "JavaScript Tooling", weight: 10 },
  { fullName: "babel/babel", category: "JavaScript Tooling", weight: 9 },
  { fullName: "eslint/eslint", category: "JavaScript Tooling", weight: 9 },
  { fullName: "microsoft/TypeScript", category: "TypeScript", weight: 10 },
  { fullName: "DefinitelyTyped/DefinitelyTyped", category: "TypeScript", weight: 8 },
  { fullName: "webpack/webpack", category: "JavaScript Tooling", weight: 8 },
  { fullName: "rollup/rollup", category: "JavaScript Tooling", weight: 8 },
  { fullName: "parcel-bundler/parcel", category: "JavaScript Tooling", weight: 7 },
  { fullName: "swc-project/swc", category: "JavaScript Tooling", weight: 8 },
  { fullName: "biomejs/biome", category: "JavaScript Tooling", weight: 7 },
  { fullName: "vitejs/vite", category: "Frontend", weight: 10 },
  { fullName: "vitest-dev/vitest", category: "Testing", weight: 7 },
  { fullName: "testing-library/react-testing-library", category: "Testing", weight: 7 },
  { fullName: "jestjs/jest", category: "Testing", weight: 8 },
  { fullName: "microsoft/playwright", category: "Testing", weight: 8 },

  // Frontend frameworks
  { fullName: "facebook/react", category: "Frontend", weight: 10 },
  { fullName: "reactjs/react.dev", category: "Frontend", weight: 6 },
  { fullName: "vercel/next.js", category: "Frontend", weight: 10 },
  { fullName: "vuejs/core", category: "Frontend", weight: 9 },
  { fullName: "vuejs/vue", category: "Frontend", weight: 7 },
  { fullName: "sveltejs/svelte", category: "Frontend", weight: 8 },
  { fullName: "sveltejs/kit", category: "Frontend", weight: 7 },
  { fullName: "angular/angular", category: "Frontend", weight: 8 },
  { fullName: "preactjs/preact", category: "Frontend", weight: 7 },
  { fullName: "solidjs/solid", category: "Frontend", weight: 7 },
  { fullName: "remix-run/react-router", category: "Frontend", weight: 7 },
  { fullName: "remix-run/remix", category: "Frontend", weight: 7 },
  { fullName: "TanStack/query", category: "Frontend", weight: 7 },
  { fullName: "TanStack/router", category: "Frontend", weight: 6 },
  { fullName: "shadcn-ui/ui", category: "UI", weight: 8 },
  { fullName: "tailwindlabs/tailwindcss", category: "UI", weight: 9 },
  { fullName: "twbs/bootstrap", category: "UI", weight: 8 },
  { fullName: "jquery/jquery", category: "Frontend", weight: 7 },
  { fullName: "mrdoob/three.js", category: "Graphics", weight: 7 },

  // Node / runtime / backend JS
  { fullName: "nodejs/node", category: "Runtime", weight: 10 },
  { fullName: "denoland/deno", category: "Runtime", weight: 8 },
  { fullName: "oven-sh/bun", category: "Runtime", weight: 8 },
  { fullName: "expressjs/express", category: "Backend", weight: 8 },
  { fullName: "fastify/fastify", category: "Backend", weight: 7 },
  { fullName: "nestjs/nest", category: "Backend", weight: 7 },
  { fullName: "socketio/socket.io", category: "Backend", weight: 7 },
  { fullName: "npm/cli", category: "Package Managers", weight: 8 },
  { fullName: "pnpm/pnpm", category: "Package Managers", weight: 7 },
  { fullName: "yarnpkg/berry", category: "Package Managers", weight: 7 },

  // Python
  { fullName: "python/cpython", category: "Python", weight: 10 },
  { fullName: "pallets/flask", category: "Python", weight: 7 },
  { fullName: "django/django", category: "Python", weight: 9 },
  { fullName: "fastapi/fastapi", category: "Python", weight: 8 },
  { fullName: "pydantic/pydantic", category: "Python", weight: 8 },
  { fullName: "psf/requests", category: "Python", weight: 8 },
  { fullName: "sqlalchemy/sqlalchemy", category: "Python", weight: 8 },
  { fullName: "pytest-dev/pytest", category: "Python", weight: 7 },
  { fullName: "pre-commit/pre-commit", category: "Python Tooling", weight: 7 },
  { fullName: "numpy/numpy", category: "Python Data", weight: 9 },
  { fullName: "pandas-dev/pandas", category: "Python Data", weight: 9 },
  { fullName: "scikit-learn/scikit-learn", category: "Python Data", weight: 8 },

  // Go / cloud native / infra
  { fullName: "golang/go", category: "Go", weight: 10 },
  { fullName: "kubernetes/kubernetes", category: "Cloud Native", weight: 10 },
  { fullName: "kubernetes/website", category: "Cloud Native", weight: 6 },
  { fullName: "moby/moby", category: "Cloud Native", weight: 8 },
  { fullName: "containerd/containerd", category: "Cloud Native", weight: 7 },
  { fullName: "prometheus/prometheus", category: "Cloud Native", weight: 8 },
  { fullName: "grafana/grafana", category: "Cloud Native", weight: 8 },
  { fullName: "hashicorp/terraform", category: "Infrastructure", weight: 9 },
  { fullName: "hashicorp/vault", category: "Infrastructure", weight: 8 },
  { fullName: "hashicorp/consul", category: "Infrastructure", weight: 7 },
  { fullName: "spf13/cobra", category: "Go", weight: 6 },
  { fullName: "gohugoio/hugo", category: "Go", weight: 7 },
  { fullName: "gin-gonic/gin", category: "Go", weight: 7 },

  // Rust / systems
  { fullName: "rust-lang/rust", category: "Rust", weight: 10 },
  { fullName: "rust-lang/rust-analyzer", category: "Rust", weight: 8 },
  { fullName: "rust-lang/cargo", category: "Rust", weight: 8 },
  { fullName: "tokio-rs/tokio", category: "Rust", weight: 8 },
  { fullName: "serde-rs/serde", category: "Rust", weight: 7 },
  { fullName: "BurntSushi/ripgrep", category: "Rust", weight: 7 },
  { fullName: "sharkdp/fd", category: "Rust", weight: 6 },

  // Ruby / PHP / .NET
  { fullName: "rails/rails", category: "Ruby", weight: 9 },
  { fullName: "ruby/ruby", category: "Ruby", weight: 8 },
  { fullName: "jekyll/jekyll", category: "Ruby", weight: 7 },
  { fullName: "symfony/symfony", category: "PHP", weight: 8 },
  { fullName: "laravel/framework", category: "PHP", weight: 8 },
  { fullName: "php/php-src", category: "PHP", weight: 8 },
  { fullName: "dotnet/runtime", category: ".NET", weight: 9 },
  { fullName: "dotnet/aspnetcore", category: ".NET", weight: 8 },
  { fullName: "dotnet/roslyn", category: ".NET", weight: 8 },

  // Editors / docs / GitHub ecosystem
  { fullName: "microsoft/vscode", category: "Developer Tools", weight: 10 },
  { fullName: "github/docs", category: "GitHub", weight: 8 },
  { fullName: "github/hub", category: "GitHub", weight: 6 },
  { fullName: "cli/cli", category: "GitHub", weight: 8 },
  { fullName: "git/git", category: "Git", weight: 10 },
  { fullName: "git-lfs/git-lfs", category: "Git", weight: 6 },
  { fullName: "neovim/neovim", category: "Developer Tools", weight: 8 },
  { fullName: "vim/vim", category: "Developer Tools", weight: 7 },
  { fullName: "helix-editor/helix", category: "Developer Tools", weight: 6 },

  // Databases / data infra
  { fullName: "redis/redis", category: "Databases", weight: 8 },
  { fullName: "postgres/postgres", category: "Databases", weight: 9 },
  { fullName: "elastic/elasticsearch", category: "Databases", weight: 8 },
  { fullName: "mongodb/mongo", category: "Databases", weight: 7 },
];
