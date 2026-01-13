import { useEffect, useState } from "react";
import moment from "moment";
import { TrashIcon } from "@radix-ui/react-icons";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
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

const MyPredictions = () => {
  const [userData, setUserData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [sortBy, setSortBy] = useState("latest");

  useEffect(() => {
    fetchProfile();
  }, [sortBy]);

  const fetchProfile = async () => {
    try {
      const res = await usersPrediction();
      let sorted = [...res];
      if (sortBy === "latest") {
        sorted.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
      } else if (sortBy === "fulfilled") {
        sorted.sort(
          (a, b) => new Date(b.fulfilledAt || 0) - new Date(a.fulfilledAt || 0)
        );
      } else if (sortBy === "confidence") {
        sorted.sort((a, b) => b.confidence - a.confidence);
      }
      setUserData(sorted);
    } catch (err) {
      console.error("Failed to load profile", err);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = (slug, timeframe) => {
    const toastId = toast(
      ({ closeToast }) => (
        <div className="space-y-2">
          <p className="text-sm font-medium">
            Are you sure you want to delete this prediction?
          </p>
          <div className="flex gap-2 justify-end">
            <Button
              variant="destructive"
              size="sm"
              onClick={async () => {
                try {
                  await deletePrediction(slug, timeframe);
                  setUserData((prev) => prev.filter((p) => p.slug !== slug));
                  toast.success("✅ Prediction deleted successfully!");
                } catch (err) {
                  console.error(err);
                  toast.error("❌ Failed to delete prediction.");
                }
                toast.dismiss(toastId);
              }}
            >
              Yes
            </Button>
            <Button
              variant="secondary"
              size="sm"
              onClick={() => toast.dismiss(toastId)}
            >
              No
            </Button>
          </div>
        </div>
      ),
      {
        closeOnClick: false,
        autoClose: false,
        closeButton: false,
      }
    );
  };

  if (loading)
    return (
      <div className="p-8 text-center text-zinc-700 dark:text-zinc-200">
        ⏳ Loading predictions...
      </div>
    );
  if (!userData.length)
    return (
      <div className="p-8 text-center text-red-500">No predictions found.</div>
    );

  return (
    <div className="min-h-screen bg-white dark:bg-zinc-950 text-zinc-900 dark:text-white px-4 py-10 transition-colors">
      <div className="max-w-7xl mx-auto space-y-6">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-4xl font-bold">📊 My Predictions</h1>
            <p className="text-zinc-600 dark:text-zinc-400 mt-1">
              Track your predictions and their outcomes in real-time.
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

        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {userData.map((prediction, idx) => (
            <Card
              key={idx}
              className="relative bg-zinc-100 dark:bg-zinc-900 border border-zinc-300 dark:border-zinc-700 shadow hover:shadow-lg hover:-translate-y-1 transition-all"
            >
              <Button
                variant="ghost"
                size="icon"
                className="absolute top-2 right-2 text-red-500 hover:text-red-700"
                onClick={() => handleDelete(prediction.slug, prediction.timeframe)}
              >
                <TrashIcon className="w-4 h-4" />
              </Button>

              <CardHeader className="flex items-center gap-2 pb-2">
                <img
                  src={prediction.logo || "/default-icon.png"}
                  alt={prediction.symbol}
                  onError={(e) => {
                    e.target.onerror = null;
                    e.target.src = "/default-icon.png";
                  }}
                  className="w-9 h-9 rounded-full object-contain border border-zinc-300 dark:border-zinc-600"
                />
                <CardTitle className="text-xl font-semibold">
                  {prediction.symbol}
                </CardTitle>
              </CardHeader>

              <CardContent className="space-y-3 text-sm text-zinc-800 dark:text-zinc-200">
                <div className="flex justify-between">
                  <span>🎯 Target:</span>
                  <span>${prediction.targetPrice}</span>
                </div>
                <div className="flex justify-between">
                  <span>🗳 Voted At:</span>
                  <span>${prediction.priceWhenVoting || "N/A"}</span>
                </div>
                <div className="flex justify-between">
                  <span>💰 Current:</span>
                  <span>
                    <LiveCryptoPrice coinName={prediction.symbol} />
                  </span>
                </div>
                <div className="flex justify-between">
                  <span>
                    {prediction.direction === "positive" ? "⬆️" : "⬇️"}{" "}
                    Direction:
                  </span>
                  <span
                    className={
                      prediction.direction === "positive"
                        ? "text-green-500"
                        : "text-red-500"
                    }
                  >
                    {prediction.direction}
                  </span>
                </div>
                <div>
                  🧠 Confidence:
                  <div className="mt-1 w-full h-2 rounded bg-zinc-300 dark:bg-zinc-700">
                    <div
                      className={`h-full rounded ${
                        prediction.confidence >= 70
                          ? "bg-green-500"
                          : prediction.confidence >= 40
                          ? "bg-yellow-500"
                          : "bg-red-500"
                      }`}
                      style={{ width: `${prediction.confidence || 0}%` }}
                    />
                  </div>
                  <div className="text-xs text-right">
                    {prediction.confidence || 0}%
                  </div>
                </div>
                <div className="flex justify-between">
                  <span>🕒 Timeframe:</span>
                  <span>
                    {prediction.timeframe === "24"
                      ? "24 Hours"
                      : prediction.timeframe === "7"
                      ? "7 Days"
                      : prediction.timeframe === "1"
                      ? "1 Month"
                      : `${prediction.timeframe}h`}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span>📅 Created:</span>
                  <span>
                    {moment(prediction.createdAt).format("YYYY-MM-DD h:mm A")}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span>⏱ Fulfilled At:</span>
                  <span>
                    {prediction.fulfilledAt
                      ? moment(prediction.fulfilledAt).format(
                          "YYYY-MM-DD h:mm A"
                        )
                      : "--"}
                  </span>
                </div>
                <div className="mt-2">
                  <Badge
                    className={`text-white ${
                      prediction.outcome === "fulfilled"
                        ? "bg-green-600"
                        : prediction.outcome === "expired"
                        ? "bg-red-600"
                        : "bg-yellow-500"
                    }`}
                  >
                    {prediction.outcome === "fulfilled"
                      ? "Fulfilled ✅"
                      : prediction.outcome === "expired"
                      ? "Expired ❌"
                      : "Pending ⏳"}
                  </Badge>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
};

export default MyPredictions;
