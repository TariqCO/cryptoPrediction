import { useEffect, useState } from "react";
import moment from "moment";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import LiveCryptoPrice from "../components/ui/LiveCryptoPrice";
import { deletePrediction, usersPrediction } from "../api/user";
import { toast } from "react-toastify";
import { TrendingUp, TrendingDown, CheckCircle, XCircle, Clock } from "lucide-react";

const MyPredictions = () => {
  const [userData, setUserData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [sortBy, setSortBy] = useState("latest");

  useEffect(() => {
    fetchPredictions();
  }, [sortBy]);

  const fetchPredictions = async () => {
    try {
      const res = await usersPrediction();
      let sorted = [...res];

      if (sortBy === "latest")
        sorted.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
      if (sortBy === "fulfilled")
        sorted.sort(
          (a, b) =>
            new Date(b.fulfilledAt || 0) - new Date(a.fulfilledAt || 0)
        );
      if (sortBy === "confidence")
        sorted.sort((a, b) => b.confidence - a.confidence);

      setUserData(sorted);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = (slug, timeframe) => {
    toast(
      ({ closeToast }) => (
        <div className="space-y-3">
          <p className="text-sm font-medium">Delete this prediction permanently?</p>
          <div className="flex justify-end gap-2">
            <Button
              size="sm"
              variant="destructive"
              onClick={async () => {
                try {
                  await deletePrediction(slug, timeframe);
                  setUserData((p) => p.filter((i) => i.slug !== slug));
                  toast.success("Prediction deleted");
                } catch {
                  toast.error("Failed to delete");
                }
                closeToast();
              }}
            >
              Delete
            </Button>
            <Button size="sm" variant="secondary" onClick={closeToast}>
              Cancel
            </Button>
          </div>
        </div>
      ),
      { autoClose: false, closeButton: false }
    );
  };

  if (loading)
    return (
      <div className="p-10 text-center text-muted-foreground">
        Loading predictions…
      </div>
    );

  if (!userData.length)
    return (
      <div className="p-10 text-center text-red-500">
        No predictions found.
      </div>
    );

  return (
    <div className="min-h-screen bg-white dark:bg-zinc-950 px-4 py-10">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">My Predictions</h1>
            <p className="text-sm text-muted-foreground mt-1">
              Track performance, confidence & outcomes in real-time
            </p>
          </div>

          <Select value={sortBy} onValueChange={setSortBy}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Sort by" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="latest">Latest</SelectItem>
              <SelectItem value="fulfilled">Fulfilled</SelectItem>
              <SelectItem value="confidence">Confidence</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Grid */}
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {userData.map((p) => (
            <Card
              key={p.slug}
              className="group relative bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 hover:shadow-xl transition-all"
            >
              {/* Delete */}
              <DeleteButton onDelete={() => handleDelete(p.slug, p.timeframe)} />

              <CardHeader className="pb-3">
                <div className="flex items-center gap-3">
                  <img
                    src={p.logo || "/default-icon.png"}
                    alt={p.symbol}
                    className="w-10 h-10 rounded-full border bg-white"
                  />

                  <div className="flex-1">
                    <CardTitle className="flex items-center gap-2 text-lg">
                      {p.symbol}
                      {p.direction === "positive" ? (
                        <TrendingUp className="w-4 h-4 text-green-500" />
                      ) : (
                        <TrendingDown className="w-4 h-4 text-red-500" />
                      )}
                    </CardTitle>
                    <p className="text-xs text-muted-foreground">
                      Target ${p.targetPrice}
                    </p>
                  </div>

                  <StatusBadge status={p.outcome} />
                </div>
              </CardHeader>

              <CardContent className="space-y-4 text-sm">
                <Stat label="Voted At" value={`$${p.priceWhenVoting || "—"}`} />
                <Stat label="Current" value={<LiveCryptoPrice coinName={p.symbol} />} />
                <Stat label="Timeframe" value={formatTimeframe(p.timeframe)} />
                <Stat label="Created" value={moment(p.createdAt).format("MMM D, YYYY")} />

                {/* Confidence */}
                <div>
                  <div className="flex justify-between mb-1">
                    <span className="text-xs text-muted-foreground">Confidence</span>
                    <span className="text-xs font-medium">{p.confidence || 0}%</span>
                  </div>
                  <div className="h-2 w-full rounded bg-zinc-200 dark:bg-zinc-700">
                    <div
                      className="h-full rounded bg-gradient-to-r from-blue-500 to-indigo-500"
                      style={{ width: `${p.confidence || 0}%` }}
                    />
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
};

/* ---------- Reusable UI Parts ---------- */

const Stat = ({ label, value }) => (
  <div className="flex justify-between">
    <span className="text-muted-foreground">{label}</span>
    <span className="font-medium">{value}</span>
  </div>
);

const formatTimeframe = (t) =>
  t === "24" ? "24 Hours" : t === "7" ? "7 Days" : t === "1" ? "1 Month" : `${t}h`;

const StatusBadge = ({ status }) => {
  const map = {
    fulfilled: {
      text: "Fulfilled",
      cls: "bg-green-100 text-green-800 border border-green-300",
      icon: <CheckCircle className="w-4 h-4" />,
    },
    expired: {
      text: "Expired",
      cls: "bg-red-100 text-red-800 border border-red-300",
      icon: <XCircle className="w-4 h-4" />,
    },
    pending: {
      text: "Pending",
      cls: "bg-yellow-100 text-yellow-800 border border-yellow-300",
      icon: <Clock className="w-4 h-4" />,
    },
  };

  const s = map[status] || map.pending;

  return (
    <span
      className={`inline-flex items-center gap-1.5 px-3 py-1 text-xs font-medium rounded-full ${s.cls}`}
    >
      {s.icon} {s.text}
    </span>
  );
};

const DeleteButton = ({ onDelete }) => (
  <button
    onClick={onDelete}
    title="Delete prediction"
    className="
      absolute top-3 right-3
      opacity-0 group-hover:opacity-100
      transition-all duration-200
      px-2.5 py-1.5 rounded-full
      text-xs font-medium
      text-red-500
      bg-red-100/50 hover:bg-red-200/60
      border border-red-200
      backdrop-blur
    "
  >
    Delete
  </button>
);

export default MyPredictions;
