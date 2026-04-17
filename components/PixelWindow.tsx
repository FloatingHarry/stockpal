import type { ReactNode } from "react";

type PixelWindowProps = {
  title: string;
  label?: string;
  className?: string;
  bodyClassName?: string;
  children: ReactNode;
};

function joinClassNames(...values: Array<string | undefined>) {
  return values.filter(Boolean).join(" ");
}

export function PixelWindow({
  title,
  label,
  className,
  bodyClassName,
  children,
}: PixelWindowProps) {
  return (
    <section className={joinClassNames("pixel-window", className)}>
      <div className="pixel-window__chrome">
        <span className="pixel-window__title">{title}</span>
        {label ? <span className="pixel-window__label">{label}</span> : null}
      </div>
      <div className={joinClassNames("pixel-window__body", bodyClassName)}>
        {children}
      </div>
    </section>
  );
}
