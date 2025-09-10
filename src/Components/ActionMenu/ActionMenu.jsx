import React, { useEffect, useRef, useState } from "react";

const DotsIcon = () => (
  <svg viewBox="0 0 20 20" fill="currentColor" className="h-5 w-5">
    <circle cx="10" cy="4" r="1.6" />
    <circle cx="10" cy="10" r="1.6" />
    <circle cx="10" cy="16" r="1.6" />
  </svg>
);

// small hook for click-outside
function useClickOutside(ref, handler) {
  useEffect(() => {
    const onDoc = (e) => {
      if (!ref.current || ref.current.contains(e.target)) return;
      handler?.();
    };
    document.addEventListener("mousedown", onDoc);
    document.addEventListener("touchstart", onDoc);
    return () => {
      document.removeEventListener("mousedown", onDoc);
      document.removeEventListener("touchstart", onDoc);
    };
  }, [ref, handler]);
}

const ActionMenu = ({
  items = [],
  open: openProp,
  onOpenChange,
  trigger = <DotsIcon />,
  triggerClassName = "inline-flex items-center justify-center rounded-full border border-violet-200 p-1 text-violet-600 hover:bg-violet-50",
  outerClassName = "relative inline-block",
  menuClassName = "absolute right-0 border z-20 mt-2 w-44 overflow-hidden rounded-md border border-gray-200 bg-white shadow-lg",
}) => {
  const [innerOpen, setInnerOpen] = useState(false);
  const open = openProp ?? innerOpen;
  const setOpen = onOpenChange ?? setInnerOpen;

  const ref = useRef(null);
  useClickOutside(ref, () => setOpen(false));

  return (
    <div className={outerClassName} ref={ref}>
        <div className="p-2 bg-[#E8DEF1] rounded-xl">
            <button
                type="button"
                onClick={() => setOpen(!open)}
                className={triggerClassName}
                aria-haspopup="menu"
                aria-expanded={open}
            >
                {trigger}
            </button>
        </div>

      {open && (
        <div role="menu" className={menuClassName}>
          {items
            .filter((i) => i?.show !== false)
            .map((item, idx) => (
              <button
                key={idx}
                onClick={() => {
                  item.onClick?.();
                  setOpen(false);
                }}
                onMouseDown={(e) => {
                  e.preventDefault(); // focus lose na ho
                  item.onClick?.();
                  setOpen(false);
                }}
                disabled={item.disabled}
                className={`block w-full px-3 py-2 text-left text-sm hover:bg-gray-50 ${
                  item.danger ? "text-red-600 hover:bg-red-50" : ""
                } ${item.disabled ? "opacity-50 cursor-not-allowed" : "cursor-pointer"}`}
              >
                {item.label}
              </button>
            ))}
        </div>
      )}
    </div>
  );
};

export default ActionMenu;