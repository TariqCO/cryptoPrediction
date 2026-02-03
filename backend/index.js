import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import "dotenv/config";

import cryptoRoutes from "./src/routes/cryptoRoutes.js";
import userRoutes from "./src/routes/userRoutes.js";
import fetchCoinRoute from "./src/services/fetchCoin.js";
import { dbConnection } from "./src/db/dbConnection.js";
import { getTrendingFromCoinGecko } from "./src/services/coinGeckoApi.js";

const app = express();

// ──────────── CORS CONFIG ────────────
// Replace this with your **frontend deployed URL**
const allowedOrigins = ["https://crypto-prediction-gew7.vercel.app"];

const corsOptions = {
  origin: allowedOrigins,
  credentials: true,
  methods: ["GET", "POST", "PUT", "DELETE"],
};
app.use(cors(corsOptions));

// ──────────── Middleware ────────────
app.use(cookieParser());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// ──────────── Routes ────────────
app.use("/api/crypto", cryptoRoutes);
app.use("/api/user", userRoutes);
app.use("/api/fetch", fetchCoinRoute);

// ──────────── Database Connection ────────────
dbConnection();

// ──────────── CoinGecko Data Fetch ────────────
getTrendingFromCoinGecko();

// ──────────── Local Dev Server (optional) ────────────
// Only use this when running locally
if (process.env.NODE_ENV !== "production") {
  const PORT = process.env.PORT || 5000;
  app.listen(PORT, "0.0.0.0", () =>
    console.log(`🌐 Server running locally on http://localhost:${PORT}`)
  );
}

// ──────────── Export app for Vercel ────────────
export default app;
