import type { Companion } from "@/lib/mock-data";

type CompanionSwitcherProps = {
  companions: Companion[];
  activeId: string;
  onSelect: (id: string) => void;
};

export function CompanionSwitcher({
  companions,
  activeId,
  onSelect,
}: CompanionSwitcherProps) {
  return (
    <div className="companion-tabs">
      {companions.map((companion) => {
        const active = companion.id === activeId;

        return (
          <button
            key={companion.id}
            className={`companion-tabs__item ${
              active ? "companion-tabs__item--active" : ""
            }`}
            onClick={() => onSelect(companion.id)}
            type="button"
          >
            {companion.displayNameZh}
          </button>
        );
      })}
    </div>
  );
}
