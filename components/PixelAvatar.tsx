import Image from "next/image";
import type { BehaviorState, Companion } from "@/lib/mock-data";

function joinClassNames(...values: Array<string | undefined>) {
  return values.filter(Boolean).join(" ");
}

type PixelAvatarProps = {
  companion: Companion;
  behaviorState: BehaviorState;
};

export function PixelAvatar({ companion, behaviorState }: PixelAvatarProps) {
  return (
    <div
      className={joinClassNames(
        "avatar-stage",
        `avatar-stage--${behaviorState.statusTone}`,
      )}
    >
      <div className="avatar-stage__chips">
        <span className="avatar-stage__chip">{companion.roleLabelZh}</span>
        <span className="avatar-stage__chip avatar-stage__chip--light">
          {behaviorState.label}
        </span>
      </div>

      <div className="avatar-stage__sprite-wrap">
        <span
          className={joinClassNames(
            "avatar-stage__shadow",
            `avatar-stage__shadow--${behaviorState.animation}`,
          )}
        />
        <Image
          alt={companion.displayNameZh}
          className={joinClassNames(
            "avatar-stage__sprite",
            `avatar-stage__sprite--${behaviorState.animation}`,
          )}
          height={176}
          priority
          src={companion.sprite}
          style={{ width: `${companion.spriteWidth}px` }}
          unoptimized
          width={144}
        />
      </div>
    </div>
  );
}
