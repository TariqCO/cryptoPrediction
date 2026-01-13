import { Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { useState, useEffect } from "react";

const AnimatedLogo = () => {

  const [showB, setShowB] = useState(false);

  useEffect(() => {
   
    const timer = setTimeout(() => setShowB(true), 600);
    return () => clearTimeout(timer);
  }, []);

  return (
    <Link
      to="/"
      className="flex relative items-center gap-2 text-xl font-extrabold tracking-tight text-[#59bdeb]"
    >
      <AnimatePresence initial={false}>
        {!showB && (
          <motion.img
            key="logoA"
            src="/circle.png"
            alt="Predicta"
            className="w-8 h-8 absolute"
            initial={{ rotate: 0, opacity: 0 }}
            animate={{ rotate: 360, opacity: 1 }}
            exit={{ rotate: 360, opacity: 0 }}
            transition={{ duration: 0.8, ease: "easeInOut" }}
          />
        )}

        {showB && (
          <motion.img
            key="logoB"
            src="/predicta.png"
            alt="Predicta"
            className="w-8 h-8 absolute"
            initial={{ rotate: -360, opacity: 0 }}
            animate={{ rotate: 0, opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 1, ease: "easeInOut" }}
          />
          
        )}
      </AnimatePresence>
      <motion.h1 className="relative left-10" initial={{ left: 0, opacity: 0 }}
            animate={{ left: 40, opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.6, ease: "linear" }}>Predicta</motion.h1>

    </Link>
  );
};

export default AnimatedLogo;
