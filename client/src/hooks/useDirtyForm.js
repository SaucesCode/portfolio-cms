import { useState, useCallback } from "react";

// Tracks a form's dirty state against a "last saved" snapshot, independent
// of any single page's shape. Works for any object-shaped form state.
export function useDirtyForm(initialValue) {
  const [value, setValue] = useState(initialValue);
  const [savedValue, setSavedValue] = useState(initialValue);

  const isDirty = JSON.stringify(value) !== JSON.stringify(savedValue);

  const markSaved = useCallback(() => setSavedValue(value), [value]);
  const reset = useCallback(next => {
    setValue(next);
    setSavedValue(next);
  }, []);

  return { value, setValue, isDirty, markSaved, reset };
}
