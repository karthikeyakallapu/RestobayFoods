import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import BlockWrapper from "@/_components/Wrappers/BlockWrapper";
import MAIN_IMG from "@/assets/images/home_main.png";
import { Link } from "react-router-dom";
import { Utensils, Calendar, ArrowRight, Sparkles } from "lucide-react";

const Home = () => {
  const [showOptions, setShowOptions] = useState(false);

  return (
    <BlockWrapper>
      <div className="flex flex-col md:flex-row items-center justify-center min-h-[calc(100vh-100px)] px-4">
        <motion.div
          initial={{ opacity: 0, x: -50 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6 }}
          className="flex flex-col md:flex-row items-center gap-8 md:gap-16"
        >
          {/* Image Section */}
          <motion.div
            whileHover={{ scale: 1.02 }}
            transition={{ type: "spring", stiffness: 300 }}
            className="relative"
          >
            <div className="absolute -inset-4   rounded-full "></div>
            <img
              src={MAIN_IMG}
              className="relative h-[30vh] md:h-[50vh] w-[60vw] md:w-[35vw] object-contain "
              alt="Restobay - Delicious Food"
            />
          </motion.div>

          {/* Content Section */}
          <div className="flex flex-col items-center md:items-end justify-center text-center md:text-right">
            <motion.h2
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="text-3xl md:text-5xl font-bold text-gray-800 mb-4"
            >
              Welcome to{" "}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#ef5644] to-[#ff8a7a]">
                Restobay
              </span>
            </motion.h2>

            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.3 }}
              className="text-gray-600 text-lg mb-8 max-w-md"
            >
              Discover amazing flavors and book your table for an unforgettable
              dining experience.
            </motion.p>

            <AnimatePresence mode="wait">
              {!showOptions ? (
                <motion.button
                  key="get-started"
                  className="group relative px-8 py-4 bg-gradient-to-r from-[#ef5644] to-[#ff8a7a] text-white rounded-2xl font-semibold text-lg shadow-xl hover:shadow-2xl transition-all overflow-hidden"
                  onClick={() => setShowOptions(true)}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <span className="relative z-10 flex items-center gap-2">
                    Get Started
                    <Sparkles
                      size={20}
                      className="group-hover:rotate-12 transition-transform"
                    />
                  </span>
                  <motion.div
                    className="absolute inset-0 bg-gradient-to-r from-[#d04a3b] to-[#ff6b5a]"
                    initial={{ x: "100%" }}
                    whileHover={{ x: 0 }}
                    transition={{ duration: 0.3 }}
                  />
                </motion.button>
              ) : (
                <motion.div
                  key="options"
                  className="flex flex-col sm:flex-row gap-4 mt-2"
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 10 }}
                  transition={{ duration: 0.4 }}
                >
                  <Link to="/menu">
                    <motion.button
                      className="group w-40 px-6 py-4 bg-white text-[#ef5644] rounded-2xl font-semibold shadow-lg hover:shadow-xl transition-all border-2 border-[#ef5644]/20 hover:border-[#ef5644] flex items-center justify-center gap-2"
                      whileHover={{ scale: 1.05, y: -2 }}
                      whileTap={{ scale: 0.95 }}
                    >
                      <Utensils size={20} />
                      Menu
                      <ArrowRight
                        size={16}
                        className="group-hover:translate-x-1 transition-transform"
                      />
                    </motion.button>
                  </Link>

                  <Link to="/table">
                    <motion.button
                      className="group w-40 px-6 py-4 bg-gradient-to-r from-[#ef5644] to-[#ff8a7a] text-white rounded-2xl font-semibold shadow-lg hover:shadow-xl transition-all flex items-center justify-center gap-2"
                      whileHover={{ scale: 1.05, y: -2 }}
                      whileTap={{ scale: 0.95 }}
                    >
                      <Calendar size={20} />
                      Table
                      <ArrowRight
                        size={16}
                        className="group-hover:translate-x-1 transition-transform"
                      />
                    </motion.button>
                  </Link>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Decorative Elements */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.8 }}
              className="mt-12 flex gap-4 text-sm text-gray-400"
            >
              <span className="flex items-center gap-1">
                <span className="w-1 h-1 bg-[#ef5644] rounded-full"></span>
                Fresh Ingredients
              </span>
              <span className="flex items-center gap-1">
                <span className="w-1 h-1 bg-[#ef5644] rounded-full"></span>
                Expert Chefs
              </span>
              <span className="flex items-center gap-1">
                <span className="w-1 h-1 bg-[#ef5644] rounded-full"></span>
                Cozy Ambiance
              </span>
            </motion.div>
          </div>
        </motion.div>
      </div>
    </BlockWrapper>
  );
};

export default Home;
