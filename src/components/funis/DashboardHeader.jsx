import React, { useState } from "react";
import FilterBar from "./FilterBar";
import { startOfMonth, endOfMonth } from "date-fns";

export default function DashboardHeader() {
  const [funnel, setFunnel] = useState("Funil Geral");
  const [closer, setCloser] = useState("Todos os Closers");
  const [range, setRange]   = useState([startOfMonth(new Date()), endOfMonth(new Date())]);

  return (
    <FilterBar
      funnel={funnel} setFunnel={setFunnel}
      closer={closer} setCloser={setCloser}
      range={range} setRange={setRange}
    />
  );
}