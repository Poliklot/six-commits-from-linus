import type { PathNode } from "../lib/types";

type Props = {
  path: PathNode[];
};

function hrefForNode(node: PathNode): string {
  if (node.type === "user") return `https://github.com/${node.login}`;
  return `https://github.com/${node.fullName}`;
}

function labelForNode(node: PathNode): string {
  if (node.type === "user") return node.label ? `${node.label} (@${node.login})` : `@${node.login}`;
  return node.fullName;
}

export function PathGraph({ path }: Props) {
  return (
    <ol className="path-graph" aria-label="Handshake path">
      {path.map((node, index) => (
        <li className="path-graph__item" key={`${node.type}-${index}-${labelForNode(node)}`}>
          <a
            className={`path-pill path-pill--${node.type}`}
            href={hrefForNode(node)}
            target="_blank"
            rel="noreferrer"
          >
            <span className="path-pill__type">{node.type}</span>
            <span>{labelForNode(node)}</span>
          </a>
          {index < path.length - 1 && <span className="path-arrow">→</span>}
        </li>
      ))}
    </ol>
  );
}
