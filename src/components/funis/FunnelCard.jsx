import { useAppContext } from "@/components/context/AppContext";

export default function FunnelCard({ children }) {
  const { theme } = useAppContext();
  return (
    <div
      className={`
        rounded-2xl border border-slate-200/70 bg-white
        dark:bg-slate-900 dark:border-slate-800 shadow-sm
        px-5 md:px-6 lg:px-8
        pt-5 md:pt-6 lg:pt-7
        pb-5 md:pb-6
      `}
    >
      {children}
    </div>
  );
}