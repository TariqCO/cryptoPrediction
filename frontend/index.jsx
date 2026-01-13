// src/components/RightSideBar.jsx
import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { ResponsiveContainer, PieChart, Pie, Cell, Tooltip } from "recharts";
import { fetchPredictionsBySlug } from "../api/predictions";
import "../styles/scrollbar.css"

export default function RightSideBar({
  slug,
  title = "AI Summary of Predictions",
  refresh = 0,
}) {
  const [stats, setStats]   = useState(null);
  const [aiSummary, setAi]  = useState("");
  const [loading, setLoad]  = useState(true);
  const [error, setError]   = useState("");

  useEffect(() => {
    if (!slug) return;

    setLoad(true);
    setStats(null);
    setAi("");
    setError("");

    fetchPredictionsBySlug(slug)
      .then((res) => {
        if (!res.predictionResult) throw new Error("predictionResult missing");
        const { upPercent = 0, downPercent = 0, total = 0, aiVerdict = "" } =
          res.predictionResult;
        setStats({ upPercent, downPercent, total });
        setAi(aiVerdict);
      })
      .catch((err) => {
        console.error("RightSideBar fetch error:", err);
        setError("Failed to load stats");
      })
      .finally(() => setLoad(false));
  }, [slug, refresh]);

  const pieData = stats
    ? [
        { name: "Positive", value: stats.upPercent },
        { name: "Negative", value: stats.downPercent },
      ]
    : [];

  const COLORS = ["#4ade80", "#f87171"]; // green / red

  return (
    <motion.aside
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="bg-white rounded-2xl shadow-lg p-6 border border-gray-200
                 min-h-[440px] flex flex-col gap-6 overflow-y-auto custom-scroll"
    >
      {/* ── Header ── */}
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-bold text-gray-800 flex items-center gap-2">
          📊 <span className="line-clamp-1">{title}</span>
        </h2>
        <span className="text-xs text-gray-500">
          {loading ? "Loading…" : "Just updated"}
        </span>
      </div>

      {error && <p className="text-sm text-red-500 text-center">{error}</p>}

      {/* ── Chart + stats ── */}
      {stats && (
        <>
          <div className="w-full h-40">
            <ResponsiveContainer>
              <PieChart>
                <Pie
                  data={pieData}
                  dataKey="value"
                  cx="50%"
                  cy="50%"
                  innerRadius={32}
                  outerRadius={60}
                  paddingAngle={2}
                  strokeWidth={0}
                >
                  {pieData.map((_, i) => (
                    <Cell key={i} fill={COLORS[i]} />
                  ))}
                </Pie>
                <Tooltip formatter={(v) => `${v}%`} />
              </PieChart>
            </ResponsiveContainer>
          </div>

          <div className="grid grid-cols-3 gap-4 text-center">
            <StatCard color="green" label="Positive" value={`${stats.upPercent}%`} />
            <StatCard color="red"   label="Negative" value={`${stats.downPercent}%`} />
            <StatCard color="blue"  label="Total"    value={stats.total} />
          </div>
        </>
      )}

      {/* ── AI summary ── */}
      <section className="flex flex-col gap-2 flex-1">
        <h3 className="text-base font-semibold text-gray-700 flex items-center gap-1">
          🗣️ People Thoughts
        </h3>

        <div
          className="flex-1 bg-gray-50 border border-gray-200 rounded-xl px-4 py-3
                     text-sm text-gray-800 whitespace-pre-line break-words
                     min-h-[72px] max-h-56 overflow-y-auto custom-scroll"
        >
          {aiSummary || (loading ? "Thinking…" : "AI summary will appear here once generated.")}
        </div>
      </section>

      {!loading && !stats && !error && (
        <p className="text-center text-gray-500 text-sm">No predictions yet</p>
      )}
    </motion.aside>
  );
}

function StatCard({ color, label, value }) {
  return (
    <div className={`flex flex-col items-center bg-${color}-50 border border-${color}-200 rounded-xl py-3`}>
      <span className={`text-xl font-bold text-${color}-600`}>{value}</span>
      <span className="text-xs text-gray-700 mt-1">{label}</span>
    </div>
  );
}
