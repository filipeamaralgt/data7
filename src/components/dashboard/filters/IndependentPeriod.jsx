import React, { useState, useCallback, useMemo } from "react";

/* ---------- 1) Estado de período totalmente LOCAL por chave ---------- */

function load(key, fallback) {
  if (typeof window === "undefined") return fallback;
  try {
    const raw = localStorage.getItem(key);
    if (!raw) return fallback;
    const v = JSON.parse(raw);
    return { start: new Date(v.start), end: new Date(v.end), preset: v.preset ?? fallback.preset };
  } catch {
    return fallback;
  }
}

function save(key, value) {
    if (typeof window === "undefined") return;
  try {
    localStorage.setItem(
      key,
      JSON.stringify({
        ...value,
        start: value.start.toISOString(),
        end: value.end.toISOString(),
      })
    );
  } catch {}
}

export function useLocalPeriod(key, initial) {
  const [range, setRange] = useState(() => load(key, initial));
  const set = useCallback(
    (next) => {
      setRange(next);
      save(key, next);
    },
    [key]
  );
  return [range, set];
}

/* ---------- 2) Wrapper que NÃO muda o layout do seu PeriodPicker ---------- */

export function LocalPeriodPicker({
  storageKey,
  initial,
  PeriodPicker,
  onChange,
  className,
}) {
  const [value, setValue] = useLocalPeriod(storageKey, initial);
  const handle = (next) => {
    setValue(next);       // atualiza só ESTE
    onChange?.(next);     // refetch só DESTE
  };

  // Alinhar à direita: empurra o bloco para a direita da toolbar (sem tocar no picker)
  return (
    <div className={["ml-auto shrink-0", className].filter(Boolean).join(" ")}>
      <PeriodPicker value={value} onChange={handle} />
    </div>
  );
}