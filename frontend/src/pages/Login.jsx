import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  FaCode,
  FaPlay,
  FaGoogle,
  FaFacebook,
  FaTwitter,
  FaInstagram,
} from "react-icons/fa";
import { motion } from "framer-motion";
import { authUser } from "../api/user";

export default function LoginBox() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });

  const handleChange = (e) =>
    setFormData({ ...formData, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    try {
      setLoading(true);
      const res = await authUser("/login", formData);
      localStorage.setItem("accessToken", res.user.accessToken);
      navigate("/");
      window.location.reload();
    } catch (err) {
      setError(
        err.response?.data?.message ||
          err.response?.data?.error ||
          "Something went wrong"
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="flex min-h-screen items-center justify-center bg-gradient-to-br from-blue-50 via-white to-blue-100 font-poppins">
      <motion.div
        initial={{ opacity: 0, y: 40 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: "easeOut" }}
        className="flex w-full max-w-5xl overflow-hidden rounded-2xl bg-white shadow-2xl"
      >
        {/* LEFT PANEL */}
        <motion.div
          initial={{ x: -50, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          transition={{ duration: 0.8 }}
          className="hidden w-[60%] flex-col justify-between bg-gradient-to-br from-blue-600 to-blue-800 p-10 text-white md:flex"
        >
          <span className="flex items-center gap-3 text-lg font-medium">
            <FaCode />
            Crypto<span className="font-bold">Predict</span>
          </span>
          <div>
            <h1 className="text-[34px] font-bold leading-tight drop-shadow">
              Predict crypto markets <br /> smarter, faster, better.
            </h1>
            <motion.button
              whileHover={{ scale: 1.05 }}
              className="mt-6 flex items-center gap-2 rounded-full bg-white px-5 py-2 text-blue-700 hover:bg-blue-100 transition-all"
            >
              <FaPlay className="text-sm" />
              Watch Demo
            </motion.button>
          </div>
        </motion.div>

        {/* LOGIN PANEL */}
        <div className="flex w-full flex-col justify-center gap-6 rounded-r-2xl bg-white p-10 text-gray-800 md:w-[40%]">
          <motion.div
            initial={{ y: -20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.2 }}
          >
            <h3 className="text-2xl font-bold">Welcome Back</h3>
            <p className="text-sm text-gray-500">
              Login to continue your crypto prediction journey.
            </p>
          </motion.div>

          <form
            onSubmit={handleSubmit}
            className="flex flex-col gap-4"
          >
            <input
              type="email"
              name="email"
              placeholder="email@email.com"
              className="rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-800 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
              onChange={handleChange}
              value={formData.email}
              required
              disabled={loading}
            />
            <input
              type="password"
              name="password"
              placeholder="********"
              className="rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-800 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
              onChange={handleChange}
              value={formData.password}
              required
              disabled={loading}
            />

            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              type="submit"
              disabled={loading}
              className="rounded-lg bg-gradient-to-r from-blue-600 to-blue-700 py-2 text-white font-semibold transition hover:opacity-90 disabled:opacity-60"
            >
              {loading ? "Logging in..." : "Login"}
            </motion.button>

            {error && (
              <p className="text-center text-sm text-red-500">{error}</p>
            )}
          </form>

          <div className="flex flex-col items-center gap-3 text-sm text-gray-500">
            <p>Or sign in with</p>
            <div className="flex gap-4 text-xl text-gray-500">
              <FaGoogle className="cursor-pointer hover:text-blue-600" />
              <FaFacebook className="cursor-pointer hover:text-blue-600" />
              <FaTwitter className="cursor-pointer hover:text-blue-600" />
              <FaInstagram className="cursor-pointer hover:text-blue-600" />
            </div>
            <Link
              to="/register"
              className="text-blue-600 hover:underline"
            >
              Don’t have an account?
            </Link>
          </div>
        </div>
      </motion.div>
    </main>
  );
}
