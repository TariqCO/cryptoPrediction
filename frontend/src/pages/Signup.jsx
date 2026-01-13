import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  FaGoogle,
  FaFacebook,
  FaTwitter,
  FaInstagram,
  FaUpload,
} from "react-icons/fa";
import { motion } from "framer-motion";
import { authUser } from "../api/user";

export default function RegisterBox() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
  });
  const [imageFile, setImageFile] = useState(null);
  const [preview, setPreview] = useState("");

  const handleChange = (e) =>
    setFormData({ ...formData, [e.target.name]: e.target.value });

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setImageFile(file);
      setPreview(URL.createObjectURL(file));
    }
  };

  useEffect(() => {
    return () => {
      if (preview) URL.revokeObjectURL(preview);
    };
  }, [preview]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    try {
      setLoading(true);
      const fd = new FormData();
      fd.append("name", formData.name);
      fd.append("email", formData.email);
      fd.append("password", formData.password);
      if (imageFile) fd.append("photo", imageFile);

      const res = await authUser("/register", fd);
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
    <main className="flex min-h-screen items-center justify-center bg-gradient-to-br from-blue-50 via-white to-blue-100 px-4 py-8 font-poppins">
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
          className="hidden w-3/5 flex-col justify-between bg-gradient-to-br from-blue-600 to-blue-800 p-10 text-white md:flex"
        >
          <span className="flex items-center gap-3 text-lg font-semibold">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth={1.5}
              stroke="currentColor"
              className="h-6 w-6"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M3.75 3v11.25A2.25 2.25 0 006 16.5h4.748M3.75 3h16.5M3.75 3L12 9.75 20.25 3M18 7.5v11.25m0 0A2.25 2.25 0 0019.5 21H4.5a2.25 2.25 0 01-2.25-2.25V6"
              />
            </svg>
            CryptoPredict
          </span>

          <div>
            <h2 className="text-3xl font-bold leading-snug drop-shadow-lg">
              Predict the Future of Crypto. <br /> Join the Revolution.
            </h2>

          </div>
        </motion.div>

        {/* REGISTER PANEL */}
        <div className="w-full p-8 md:w-2/5">
          <motion.h3
            initial={{ y: -20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="text-2xl font-bold text-zinc-800"
          >
            Create your account
          </motion.h3>
          <p className="mb-6 text-xs text-zinc-500">
            Start your journey into AI-powered crypto predictions.
          </p>

          <form
            onSubmit={handleSubmit}
            className="space-y-4"
            encType="multipart/form-data"
          >
            <input
              type="text"
              name="name"
              placeholder="Full Name"
              className="w-full rounded-lg border border-zinc-300 bg-white px-3 py-2 text-sm text-zinc-800 placeholder:text-zinc-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
              onChange={handleChange}
              value={formData.name}
              required
              disabled={loading}
            />
            <input
              type="email"
              name="email"
              placeholder="email@email.com"
              className="w-full rounded-lg border border-zinc-300 bg-white px-3 py-2 text-sm text-zinc-800 placeholder:text-zinc-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
              onChange={handleChange}
              value={formData.email}
              required
              disabled={loading}
            />
            <input
              type="password"
              name="password"
              placeholder="********"
              className="w-full rounded-lg border border-zinc-300 bg-white px-3 py-2 text-sm text-zinc-800 placeholder:text-zinc-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
              onChange={handleChange}
              value={formData.password}
              required
              disabled={loading}
            />

            {/* PHOTO UPLOAD */}
            <label className="flex cursor-pointer items-center justify-center gap-2 rounded-lg border border-dashed border-zinc-400 px-4 py-2 text-sm text-zinc-500 hover:bg-blue-50">
              <FaUpload />
              <span>{imageFile ? imageFile.name : "Upload profile photo"}</span>
              <input
                type="file"
                accept="image/*"
                onChange={handleImageChange}
                className="hidden"
                disabled={loading}
              />
            </label>

            {preview && (
              <motion.img
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                src={preview}
                alt="preview"
                className="mx-auto h-16 w-16 rounded-full object-cover ring-2 ring-blue-500"
              />
            )}

            <label className="flex items-center gap-2 text-xs text-zinc-600">
              <input
                type="checkbox"
                required
                className="accent-blue-600"
                disabled={loading}
              />
              I agree to&nbsp;
              <Link to="#" className="text-blue-600 hover:underline">
                Terms of Use
              </Link>
            </label>

            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              type="submit"
              disabled={loading}
              className="w-full rounded-lg bg-gradient-to-r from-blue-600 to-blue-700 px-4 py-2 font-semibold text-white transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {loading ? "Registering..." : "Register"}
            </motion.button>

            {error && (
              <p className="text-center text-xs text-red-500">{error}</p>
            )}
          </form>

          <div className="mt-6 space-y-4 text-center text-xs text-zinc-500">
            <p>Or sign up with</p>
            <div className="flex justify-center gap-4 text-lg text-zinc-600">
              <FaGoogle className="cursor-pointer hover:text-blue-600" />
              <FaFacebook className="cursor-pointer hover:text-blue-600" />
              <FaTwitter className="cursor-pointer hover:text-blue-600" />
              <FaInstagram className="cursor-pointer hover:text-blue-600" />
            </div>
            <Link
              to="/login"
              className="text-blue-600 transition hover:underline"
            >
              Already have an account?
            </Link>
          </div>
        </div>
      </motion.div>
    </main>
  );
}
