import React from "react";
import clsx from "clsx";

const colors = [
  "bg-[#C4B4FF]",
  "bg-[#A684FF]",
  "bg-[#8E51FF]",
  "bg-[#DAB2FF]",
  "bg-[#A684FF]",
  "bg-[#AD46FF]",
  "bg-[#F4A8FF]",
  "bg-[#C27AFF]",
  "bg-[#E12AFB]",
];

export default function AvatarInitial({ name = "", className = "" }) {
  // first letter nikalo
  const initial = name?.charAt(0)?.toUpperCase() || "?";

  // first letter ke ASCII code ko use karke color choose karna
  const colorIndex = initial.charCodeAt(0) % colors.length;
  const bgColor = colors[colorIndex];

  return (
    <div
      className={clsx(
        "flex items-center justify-center rounded-full text-white font-bold",
        bgColor,
        className
      )}
    >
      {initial}
    </div>
  );
}
