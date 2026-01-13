import { useSelector, useDispatch } from "react-redux";
import clsx from "clsx";
import { setSelectedTopic } from "../redux/feature/predictionTopicSlice";
import LiveCryptoPrice from "./ui/LiveCryptoPrice";

export default function LeftSideBar() {
  const dispatch = useDispatch();
  const topics = useSelector((s) => s.topic.list || []);
  const activeSlug = useSelector((s) => s.topic.selected?.slug);

  // 🔁 Render each coin topic with logo + live price
  const renderBtns = (list) =>
    list.map((item) => (
      <button
        key={item.slug}
        onClick={() => dispatch(setSelectedTopic(item))}
        className={clsx(
          "flex items-center justify-between text-left px-3 py-2 rounded-2xl border transition gap-2",
          "shadow-sm hover:-translate-y-0.5 hover:shadow-md dark:hover:shadow-[0_0_6px_rgba(255,255,255,0.05)]",
          activeSlug === item.slug
            ? "border-blue-500 bg-blue-100 dark:bg-blue-700/60 dark:border-blue-400 dark:text-white"
            : "border-gray-200 bg-gray-50 hover:bg-blue-50 dark:bg-zinc-800 dark:border-zinc-700 dark:hover:bg-zinc-700/80 dark:text-zinc-100"
        )}
      >
        {/* ─── Logo & Name ─────────────────────────── */}
        <div className="flex items-center gap-2">
          {item.logo ? (
            <img
              src={item.logo}
              alt={item.heading}
              className="w-5 h-5 rounded-full object-cover"
              onError={(e) => (e.target.style.display = "none")} // 🛡️ Prevent broken image icons
            />
          ) : null}

          <div className="text-xs md:text-sm leading-snug text-gray-800 dark:text-white">
            <span className="font-bold text-gray-700 dark:text-zinc-100">{item.heading}</span>
            <span className="text-gray-500 dark:text-gray-400 ml-1">
              ({item.symbol})
            </span>
          </div>
        </div>

        {/* ─── Live Price ───────────────────────────── */}
        <div className="text-right text-xs font-mono text-gray-700 dark:text-gray-300">
          <LiveCryptoPrice coinName={item.symbol} c={true} />
        </div>
      </button>
    ));

  return (
    <aside className="h-full overflow-hidden pr-1 flex flex-col gap-4">
      {/* ─── Crypto Section ─────────────────────────── */}
      <section className="flex flex-col flex-1 min-h-0">
        <h2 className="sticky top-0 bg-white dark:bg-zinc-900/95 backdrop-blur z-10 mb-2 text-sm font-semibold text-gray-700 dark:text-gray-200 px-1 py-2 border-b dark:border-zinc-700">
          Crypto Market
        </h2>

        {/* ─── Topic List ───────────────────────────── */}
        <div className="flex-1 overflow-y-auto flex flex-col gap-2 pr-1">
          {topics?.length ? (
            renderBtns(topics)
          ) : (
            <p className="text-center text-sm text-gray-500 dark:text-gray-400">
              No topics available
            </p>
          )}
        </div>
      </section>
    </aside>
  );
}
