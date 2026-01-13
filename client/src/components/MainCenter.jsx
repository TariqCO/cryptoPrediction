import { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";

import { submitPrediction } from "../api/crypto";

import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import {
  Select,
  SelectTrigger,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";

import LiveCryptoPrice from "./ui/LiveCryptoPrice";
import useLiveCryptoPrice from "../hooks/useLiveCryptoPrice";
import Notification from "./ui/Notification";
import { setTF } from "../redux/feature/timeframeSlice";

const fadeVariant = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: -20 },
  transition: { duration: 0.25 },
};

const formatDateForInput = (date) => {
  if (!date) return "";
  const pad = (n) => n.toString().padStart(2, "0");
  const yyyy = date.getFullYear();
  const mm = pad(date.getMonth() + 1);
  const dd = pad(date.getDate());
  const hh = pad(date.getHours());
  const min = pad(date.getMinutes());
  return `${yyyy}-${mm}-${dd}T${hh}:${min}`;
};

export default function MainCenter({ topic, onSubmitSuccess }) {
  const [choice, setChoice] = useState("positive");
  const [text, setText] = useState("");
  const [fulfillmentDate, setFulfillmentDate] = useState(null);
  const [targetPrice, setTargetPrice] = useState("");
  const [timeframe, setTimeFrame] = useState("24");
  const [confidence, setConfidence] = useState(70);
  const [loading, setLoading] = useState(false);
  const [coinName, setCoinName] = useState("");
  const [notif, setNotif] = useState({ message: "", type: "success" });

  const currentUser = useSelector((s) => s.currentUser.user);

  const dispatch = useDispatch();
  const { currentPrice } = useLiveCryptoPrice(coinName);

  useEffect(() => {
    setChoice("positive");
    setText("");
    setFulfillmentDate(null);
    setTargetPrice("");
    setConfidence(70);
    setTimeFrame("24");
    setNotif({ message: "", type: "success" });
    setCoinName(topic.symbol);
  }, [topic]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setNotif({ message: "", type: "success" });

    if (!text || !targetPrice) {
      setNotif({
        type: "error",
        message: "Please fill in all required fields.",
      });
      setLoading(false);
      return;
    }

    let finalFulfillmentTime = fulfillmentDate
      ? new Date(fulfillmentDate).toISOString()
      : (() => {
          const now = new Date();
          if (timeframe === "24") now.setHours(now.getHours() + 24);
          else if (timeframe === "7") now.setDate(now.getDate() + 7);
          else if (timeframe === "1") now.setMonth(now.getMonth() + 1);
          return now.toISOString();
        })();

    const todayDateOnly = new Date().toISOString().split("T")[0];



    const newPrediction = {
      direction: choice,
      text,
      fulfillmentTime: finalFulfillmentTime,
      targetPrice,
      confidence,
      timeframe,
      currentPrice,
      date: todayDateOnly,
    };

    try {
      await submitPrediction({
        heading: topic.heading,
        slug: topic.slug,
        symbol: topic.symbol,
        prediction: newPrediction,
      });

      onSubmitSuccess?.();
      dispatch(setTF(timeframe))
      setNotif({
        type: "success",
        message: "✅ Prediction submitted successfully!",
      });

    } catch (err) {
      setNotif({
        type: "error",
        message: err?.response?.data?.msg || "❌ Something went wrong.",
      });
    } finally {
      setLoading(false);
    }
  };

  if (!topic) return null;

  return (
    <AnimatePresence mode="wait">
      <motion.div key={topic.slug} {...fadeVariant}>
        <Card className="shadow-md rounded-2xl bg-white text-black border border-gray-200 dark:bg-zinc-900 dark:text-zinc-100 dark:border-zinc-700 dark:shadow-[0_0_12px_rgba(255,255,255,0.05)]">
          <CardHeader>
            <CardTitle className="text-xl font-semibold">
              📊 Submit Your Prediction
            </CardTitle>
          </CardHeader>

          <CardContent className="space-y-6">
            {currentUser ? (
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <img
                      src={topic.logo}
                      alt={topic.heading}
                      className="w-8 h-8 rounded-full object-cover"
                    />
                    <span className="font-medium text-base">
                      {topic.heading}
                    </span>
                  </div>
                  <div className="flex flex-col items-end space-y-1 text-gray-500 dark:text-zinc-400">
                    <LiveCryptoPrice coinName={topic.symbol} text="20px" />
                    <LiveCryptoPrice coinName={topic.symbol} c={false} text="14px" />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label>Direction</Label>
                  <RadioGroup defaultValue="positive" onValueChange={setChoice} className="flex gap-6">
                    <div className="flex items-center gap-2">
                      <RadioGroupItem value="positive" id="up" />
                      <Label htmlFor="up">📈 Up</Label>
                    </div>
                    <div className="flex items-center gap-2">
                      <RadioGroupItem value="negative" id="down" />
                      <Label htmlFor="down">📉 Down</Label>
                    </div>
                  </RadioGroup>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="fulfillment">Fulfillment Date & Time (Optional)</Label>
                    <Input
                      id="fulfillment"
                      type="datetime-local"
                      className="w-full"
                      value={fulfillmentDate ? formatDateForInput(fulfillmentDate) : ""}
                      onChange={(e) => {
                        const selected = e.target.value ? new Date(e.target.value) : null;
                        setFulfillmentDate(selected);

                        if (selected) {
                          const now = new Date();
                          const diffInHours = (selected - now) / (1000 * 60 * 60);

                          if (diffInHours <= 24) setTimeFrame("24");
                          else if (diffInHours <= 24 * 7) setTimeFrame("7");
                          else setTimeFrame("1");
                        }
                      }}
                    />
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      Will automatically assign timeframe: {timeframe === "24" ? "24h" : timeframe === "7" ? "7d" : "1M"}
                    </p>
                  </div>

                  <div className="space-y-2">
                    <Label>Prediction Timeframe</Label>
                    <Select
                      value={timeframe}
                      onValueChange={(val) => {
                        setTimeFrame(val);
                        setFulfillmentDate(null);
                      }}
                    >
                      <SelectTrigger className="w-full">
                        {timeframe === "24" ? "24 Hours" : timeframe === "7" ? "7 Days" : "1 Month"}
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="24">24 Hours</SelectItem>
                        <SelectItem value="7">7 Days</SelectItem>
                        <SelectItem value="1">1 Month</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="price">Target Price (USD)</Label>
                  <Input
                    id="price"
                    type="number"
                    step="0.01"
                    placeholder="e.g. 34500.00"
                    value={targetPrice}
                    onChange={(e) => setTargetPrice(e.target.value)}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label>Confidence Level ({confidence}%)</Label>
                  <Slider defaultValue={[70]} max={100} min={0} step={1} onValueChange={(val) => setConfidence(val[0])} />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="prediction">Prediction Explanation</Label>
                  <Textarea
                    id="prediction"
                    rows={4}
                    value={text}
                    onChange={(e) => setText(e.target.value)}
                    placeholder="Explain your reasoning behind this prediction..."
                    required
                  />
                </div>

                <div className="p-3 rounded-md border bg-gray-100 text-sm text-black/80 dark:bg-zinc-800 dark:text-white/80">
                  <p><b>Symbol:</b> {topic.symbol}</p>
                  <p><b>Direction:</b> {choice}</p>
                  <p><b>Target Price:</b> ${targetPrice}</p>
                  <p><b>Timeframe:</b> {timeframe === "24" ? "24 Hours" : timeframe === "7" ? "7 Days" : "1 Month"}</p>
                  <p><b>Confidence:</b> {confidence}%</p>
                </div>

                <Button type="submit" disabled={loading} className="w-full">
                  {loading ? "Submitting..." : "Submit Prediction"}
                </Button>

                <Notification type={notif.type} message={notif.message} onClose={() => setNotif({ ...notif, message: "" })} />
              </form>
            ) : (
              <p className="text-sm text-gray-600 text-center dark:text-gray-400">
                Please <Link to="/login" className="text-blue-600 dark:text-blue-400 underline">log in</Link> to submit a prediction.
              </p>
            )}
          </CardContent>
        </Card>
      </motion.div>
    </AnimatePresence>
  );
}
