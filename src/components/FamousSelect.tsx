import { useId } from "react";
import type { FamousDev } from "../data/famous-devs";

type Props = {
  famousDevs: FamousDev[];
  value: string;
  onChange: (value: string) => void;
  disabled?: boolean;
};

function groupByCategory(famousDevs: FamousDev[]): Map<string, FamousDev[]> {
  return famousDevs.reduce((groups, dev) => {
    const current = groups.get(dev.category) ?? [];
    current.push(dev);
    groups.set(dev.category, current);
    return groups;
  }, new Map<string, FamousDev[]>());
}

export function FamousSelect({ famousDevs, value, onChange, disabled }: Props) {
  const selectId = useId();
  const groups = groupByCategory(famousDevs);

  return (
    <label className="field field--target" htmlFor={selectId}>
      <span className="field__label"><b>03</b> Target developer</span>
      <div className="input-shell input-shell--select">
        <select
          id={selectId}
          value={value}
          disabled={disabled}
          onChange={(event) => onChange(event.target.value)}
        >
          {Array.from(groups.entries()).map(([category, devs]) => (
            <optgroup key={category} label={category}>
              {devs.map((dev) => (
                <option key={dev.login} value={dev.login}>
                  {dev.name} — @{dev.login}
                </option>
              ))}
            </optgroup>
          ))}
        </select>
      </div>
    </label>
  );
}
