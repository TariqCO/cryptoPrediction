import { useSelector } from "react-redux";
import { useState } from "react";
import LeftSideBar from "../components/LeftSideBar";
import MainCenter from "../components/MainCenter";
import RightSideBar from "../components/RightSideBar";

export default function Home() {
  const topic = useSelector((state) => state.topic.selected); // 🔍 Get selected topic from Redux
  const [refreshKey, setKey] = useState(0); // 🔁 Trigger re-fetch when prediction submitted

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-zinc-950 text-gray-900 dark:text-zinc-100 transition-colors">
      {/* ────────────── 3-Column Layout ────────────── */}
      <div className="max-w-7xl mx-auto px-4 py-6 flex flex-col lg:flex-row gap-6">
        
        {/* 🧭 Left Sidebar */}
        <aside
          className="order-3 lg:order-2 lg:w-80 xl:w-[22rem] shrink-0
                     bg-white dark:bg-zinc-900/80 border border-gray-200 dark:border-zinc-800
                     rounded-2xl p-2 shadow-md dark:shadow-none max-h-[500px] overflow-hidden"
        >
          <LeftSideBar />
        </aside>

        {/* 📝 Main Content */}
        <main
          className="order-1 lg:order-2 flex-1
                     bg-white dark:bg-zinc-900/80 border border-gray-200 dark:border-zinc-800
                     rounded-2xl p-2 shadow-md dark:shadow-none max-h-[500px] overflow-y-auto
                     w-full max-w-md mx-auto"
        >
          {topic ? (
            <MainCenter topic={topic} onSubmitSuccess={() => setKey((k) => k + 1)} />
          ) : (
            <div className="text-center text-sm text-gray-500 dark:text-zinc-500 mt-10">
              Select a topic to start predicting.
            </div>
          )}
        </main>

        {/* 📊 Right Sidebar */}
        <aside
          className="order-3 lg:order-3 lg:w-80 xl:w-[25rem] shrink-0
                     bg-white dark:bg-zinc-900/80 border border-gray-200 dark:border-zinc-800
                     rounded-2xl p-2 shadow-md dark:shadow-none max-h-[500px] overflow-hidden"
        >
          {topic && <RightSideBar slug={topic.slug} refresh={refreshKey} />}
        </aside>
      </div>
    </div>
  );
}
