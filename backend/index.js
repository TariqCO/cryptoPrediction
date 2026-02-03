import express from "express";
import cors from "cors";
import cryptoRoutes from "./src/routes/cryptoRoutes.js";
import userRoutes from "./src/routes/userRoutes.js";
import fetchCoinRoute from "./src/services/fetchCoin.js";


import cookieParser from "cookie-parser";
import { dbConnection } from "./src/db/dbConnection.js";

// Load environment variables (.env)
import "dotenv/config";
import { getTrendingFromCoinGecko } from "./src/services/coinGeckoApi.js";


const app = express();

// ──────────── Middleware ────────────
const corsOptions = {
  origin: "https://crypto-prediction-gew7.vercel.app/",
  methods: ["GET", "POST", "PUT", "DELETE"],
  credentials: true,
};


app.use(cookieParser());
app.use(cors(corsOptions));

app.use(express.urlencoded({extended: true}))
app.use(express.json());

// ──────────── Routes ────────────
app.use("/api/crypto", cryptoRoutes);
app.use("/api/user", userRoutes);
app.use("/api/fetch", fetchCoinRoute);


// ──────────── PORT Connection ────────────
app.listen(process.env.PORT,'0.0.0.0', () =>
  console.log(`🌐 Server running on http://localhost:${process.env.PORT}`)
);

// ──────────── Data Base Connection ────────────
dbConnection();
getTrendingFromCoinGecko();
