export function GraphPreview() {
  return (
    <aside className="graph-preview" aria-label="Example open-source route">
      <div className="graph-preview__header">
        <div>
          <span className="status-dot" aria-hidden="true" />
          <span>Example route</span>
        </div>
        <code>shortest_path()</code>
      </div>

      <svg
        className="graph-preview__canvas"
        viewBox="0 0 640 430"
        role="img"
        aria-labelledby="graph-preview-title graph-preview-description"
      >
        <title id="graph-preview-title">A one-link route through Prettier</title>
        <desc id="graph-preview-description">
          A highlighted path connects a GitHub user to Prettier and then to Vjeux,
          with nearby repositories shown as inactive branches.
        </desc>
        <defs>
          <pattern id="atlas-grid" width="28" height="28" patternUnits="userSpaceOnUse">
            <path d="M 28 0 L 0 0 0 28" className="graph-preview__grid-line" />
          </pattern>
          <filter id="active-node-shadow" x="-50%" y="-50%" width="200%" height="200%">
            <feDropShadow dx="0" dy="8" stdDeviation="10" floodColor="#1d4ed8" floodOpacity="0.2" />
          </filter>
        </defs>

        <rect width="640" height="430" rx="22" className="graph-preview__backdrop" />
        <rect width="640" height="430" rx="22" fill="url(#atlas-grid)" />

        <g className="graph-preview__inactive" aria-hidden="true">
          <path d="M130 118 C220 74 296 70 382 100" />
          <path d="M286 212 C375 170 450 146 540 162" />
          <path d="M286 212 C350 274 422 306 512 320" />
          <path d="M130 118 C152 234 154 306 220 350" />
          <circle cx="382" cy="100" r="6" />
          <circle cx="540" cy="162" r="6" />
          <circle cx="512" cy="320" r="6" />
          <circle cx="220" cy="350" r="6" />
        </g>

        <g className="graph-preview__route" aria-hidden="true">
          <path d="M130 118 C170 145 208 178 286 212" />
          <path d="M286 212 C352 225 408 242 474 270" />
        </g>

        <g className="graph-preview__node graph-preview__node--user" transform="translate(62 82)">
          <rect width="136" height="72" rx="15" filter="url(#active-node-shadow)" />
          <circle cx="24" cy="25" r="7" />
          <text x="42" y="30" className="graph-preview__label">@you</text>
          <text x="18" y="53" className="graph-preview__meta">PUBLIC PROFILE</text>
        </g>

        <g className="graph-preview__node graph-preview__node--repo" transform="translate(206 176)">
          <rect width="168" height="72" rx="15" filter="url(#active-node-shadow)" />
          <path d="M22 21v28M22 30c0 0 0-7 8-7h5M22 40c0 0 0 7 8 7h5" />
          <circle cx="38" cy="23" r="4" />
          <circle cx="38" cy="47" r="4" />
          <text x="52" y="30" className="graph-preview__label graph-preview__label--repo">prettier/prettier</text>
          <text x="52" y="53" className="graph-preview__meta">MERGED PR</text>
        </g>

        <g className="graph-preview__node graph-preview__node--target" transform="translate(418 234)">
          <rect width="154" height="72" rx="15" filter="url(#active-node-shadow)" />
          <circle cx="24" cy="25" r="7" />
          <text x="42" y="30" className="graph-preview__label">@vjeux</text>
          <text x="18" y="53" className="graph-preview__meta">1 LINK AWAY</text>
        </g>

        <g className="graph-preview__ghost-labels" aria-hidden="true">
          <text x="397" y="91">babel/babel</text>
          <text x="493" y="151">@hzoo</text>
          <text x="465" y="344">facebook/react</text>
          <text x="171" y="376">vitejs/vite</text>
        </g>
      </svg>

      <div className="graph-preview__footer">
        <span><i className="legend-dot legend-dot--route" /> verified route</span>
        <span><i className="legend-dot legend-dot--nearby" /> nearby graph</span>
        <strong>1 contributor link</strong>
      </div>
    </aside>
  );
}
