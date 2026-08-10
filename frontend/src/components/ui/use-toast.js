import { useState, useEffect } from "react";

let listeners = [];
let toasts = [];
let idCounter = 0;

function emit() {
  listeners.forEach((l) => l([...toasts]));
}

export function toast({ title, description, variant = "default", duration = 3500 }) {
  const id = ++idCounter;
  toasts.push({ id, title, description, variant });
  emit();
  setTimeout(() => {
    toasts = toasts.filter((t) => t.id !== id);
    emit();
  }, duration);
}

export function useToast() {
  const [items, setItems] = useState(toasts);
  useEffect(() => {
    listeners.push(setItems);
    return () => {
      listeners = listeners.filter((l) => l !== setItems);
    };
  }, []);
  return { toast, toasts: items };
}
