import React from "react";
import { Button } from "./button";

type StopProps = {
  stop: () => void;
  disabled?: boolean;
  "aria-label"?: string;
};

export default function Stop({
  stop,
  disabled = false,
  "aria-label": ariaLabel,
}: StopProps) {
  return (
    <Button
      type="button"
      onClick={() => {
        if (!disabled) stop();
      }}
      disabled={disabled}
      aria-label={ariaLabel ?? "Stop"}
      className="h-10 w-10 rounded-xl bg-white/90 text-zinc-900 shadow-md ring-1 ring-black/5 hover:bg-white hover:shadow-lg flex items-center justify-center border-none transition-all duration-200 select-none focus:outline-none disabled:cursor-not-allowed disabled:opacity-50 hover:scale-[1.03] active:scale-95"
    >
      <svg
        width="16"
        height="16"
        viewBox="0 0 24 24"
        fill="currentColor"
        aria-hidden="true"
        focusable="false"
        xmlns="http://www.w3.org/2000/svg"
      >
        <rect x="3" y="3" width="18" height="18" rx="3" />
      </svg>
    </Button>
  );
}