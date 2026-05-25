export type FamousDev = {
  login: string;
  name: string;
  category: string;
  anchorRepos: string[];
  notes?: string;
};

const CORE_FAMOUS_DEVS: FamousDev[] = [
  {
    login: "torvalds",
    name: "Linus Torvalds",
    category: "Linux",
    anchorRepos: ["torvalds/linux", "git/git"],
  },
  {
    login: "gvanrossum",
    name: "Guido van Rossum",
    category: "Python",
    anchorRepos: ["python/cpython"],
  },
  {
    login: "matz",
    name: "Yukihiro Matsumoto",
    category: "Ruby",
    anchorRepos: ["ruby/ruby", "mruby/mruby"],
  },
  {
    login: "dhh",
    name: "David Heinemeier Hansson",
    category: "Ruby on Rails",
    anchorRepos: ["rails/rails", "basecamp/kamal"],
  },
  {
    login: "yyx990803",
    name: "Evan You",
    category: "Vue / Vite",
    anchorRepos: ["vuejs/core", "vuejs/vue", "vitejs/vite"],
  },
  {
    login: "gaearon",
    name: "Dan Abramov",
    category: "React",
    anchorRepos: ["facebook/react", "reduxjs/redux"],
  },
  {
    login: "sebmarkbage",
    name: "Sebastian Markbåge",
    category: "React",
    anchorRepos: ["facebook/react"],
  },
  {
    login: "acdlite",
    name: "Andrew Clark",
    category: "React",
    anchorRepos: ["facebook/react"],
  },
  {
    login: "bvaughn",
    name: "Brian Vaughn",
    category: "React",
    anchorRepos: ["facebook/react", "bvaughn/react-virtualized"],
  },
  {
    login: "Rich-Harris",
    name: "Rich Harris",
    category: "Svelte",
    anchorRepos: ["sveltejs/svelte", "sveltejs/kit"],
  },
  {
    login: "developit",
    name: "Jason Miller",
    category: "Preact",
    anchorRepos: ["preactjs/preact", "developit/htm"],
  },
  {
    login: "mjackson",
    name: "Michael Jackson",
    category: "React Router / Remix",
    anchorRepos: ["remix-run/react-router", "remix-run/remix"],
  },
  {
    login: "ryanflorence",
    name: "Ryan Florence",
    category: "React Router / Remix",
    anchorRepos: ["remix-run/react-router", "remix-run/remix"],
  },
  {
    login: "kentcdodds",
    name: "Kent C. Dodds",
    category: "Testing / React",
    anchorRepos: [
      "testing-library/react-testing-library",
      "kentcdodds/testing-library-docs",
    ],
  },
  {
    login: "getify",
    name: "Kyle Simpson",
    category: "JavaScript",
    anchorRepos: ["getify/You-Dont-Know-JS", "getify/Functional-Light-JS"],
  },
  {
    login: "sindresorhus",
    name: "Sindre Sorhus",
    category: "JavaScript / OSS",
    anchorRepos: ["sindresorhus/awesome", "sindresorhus/got", "sindresorhus/execa"],
  },
  {
    login: "tj",
    name: "TJ Holowaychuk",
    category: "Node.js",
    anchorRepos: ["expressjs/express", "tj/commander.js", "tj/node-progress"],
  },
  {
    login: "isaacs",
    name: "Isaac Z. Schlueter",
    category: "npm / Node.js",
    anchorRepos: ["npm/cli", "nodejs/node", "isaacs/node-glob"],
  },
  {
    login: "mcollina",
    name: "Matteo Collina",
    category: "Node.js",
    anchorRepos: ["fastify/fastify", "nodejs/node"],
    notes: "Replaced the unavailable @substack account from the initial seed list.",
  },
  {
    login: "feross",
    name: "Feross Aboukhadijeh",
    category: "JavaScript / WebTorrent",
    anchorRepos: ["webtorrent/webtorrent", "standard/standard", "feross/simple-peer"],
  },
  {
    login: "paulirish",
    name: "Paul Irish",
    category: "Web Performance",
    anchorRepos: ["GoogleChrome/lighthouse", "h5bp/html5-boilerplate"],
  },
  {
    login: "addyosmani",
    name: "Addy Osmani",
    category: "Web Performance",
    anchorRepos: [
      "GoogleChrome/lighthouse",
      "addyosmani/essential-js-design-patterns",
    ],
  },
  {
    login: "mrdoob",
    name: "Ricardo Cabello",
    category: "Three.js",
    anchorRepos: ["mrdoob/three.js"],
  },
  {
    login: "jashkenas",
    name: "Jeremy Ashkenas",
    category: "JavaScript",
    anchorRepos: [
      "jashkenas/underscore",
      "jashkenas/backbone",
      "jashkenas/coffeescript",
    ],
  },
  {
    login: "jdalton",
    name: "John-David Dalton",
    category: "JavaScript",
    anchorRepos: ["lodash/lodash"],
  },
  {
    login: "evanw",
    name: "Evan Wallace",
    category: "Build Tools",
    anchorRepos: ["evanw/esbuild"],
  },
  {
    login: "antfu",
    name: "Anthony Fu",
    category: "Vue / Vite",
    anchorRepos: ["antfu/ni", "unocss/unocss", "vitejs/vite"],
  },
  {
    login: "pi0",
    name: "Pooya Parsa",
    category: "Nuxt",
    anchorRepos: ["nuxt/nuxt", "unjs/nitro"],
  },
  {
    login: "tannerlinsley",
    name: "Tanner Linsley",
    category: "TanStack",
    anchorRepos: ["TanStack/query", "TanStack/table", "TanStack/router"],
  },
  {
    login: "colinhacks",
    name: "Colin McDonnell",
    category: "TypeScript",
    anchorRepos: ["colinhacks/zod"],
  },
  {
    login: "rauchg",
    name: "Guillermo Rauch",
    category: "Vercel / Next.js",
    anchorRepos: ["vercel/next.js", "socketio/socket.io"],
  },
  {
    login: "timneutkens",
    name: "Tim Neutkens",
    category: "Next.js",
    anchorRepos: ["vercel/next.js"],
  },
  {
    login: "shadcn",
    name: "shadcn",
    category: "UI",
    anchorRepos: ["shadcn-ui/ui"],
  },
  {
    login: "mitsuhiko",
    name: "Armin Ronacher",
    category: "Python / Flask",
    anchorRepos: ["pallets/flask", "pallets/jinja", "pallets/werkzeug"],
  },
  {
    login: "kennethreitz",
    name: "Kenneth Reitz",
    category: "Python",
    anchorRepos: ["psf/requests", "kennethreitz/requests"],
  },
  {
    login: "tiangolo",
    name: "Sebastián Ramírez",
    category: "Python / FastAPI",
    anchorRepos: ["fastapi/fastapi", "fastapi/sqlmodel"],
  },
  {
    login: "samuelcolvin",
    name: "Samuel Colvin",
    category: "Python / Pydantic",
    anchorRepos: ["pydantic/pydantic"],
  },
  {
    login: "zzzeek",
    name: "Mike Bayer",
    category: "Python / SQLAlchemy",
    anchorRepos: ["sqlalchemy/sqlalchemy", "sqlalchemy/alembic"],
  },
  {
    login: "fabpot",
    name: "Fabien Potencier",
    category: "PHP / Symfony",
    anchorRepos: ["symfony/symfony", "twigphp/Twig"],
  },
  {
    login: "taylorotwell",
    name: "Taylor Otwell",
    category: "PHP / Laravel",
    anchorRepos: ["laravel/framework", "laravel/laravel"],
  },
  {
    login: "rasmus",
    name: "Rasmus Lerdorf",
    category: "PHP",
    anchorRepos: ["php/php-src"],
  },
  {
    login: "nikic",
    name: "Nikita Popov",
    category: "PHP",
    anchorRepos: ["php/php-src", "nikic/PHP-Parser"],
  },
  {
    login: "bradfitz",
    name: "Brad Fitzpatrick",
    category: "Go",
    anchorRepos: ["golang/go", "bradfitz/gomemcache"],
  },
  {
    login: "rsc",
    name: "Russ Cox",
    category: "Go",
    anchorRepos: ["golang/go", "golang/vgo"],
  },
  {
    login: "robpike",
    name: "Rob Pike",
    category: "Go",
    anchorRepos: ["golang/go"],
  },
  {
    login: "davecheney",
    name: "Dave Cheney",
    category: "Go",
    anchorRepos: ["golang/go", "davecheney/httpstat"],
  },
  {
    login: "spf13",
    name: "Steve Francia",
    category: "Go",
    anchorRepos: ["spf13/cobra", "spf13/viper", "gohugoio/hugo"],
  },
  {
    login: "mitchellh",
    name: "Mitchell Hashimoto",
    category: "DevOps / HashiCorp",
    anchorRepos: [
      "hashicorp/terraform",
      "hashicorp/vagrant",
      "mitchellh/mapstructure",
    ],
  },
  {
    login: "antirez",
    name: "Salvatore Sanfilippo",
    category: "Databases / Redis",
    anchorRepos: ["redis/redis", "antirez/redis"],
  },
  {
    login: "kelseyhightower",
    name: "Kelsey Hightower",
    category: "Kubernetes",
    anchorRepos: ["kelseyhightower/kubernetes-the-hard-way", "kubernetes/kubernetes"],
  },
];

