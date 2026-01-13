import { useEffect, useRef, useState } from "react";
import api from "../api/api";

const useLiveCryptoPrice = (coinName) => {
  const [priceFormat, setPriceFormat] = useState(null);
  const [changeInPriceFormat, setChangeInPriceFormat] = useState(null);
  const [priceColor, setPriceColor] = useState("text-green-500");
  const [currentPrice, setCurrentPrice] = useState(null);
  const [prev24hPrice, setPrev24hPrice] = useState(null);
  const [error, setError] = useState(null);

  const prevPriceRef = useRef(null);
  const wsRef = useRef(null); // WebSocket reference
  const nameInLowerCase = coinName?.toLowerCase();

  const PRICE_CHANGE_THRESHOLD_PERCENT = 0.05;

  // ─── Fetch Previous 24h Close Price ────────────────────────
  useEffect(() => {
    if (!nameInLowerCase) return;

    const fetchPrevPrice = async () => {
      try {
        const res = await api.get(`/fetch/ticker24h/${nameInLowerCase}usdt`);
        const prevClose = parseFloat(res.data?.prevClosePrice);

        if (isNaN(prevClose)) throw new Error("Invalid prevClosePrice");
        setPrev24hPrice(prevClose);
        setError(null);
      } catch (err) {
        console.error("❌ Failed to fetch 24h price:", err.message);
        setPrev24hPrice(null);
        setError("Unable to fetch 24h price.");
      }
    };

    fetchPrevPrice();
  }, [nameInLowerCase]);

  // ─── WebSocket Connection ──────────────────────────────────
  useEffect(() => {
    if (!nameInLowerCase || !prev24hPrice) return;

    const socketUrl = `wss://stream.binance.com:9443/ws/${nameInLowerCase}usdt@trade`;
    const ws = new WebSocket(socketUrl);
    wsRef.current = ws;

    ws.onopen = () => {
      console.info("✅ WebSocket connected.");
      setError(null);
    };

    ws.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        const newPrice = parseFloat(data.p);
        if (isNaN(newPrice)) return;

        const prev = prevPriceRef.current;
        if (
          prev !== null &&
          Math.abs((newPrice - prev) / prev) * 100 < PRICE_CHANGE_THRESHOLD_PERCENT
        ) {
          return;
        }

        setCurrentPrice(newPrice);
        prevPriceRef.current = newPrice;

        const change = ((newPrice - prev24hPrice) / prev24hPrice) * 100;

        setPriceFormat(
          `$${newPrice.toLocaleString("en-US", {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2,
          })}`
        );

        setChangeInPriceFormat(`${change.toFixed(1)}%`);

        if (prev !== null) {
          if (newPrice > prev) setPriceColor("text-green-500");
          else if (newPrice < prev) setPriceColor("text-red-500");
        }

        setError(null);
      } catch (err) {
        console.error("❌ WebSocket message error:", err.message);
        setError("Price data parse error.");
      }
    };

    ws.onerror = (err) => {
      console.error("❌ WebSocket error occurred.");
      setError("WebSocket connection error.");
    };

    ws.onclose = () => {
      console.warn("ℹ️ WebSocket closed.");
    };

    return () => {
      if (ws && ws.readyState === WebSocket.OPEN) {
        ws.close();
      }
    };
  }, [nameInLowerCase, prev24hPrice]);

  return {
    priceFormat,
    changeInPriceFormat,
    priceColor,
    currentPrice,
    error,
  };
};

export default useLiveCryptoPrice;
