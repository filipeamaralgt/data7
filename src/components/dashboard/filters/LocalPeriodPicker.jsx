import React from "react";
import { useLocalPeriod } from "@/components/dashboard/filters/IndependentPeriod";

export function LocalPeriodPicker({
  storageKey,
  initial,
  PeriodPicker, // O componente de picker de data (ex: DateRangePicker)
  onChange,
  className,
}) {
  const [value, setValue] = useLocalPeriod(storageKey, initial);
  const handle = (next) => {
    setValue(next);
    onChange?.(next);
  };

  return (
    <div className={["shrink-0", className].filter(Boolean).join(" ")}>
      <PeriodPicker value={value} onChange={handle} />
    </div>
  );
}