"use client";

import { useState, useEffect, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  ChevronDown,
  ChevronUp,
  TrendingUp,
  TrendingDown,
  Users,
  Brain,
  BarChart3,
  BarChart2,
} from "lucide-react";
import {
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line,
} from "recharts";
import { fetchPredictionsBySlug } from "../api/crypto";
import { Card, CardContent } from "@/components/ui/card";
import "../styles/scrollbar.css";
import { useSelector } from "react-redux";

const COLORS = ["#22c55e", "#ef4444"];

const defaultSummary = {
  verdict: "",
  summary: "",
  mostCommonDirection: "",
  notableReasons: [],
};

export default function RightSideBar({
  slug,
  title = "Insights",
  refresh = 0,
}) {
  const [stats, setStats] = useState(null);
  const [aiSummary, setAiSummary] = useState(defaultSummary);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [open, setOpen] = useState(false);
  const [timeframe, setTimeframe] = useState("24");
  const tf = useSelector((s) => s.timeframe.tf);


  useEffect(() => {
    if (!slug) return;

    setLoading(true);
    setError("");
    setStats(null);
    setAiSummary(defaultSummary);

    fetchPredictionsBySlug(slug, timeframe)
      .then((res) => {
        const d = res?.data ?? res;
        const {
          upPercent = 0,
          downPercent = 0,
          total = 0,
          aiVerdict = defaultSummary,
          trend = [],
        } = d;

        setStats({ upPercent, downPercent, total, trend });
        setAiSummary(
          typeof aiVerdict === "object" && aiVerdict !== null
            ? aiVerdict
            : defaultSummary
        );
      })
      .catch(() => setError("⚠️ Failed to load statistics. Please try again."))
      .finally(() => setLoading(false));
  }, [slug, refresh, timeframe]);


  useEffect(() => {
  if (tf) {
    setTimeframe(tf);
  }
}, [tf]);


  const pieData = useMemo(
    () =>
      stats
        ? [
            { name: "Up", value: stats.upPercent },
            { name: "Down", value: stats.downPercent },
          ]
        : [],
    [stats]
  );

  const TrendSpark = ({ data }) => (
    <ResponsiveContainer width="100%" height={40}>
      <LineChart data={data} margin={{ left: 0, right: 0, top: 4, bottom: 4 }}>
        <Line
          type="monotone"
          dataKey="upPercent"
          stroke="#22c55e"
          strokeWidth={2}
          dot={false}
        />
      </LineChart>
    </ResponsiveContainer>
  );

  const Pill = ({ color, Icon, value, label }) => (
    <div className="flex flex-col items-center gap-1 text-xs select-none">
      <Icon className={`h-5 w-5 text-${color}-500`} />
      <span className="font-bold text-gray-900 dark:text-white">{value}</span>
      <span className="text-[11px] text-gray-500 dark:text-gray-400">
        {label}
      </span>
    </div>
  );

  return (
    <motion.aside
      initial={{ opacity: 0, y: 24 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35 }}
      className="w-full max-w-[430px]"
    >
      <Card className="border-none bg-white/80 dark:bg-zinc-900/80 backdrop-blur-xl shadow-xl rounded-2xl overflow-hidden flex flex-col h-full">
        <button
          onClick={() => setOpen((o) => !o)}
          className="flex items-center justify-between w-full px-4 py-3 bg-gradient-to-r from-emerald-50 via-slate-50 to-red-50 dark:from-zinc-800 dark:via-zinc-900 dark:to-zinc-800 hover:brightness-95 dark:hover:brightness-110"
        >
          {stats ? (
            <div className="flex flex-1 justify-around">
              <Pill
                color="emerald"
                Icon={TrendingUp}
                value={`${stats.upPercent}%`}
                label="Up"
              />
              <Pill
                color="red"
                Icon={TrendingDown}
                value={`${stats.downPercent}%`}
                label="Down"
              />
              <Pill
                color="sky"
                Icon={Users}
                value={stats.total}
                label="Total"
              />
            </div>
          ) : (
            <span className="text-gray-500 dark:text-gray-300 text-sm">
              Loading…
            </span>
          )}
          {open ? (
            <ChevronUp className="h-5 w-5 text-gray-600 dark:text-gray-300" />
          ) : (
            <ChevronDown className="h-5 w-5 text-gray-600 dark:text-gray-300" />
          )}
        </button>

        <AnimatePresence initial={false}>
          {open && stats && (
            <motion.div
              key="drawer"
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 120, opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.25 }}
              className="overflow-hidden border-b border-gray-200 dark:border-gray-700 bg-white/60 dark:bg-zinc-800/70 backdrop-blur"
            >
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={pieData}
                    dataKey="value"
                    cx="50%"
                    cy="50%"
                    innerRadius={30}
                    outerRadius={45}
                    stroke="none"
                    paddingAngle={2}
                  >
                    {pieData.map((_, i) => (
                      <Cell key={`cell-${i}`} fill={COLORS[i]} />
                    ))}
                  </Pie>
                </PieChart>
              </ResponsiveContainer>
            </motion.div>
          )}
        </AnimatePresence>

        <CardContent className="flex-1 overflow-y-auto custom-scroll p-4 space-y-4">
          <div className="flex items-center justify-between gap-4 flex-wrap">