const ECOSYSTEM_FAMOUS_DEVS: FamousDev[] = [
  {
    login: "vjeux",
    name: "Christopher Chedeau",
    category: "Prettier / React Native",
    anchorRepos: ["prettier/prettier", "facebook/react-native"],
  },
  {
    login: "fisker",
    name: "Fisker Cheung",
    category: "Prettier",
    anchorRepos: ["prettier/prettier"],
  },
  {
    login: "sosukesuzuki",
    name: "Sosuke Suzuki",
    category: "Prettier",
    anchorRepos: ["prettier/prettier"],
  },
  {
    login: "jlongster",
    name: "James Long",
    category: "JavaScript Tools",
    anchorRepos: ["prettier/prettier", "jlongster/absurd-sql"],
  },
  {
    login: "lydell",
    name: "Simon Lydell",
    category: "Prettier",
    anchorRepos: ["prettier/prettier"],
  },
  {
    login: "ikatyang",
    name: "Ika",
    category: "Prettier",
    anchorRepos: ["prettier/prettier"],
  },
  {
    login: "hzoo",
    name: "Henry Zhu",
    category: "Babel",
    anchorRepos: ["babel/babel", "prettier/prettier"],
  },
  {
    login: "jridgewell",
    name: "Justin Ridgewell",
    category: "JavaScript Tools",
    anchorRepos: ["babel/babel", "rollup/rollup", "prettier/prettier"],
  },
  {
    login: "asottile",
    name: "Anthony Sottile",
    category: "Python / Tooling",
    anchorRepos: ["pre-commit/pre-commit", "prettier/prettier"],
  },
  {
    login: "MylesBorins",
    name: "Myles Borins",
    category: "Node.js",
    anchorRepos: ["nodejs/node"],
  },
  {
    login: "jasnell",
    name: "James M Snell",
    category: "Node.js",
    anchorRepos: ["nodejs/node"],
  },
  {
    login: "Trott",
    name: "Rich Trott",
    category: "Node.js",
    anchorRepos: ["nodejs/node"],
  },
  {
    login: "orta",
    name: "Orta Therox",
    category: "TypeScript",
    anchorRepos: ["microsoft/TypeScript", "DefinitelyTyped/DefinitelyTyped"],
  },
  {
    login: "weswigham",
    name: "Wes Wigham",
    category: "TypeScript",
    anchorRepos: ["microsoft/TypeScript"],
  },
  {
    login: "ahejlsberg",
    name: "Anders Hejlsberg",
    category: "TypeScript",
    anchorRepos: ["microsoft/TypeScript"],
  },
  {
    login: "orta",
    name: "Orta Therox",
    category: "TypeScript",
    anchorRepos: ["microsoft/TypeScript", "DefinitelyTyped/DefinitelyTyped"],
  },
  {
    login: "ljharb",
    name: "Jordan Harband",
    category: "JavaScript Standards",
    anchorRepos: ["eslint/eslint", "tc39/ecma262", "ljharb/qs"],
  },
  {
    login: "nzakas",
    name: "Nicholas C. Zakas",
    category: "ESLint",
    anchorRepos: ["eslint/eslint"],
  },
  {
    login: "feross",
    name: "Feross Aboukhadijeh",
    category: "JavaScript / WebTorrent",
    anchorRepos: ["webtorrent/webtorrent", "standard/standard", "feross/simple-peer"],
    notes: "Kept for JavaScript tooling proximity.",
  },
  {
    login: "mojombo",
    name: "Tom Preston-Werner",
    category: "GitHub / Jekyll",
    anchorRepos: ["jekyll/jekyll", "toml-lang/toml"],
  },
  {
    login: "defunkt",
    name: "Chris Wanstrath",
    category: "GitHub / Ruby",
    anchorRepos: ["defunkt/jquery-pjax", "mustache/mustache"],
  },
  {
    login: "wycats",
    name: "Yehuda Katz",
    category: "Ruby / Ember",
    anchorRepos: ["emberjs/ember.js", "rails/rails"],
  },
  {
    login: "jeresig",
    name: "John Resig",
    category: "JavaScript",
    anchorRepos: ["jquery/jquery"],
  },
  {
    login: "fat",
    name: "Jacob Thornton",
    category: "Bootstrap",
    anchorRepos: ["twbs/bootstrap"],
  },
  {
    login: "mdo",
    name: "Mark Otto",
    category: "Bootstrap",
    anchorRepos: ["twbs/bootstrap"],
  },
  {
    login: "sophiebits",
    name: "Sophie Alpert",
    category: "React",
    anchorRepos: ["facebook/react", "reactjs/react.dev"],
  },
  {
    login: "trueadm",
    name: "Dominic Gannaway",
    category: "React",
    anchorRepos: ["facebook/react"],
  },
  {
    login: "TheLarkInn",
    name: "Sean Larkin",
    category: "Webpack",
    anchorRepos: ["webpack/webpack"],
  },
  {
    login: "alexander-akait",
    name: "Alexandr Akait",
    category: "Webpack",
    anchorRepos: ["webpack/webpack", "prettier/prettier"],
  },
  {
    login: "sokra",
    name: "Tobias Koppers",
    category: "Webpack",
    anchorRepos: ["webpack/webpack"],
  },
  {
    login: "bpasero",
    name: "Benjamin Pasero",
    category: "VS Code",
    anchorRepos: ["microsoft/vscode"],
  },
  {
    login: "chrisdias",
    name: "Chris Dias",
    category: "VS Code",
    anchorRepos: ["microsoft/vscode"],
  },
  {
    login: "davidfowl",
    name: "David Fowler",
    category: ".NET",
    anchorRepos: ["dotnet/aspnetcore", "dotnet/runtime"],
  },
  {
    login: "DamianEdwards",
    name: "Damian Edwards",
    category: ".NET",
    anchorRepos: ["dotnet/aspnetcore"],
  },
  {
    login: "matklad",
    name: "Aleksey Kladov",
    category: "Rust",
    anchorRepos: ["rust-lang/rust-analyzer", "rust-lang/rust"],
  },
  {
    login: "withoutboats",
    name: "Without Boats",
    category: "Rust",
    anchorRepos: ["rust-lang/rust"],
  },
  {
    login: "steveklabnik",
    name: "Steve Klabnik",
    category: "Rust",
    anchorRepos: ["rust-lang/rust", "rust-lang/book"],
  },
];

const uniqueByLogin = new Map<string, FamousDev>();
for (const dev of [...CORE_FAMOUS_DEVS, ...ECOSYSTEM_FAMOUS_DEVS]) {
  const key = dev.login.toLowerCase();
  const existing = uniqueByLogin.get(key);
  if (!existing) {
    uniqueByLogin.set(key, dev);
  } else {
    uniqueByLogin.set(key, {
      ...existing,
      anchorRepos: Array.from(new Set([...existing.anchorRepos, ...dev.anchorRepos])),
      notes: existing.notes ?? dev.notes,
    });
  }
}

export const FAMOUS_DEVS: FamousDev[] = Array.from(uniqueByLogin.values());

