import type { PathNode } from "../lib/types";

type Props = {
  path: PathNode[];
  compact?: boolean;
};

function hrefForNode(node: PathNode): string {
  if (node.type === "user") return `https://github.com/${node.login}`;
  return `https://github.com/${node.fullName}`;
}

function labelForNode(node: PathNode): string {
  if (node.type === "user") return node.label ? `${node.label} (@${node.login})` : `@${node.login}`;
  return node.fullName;
}

export function PathGraph({ path, compact = false }: Props) {
  return (
    <ol className={`path-graph${compact ? " path-graph--compact" : ""}`} aria-label="Open-source route">
      {path.map((node, index) => (
        <li className="path-graph__item" key={`${node.type}-${index}-${labelForNode(node)}`}>
          <a
            className={`path-node path-node--${node.type}`}
            href={hrefForNode(node)}
            target="_blank"
            rel="noreferrer"
          >
            <span className="path-node__index" aria-hidden="true">
              {String(index + 1).padStart(2, "0")}
            </span>
            <span className="path-node__copy">
              <span className="path-node__type">{node.type === "user" ? "person" : "repository"}</span>
              <strong>{labelForNode(node)}</strong>
            </span>
            <span className="path-node__external" aria-hidden="true">↗</span>
          </a>
          {index < path.length - 1 && (
            <span className="path-connector" aria-hidden="true">
              <i />
              <b>→</b>
            </span>
          )}
        </li>
      ))}
    </ol>
  );
}
