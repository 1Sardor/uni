import React, { createContext, useContext, useState, useRef, useEffect, useCallback } from "react";
import { ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";

const SelectContext = createContext();

export function Select({ value, onValueChange, disabled, children }) {
  const [open, setOpen] = useState(false);
  const [options, setOptions] = useState({});
  const registerOption = useCallback((val, label) => {
    setOptions((prev) => (prev[val] === label ? prev : { ...prev, [val]: label }));
  }, []);
  return (
    <SelectContext.Provider value={{ value, onValueChange, open, setOpen, disabled, options, registerOption }}>
      <div className="relative">{children}</div>
    </SelectContext.Provider>
  );
}

export function SelectTrigger({ className, children, id }) {
  const { open, setOpen, disabled } = useContext(SelectContext);
  return (
    <button
      id={id}
      type="button"
      disabled={disabled}
      onClick={() => setOpen(!open)}
      className={cn(
        "flex w-full items-center justify-between rounded-xl border border-input bg-white px-3 py-2 text-sm disabled:opacity-50",
        className
      )}
    >
      {children}
      <ChevronDown size={16} className="text-muted-foreground" />
    </button>
  );
}

export function SelectValue({ placeholder }) {
  const { value, options } = useContext(SelectContext);
  const label = value != null ? options[value] : null;
  return <span className={!value ? "text-muted-foreground" : ""}>{label ?? value ?? placeholder}</span>;
}

export function SelectContent({ children }) {
  const { open, setOpen } = useContext(SelectContext);
  const ref = useRef(null);

  useEffect(() => {
    function handleClick(e) {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false);
    }
    if (open) document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, [open, setOpen]);

  return (
    <div
      ref={ref}
      className={cn(
        "absolute z-50 mt-1 w-full rounded-xl border border-border bg-white shadow-lg max-h-60 overflow-auto",
        open ? "block" : "hidden"
      )}
    >
      {children}
    </div>
  );
}

export function SelectItem({ value, children, disabled }) {
  const { onValueChange, setOpen, registerOption } = useContext(SelectContext);

  useEffect(() => {
    registerOption(value, children);
  }, [value, children, registerOption]);

  return (
    <div
      onClick={() => {
        if (disabled) return;
        onValueChange(value);
        setOpen(false);
      }}
      aria-disabled={disabled}
      className={cn(
        "px-3 py-2 text-sm",
        disabled ? "text-muted-foreground/50 cursor-not-allowed" : "hover:bg-pastel-canvas cursor-pointer"
      )}
    >
      {children}
    </div>
  );
}