<h2 className="flex items-center gap-2 text-lg font-semibold text-gray-900 dark:text-white">
  <BarChart2 className="w-5 h-5 text-orange-500" />
  {title}
</h2>

            <div className="flex gap-2">
              {[
                { label: "24h", value: "24" },
                { label: "7d", value: "7" },
                { label: "1M", value: "1" },
              ].map(({ label, value }) => (
                <button
                  key={value}
                  onClick={() => setTimeframe(value)}
                  className={`px-3 py-1 text-xs rounded-full border transition font-medium shadow-sm ${
                    value === timeframe
                      ? "bg-blue-600 text-white border-blue-600"
                      : "bg-white text-gray-700 border-gray-300 hover:bg-gray-100 dark:bg-zinc-800 dark:text-gray-300 dark:border-zinc-600 dark:hover:bg-zinc-700"
                  }`}
                >
                  {label}
                </button>
              ))}
            </div>
          </div>

          {stats?.trend?.length > 0 && (
            <div className="rounded-lg bg-slate-50 dark:bg-zinc-800 p-2 border border-slate-200 dark:border-zinc-700">
              <TrendSpark data={stats.trend} />
            </div>
          )}

          {error && <p className="text-sm text-red-500 font-medium">{error}</p>}

          <section className="bg-white dark:bg-zinc-900 border border-gray-200 dark:border-zinc-700 rounded-xl p-4 shadow-sm space-y-4 max-h-60 overflow-y-auto custom-scroll">
<h3 className="text-sm font-semibold text-gray-800 dark:text-white flex items-center gap-2">
  <Brain className="w-4 h-4 text-indigo-500" />
  AI Summary
</h3>


            {loading ? (
              <p className="text-sm text-gray-600 dark:text-gray-400 italic">
                Thinking…
              </p>
            ) : aiSummary?.summary ? (
              <>
                <div className="flex flex-wrap items-center gap-3 text-sm">
                  <span className="bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300 px-3 py-1 rounded-full font-medium">
                    Verdict: {aiSummary.verdict}
                  </span>
                  <span className="bg-gray-100 dark:bg-zinc-800 text-gray-800 dark:text-gray-300 px-3 py-1 rounded-full font-medium">
                    Most Chosen: {aiSummary.mostCommonDirection}
                  </span>
                </div>

                <p className="text-sm leading-relaxed text-gray-700 dark:text-gray-300 border-l-4 border-blue-500 pl-4 italic">
                  {aiSummary.summary}
                </p>

                {aiSummary.notableReasons?.length > 0 && (
                  <div className="flex flex-wrap gap-2">
                    {aiSummary.notableReasons.map((reason, i) => (
                      <span
                        key={i}
                        className="text-xs bg-indigo-100 dark:bg-indigo-800 text-indigo-700 dark:text-indigo-200 px-2.5 py-1 rounded-full"
                      >
                        {reason}
                      </span>
                    ))}
                  </div>
                )}
              </>
            ) : (
              <p className="text-sm text-gray-600 dark:text-gray-400">
                No summary available yet.
              </p>
            )}
          </section>
        </CardContent>
      </Card>
    </motion.aside>
  );
}
