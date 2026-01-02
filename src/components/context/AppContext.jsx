
import React, { createContext, useContext, useState, useEffect, useCallback, useMemo } from 'react';
import { addDays, endOfMonth, endOfQuarter, endOfYear, startOfMonth, startOfQuarter, startOfToday, startOfYear, subDays } from "date-fns";

// --- Date Helper Functions ---

const MIN_DATE = new Date(2023, 0, 1);

const getPresets = (today = startOfToday()) => {
  const startThisMonth = startOfMonth(today);
  const endThisMonth = endOfMonth(today);

  const startLastMonth = startOfMonth(subDays(startThisMonth, 1));
  const endLastMonth   = endOfMonth(startLastMonth);

  const startThisQuarter = startOfQuarter(today);
  
  const startThisYear = startOfYear(today);
  const endThisYear   = endOfYear(today);

  const startLastYear = startOfYear(subDays(startThisYear, 1));
  const endLastYear   = endOfYear(startLastYear);

  return [
    { key: "Hoje",            get: () => ({ start: today, end: today }) },
    { key: "Ontem",           get: () => { const d=subDays(today,1); return { start: d, end: d }; } },
    { key: "Últimos 7 dias",  get: () => ({ start: subDays(today,6), end: today }) },
    { key: "Últimos 30 dias", get: () => ({ start: subDays(today,29), end: today }) },
    { key: "Este mês",        get: () => ({ start: startThisMonth, end: endThisMonth }) },
    { key: "Mês passado",     get: () => ({ start: startLastMonth, end: endLastMonth }) },
    { key: "Último trimestre",get: () => {
        const startQ = startOfQuarter(today);
        const prevQEnd = subDays(startQ,1);
        return { start: startOfQuarter(prevQEnd), end: endOfQuarter(prevQEnd) };
      }},
    { key: "Este ano",        get: () => ({ start: startOfYear(today), end: endOfYear(today) }) },
    { key: "Ano passado",     get: () => {
        const prevEnd = subDays(startOfYear(today),1);
        return { start: startOfYear(prevEnd), end: endOfYear(prevEnd) };
      }},
    { key: "Período máximo",  get: () => ({ start: MIN_DATE, end: today }) },
  ];
};


// --- Helper Functions ---

function getQS() {
  if (typeof window === "undefined") {
    return new URLSearchParams();
  }
  return new URLSearchParams(window.location.search);
}

function setQS(params) {
  if (typeof window === "undefined") return;

  const url = new URL(window.location.href);
  Object.entries(params).forEach(([k, v]) => {
    if (v === undefined || v === "" || v === null) {
      url.searchParams.delete(k);
    } else {
      url.searchParams.set(k, v);
    }
  });
  history.replaceState(null, "", url.toString());
}

// --- Context Definition ---

const AppContext = createContext(null);

const getInitialState = () => {
  const hoje = new Date();
  const defaultStart = startOfMonth(hoje);
  const defaultEnd = endOfMonth(hoje);

  return {
    dateRange: {
      start: defaultStart.toISOString(),
      end: defaultEnd.toISOString(),
      preset: "Este mês",
    },
    funnel: "Funil Geral",
    closer: "Todos os Closers",
    origin: "Todas as Origens",
    timezone: "America/Sao_Paulo",
    theme: "light",
  };
};

// --- Provider Component ---

export function AppProvider({ children }) {
  const [state, setState] = useState(() => {
    const initialState = getInitialState();
    if (typeof window === "undefined") {
      return initialState;
    }
    try {
      const persistedState = localStorage.getItem('app-state');
      // Merge persisted state with initial state to avoid missing keys on update
      return persistedState ? { ...initialState, ...JSON.parse(persistedState) } : initialState;
    } catch (e) {
      console.error("Failed to parse state from localStorage", e);
      return initialState;
    }
  });

  useEffect(() => {
    try {
      // Persist only a subset of the state
      const stateToPersist = {
        dateRange: state.dateRange,
        funnel: state.funnel,
        closer: state.closer,
        origin: state.origin,
        theme: state.theme,
      };
      localStorage.setItem('app-state', JSON.stringify(stateToPersist));
    } catch (e) {
      console.error("Failed to save state to localStorage", e);
    }
  }, [state.dateRange, state.funnel, state.closer, state.origin, state.theme]);

  const setDateRange = useCallback((r, pushToUrl = false) => {
    setState(s => ({ ...s, dateRange: r }));
    if (pushToUrl) {
      setQS({
        start: r.start,
        end: r.end,
        preset: r.preset === "Personalizado" ? undefined : r.preset,
      });
    }
  }, []);

  const setFunnel = useCallback((f, pushToUrl = false) => {
    setState(s => ({ ...s, funnel: f }));
    if (pushToUrl) setQS({ funnel: f });
  }, []);

  const setCloser = useCallback((c, pushToUrl = false) => {
    setState(s => ({ ...s, closer: c }));
    if (pushToUrl) setQS({ closer: c });
  }, []);

  const setOrigin = useCallback((o, pushToUrl = false) => {
    setState(s => ({ ...s, origin: o }));
    if (pushToUrl) setQS({ origin: o });
  }, []);

  const setTheme = useCallback((t) => {
    setState(s => ({ ...s, theme: t }));
  }, []);

  const syncFromUrl = useCallback(() => {
    if (typeof window === "undefined") return;
    const qs = getQS();
    const start = qs.get("start");
    const end = qs.get("end");
    const preset = qs.get("preset") || undefined;
    const funnel = qs.get("funnel") || undefined;
    const closer = qs.get("closer") || undefined;
    const origin = qs.get("origin") || undefined;

    setState(s => {
      let newState = { ...s };
      if (start && end) {
        newState.dateRange = { start, end, preset: preset || "Personalizado" };
      }
      if (funnel) newState.funnel = funnel;
      if (closer) newState.closer = closer;
      if (origin) newState.origin = origin;
      return newState;
    });
  }, []);

  const datePresets = useMemo(() => getPresets(), []);

  const applyDatePreset = useCallback((key) => {
    const p = datePresets.find((x) => x.key === key);
    if (p) {
      const r = p.get();
      setDateRange(
        { start: r.start.toISOString(), end: r.end.toISOString(), preset: key },
        true
      );
    }
  }, [datePresets, setDateRange]);

  const applyManualDateRange = useCallback((d) => {
    setDateRange(
      { start: d.start.toISOString(), end: d.end.toISOString(), preset: "Personalizado" },
      true
    );
  }, [setDateRange]);


  const value = {
    ...state,
    setDateRange,
    setFunnel,
    setCloser,
    setOrigin,
    setTheme,
    syncFromUrl,
    datePresets,
    applyDatePreset,
    applyManualDateRange,
  };

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}

// --- Custom Hook ---

export const useAppContext = () => {
  const context = useContext(AppContext);
  if (context === null) {
    throw new Error('useAppContext must be used within an AppProvider');
  }
  return context;
};
