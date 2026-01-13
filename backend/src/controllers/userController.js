
import { CryptoModel } from "../models/cryptoModel.js";
import { userModel } from "../models/userModel.js";
import { uploadOnCloudinary } from "../services/cloudinary.js";
import fs from "fs/promises";

/* ────────── 1. TOKEN HELPER ───────────────────────────── */
export const generateAccessAndRefreshToken = async (userId) => {
  const user = await userModel.findById(userId);
  if (!user) throw new Error("User not found while issuing tokens");

  const refreshToken = user.generateRefreshToken();
  const accessToken = user.generateAccessToken();

  user.refreshToken = refreshToken;
  await user.save({ validateBeforeSave: false });

  return { refreshToken, accessToken };
};

/* ────────── 2. REGISTER USER ──────────────────────────── */
export const registerUser = async (req, res) => {
  try {
    const { name, email, password } = req.body;
    const filePath = req.file?.path;

    let profilePic = "";
    if (filePath) {
      const upload = await uploadOnCloudinary(filePath);
      profilePic = upload?.secure_url || "";
    }

    if (await userModel.exists({ email })) {
      return res.status(400).json({ error: "Email already in use" });
    }

    const user = await userModel.create({
      name,
      email,
      password,
      profileImage: profilePic,
    });

    const { refreshToken, accessToken } = await generateAccessAndRefreshToken(
      user._id
    );

    // 🧹 Delete temp file if it exists
    if (filePath) {
      try {
        await fs.unlink(filePath);
      } catch (err) {
        console.error("🧹 Cleanup error:", err.message);
      }
    }

    return res
      .status(201)
      .cookie("accessToken", accessToken, cookieOpts())
      .cookie("refreshToken", refreshToken, cookieOpts({ httpOnly: true }))
      .json({
        message: "User registered successfully",
        user: {
          id: user._id,
          name: user.name,
          email: user.email,
          profileImage: user.profileImage,
          refreshToken,
          accessToken,
        },
      });
  } catch (err) {
    console.error("Register error:", err);

    // 🧹 Cleanup temp file on error
    if (req.file?.path) {
      try {
        await fs.unlink(req.file.path);
      } catch (cleanupErr) {
        console.error("Cleanup error:", cleanupErr.message);
      }
    }

    return res.status(500).json({ error: "Server error" });
  }
};

/* ────────── 3. LOGIN USER ─────────────────────────────── */
export const loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await userModel.findOne({ email }).select("+password");
    if (!user || !(await user.correctPassword(password))) {
      return res.status(400).json({ error: "Invalid credentials" });
    }

    const { refreshToken, accessToken } = await generateAccessAndRefreshToken(
      user._id
    );

    return res
      .status(200)
      .cookie("accessToken", accessToken, cookieOpts())
      .cookie("refreshToken", refreshToken, cookieOpts({ httpOnly: true }))
      .json({
        message: "Login successful",
        user: {
          id: user._id,
          name: user.name,
          email: user.email,
          refreshToken,
          accessToken,
        },
      });
  } catch (err) {
    console.error("Login error:", err);
    return res.status(500).json({ error: "Server error" });
  }
};

export const usersPredictions = async (req, res) => {
  try {
    if (!req.filledPredictions) {
      return res.status(400).json({ error: "No prediction data available." });
    }

    res.status(200).json(req.filledPredictions);
  } catch (error) {
    console.error("❌ Error sending fulfilled predictions:", error);
    res.status(500).json({ error: "Failed to retrieve predictions." });
  }
};

export const deleteUserPrediction = async (req, res) => {
  const { slug, timeframe } = req.params;

  if (!req.user) {
    return res.status(401).json({ msg: "Unauthorized" });
  }

  const userId = req.user._id;

  try {
    const coinDoc = await CryptoModel.findOne({ slug });
    if (!coinDoc) return res.status(404).json({ msg: "Prediction not found" });

    // ✅ Only keep entries not made by this user for the given timeframe
    coinDoc.prediction.directions = coinDoc.prediction.directions.filter(
      (entry) =>
        entry.timeframe !== timeframe || entry.predictedBy?.toString() !== userId.toString()
    );

    // ❌ texts, confidence, targetPrices, etc. don't have predictedBy → filter by timeframe only
    coinDoc.prediction.texts = coinDoc.prediction.texts.filter(
      (entry) => entry.timeframe !== timeframe
    );

    coinDoc.prediction.confidence = coinDoc.prediction.confidence.filter(
      (entry) => entry.timeframe !== timeframe
    );

    coinDoc.prediction.targetPrices = coinDoc.prediction.targetPrices.filter(
      (entry) => entry.timeframe !== timeframe
    );

    coinDoc.prediction.fulfillmentTimes = coinDoc.prediction.fulfillmentTimes.filter(
      (entry) => entry.timeframe !== timeframe
    );

    coinDoc.prediction.fulfilled = coinDoc.prediction.fulfilled.filter(
      (entry) => entry.timeframe !== timeframe
    );

    await coinDoc.save();

    // 🧹 Remove from user's myPredictions
    await userModel.findByIdAndUpdate(userId, {
      $pull: {
        myPredictions: {
          slug,
          timeframe,
        },
      },
    });

    res.status(200).json({ msg: "✅ Your prediction has been successfully deleted." });
  } catch (error) {
    console.error("❌ Error deleting prediction:", error);
    res.status(500).json({ msg: "Failed to delete prediction" });
  }
};



/* ────────── 4. LOGOUT USER ────────────────────────────── */
export const logout = (req, res) => {
  res
    .clearCookie("accessToken")
    .clearCookie("refreshToken")
    .json({ message: "Logged out successfully" });
};

/* ────────── 5. COOKIE OPTIONS ─────────────────────────── */
function cookieOpts(override = {}) {
  return {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "none",
     maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
    ...override,
  };
}

/* ────────── 6. PROTECTED ENDPOINT ─────────────────────── */
export const secure = async (req, res) => {
  return res.json({ user: req.user });
};
