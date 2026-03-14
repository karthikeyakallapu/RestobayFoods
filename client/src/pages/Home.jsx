import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import BlockWrapper from "@/_components/Wrappers/BlockWrapper";
import MAIN_IMG from "@/assets/images/home_main.png";
import { Link } from "react-router-dom";
import {
  Utensils,
  Calendar,
  ArrowRight,
  Sparkles,
  Coffee,
  ChefHat,
} from "lucide-react";

const Home = () => {
  const [showOptions, setShowOptions] = useState(false);

  return (
    <BlockWrapper>
      <div className="flex flex-col md:flex-row items-center justify-center min-h-[calc(100vh-12rem)] px-4 relative overflow-hidden">
        {/* Background decorative elements */}
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-20 left-10 w-64 h-64 bg-[#ef5644]/5 rounded-full blur-3xl"></div>
          <div className="absolute bottom-20 right-10 w-80 h-80 bg-orange-200/20 rounded-full blur-3xl"></div>
        </div>

        <div className="flex flex-col md:flex-row items-center gap-8 md:gap-16 relative z-10">
          {/* Image Section with floating animation */}
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6 }}
            className="relative"
          >
            {/* Floating elements */}
            <motion.div
              animate={{
                y: [0, -10, 0],
                rotate: [0, 2, -2, 0],
              }}
              transition={{
                duration: 6,
                repeat: Infinity,
                repeatType: "reverse",
              }}
              className="absolute -top-8 -right-8 bg-white p-3 rounded-2xl shadow-xl z-20"
            >
              <ChefHat className="text-[#ef5644]" size={24} />
            </motion.div>

            <motion.div
              animate={{
                y: [0, 10, 0],
                rotate: [0, -2, 2, 0],
              }}
              transition={{
                duration: 5,
                repeat: Infinity,
                repeatType: "reverse",
                delay: 1,
              }}
              className="absolute -bottom-4 -left-4 bg-white p-3 rounded-2xl shadow-xl z-20"
            >
              <Coffee className="text-[#ef5644]" size={20} />
            </motion.div>

            {/* Main image with glow effect */}
            <div className="relative">
              <div className="absolute -inset-4 bg-gradient-to-r from-[#ef5644]/30 to-orange-300/30 rounded-full blur-2xl"></div>
              <motion.img
                whileHover={{ scale: 1.02 }}
                transition={{ type: "spring", stiffness: 300 }}
                src={MAIN_IMG}
                className="relative h-[30vh] md:h-[50vh] w-[60vw] md:w-[35vw] object-contain drop-shadow-2xl"
                alt="Restobay - Delicious Food"
              />
            </div>

            {/* Rating badge */}
            <motion.div
              initial={{ opacity: 0, scale: 0 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.5 }}
              className="absolute -bottom-2 -right-2 bg-white px-4 py-2 rounded-xl shadow-lg flex items-center gap-2"
            >
              <div className="flex">
                {[1, 2, 3, 4, 5].map((star) => (
                  <svg
                    key={star}
                    className="w-4 h-4 text-yellow-400 fill-current"
                    viewBox="0 0 20 20"
                  >
                    <path d="M10 15l-5.878 3.09 1.123-6.545L.489 6.91l6.572-.955L10 0l2.939 5.955 6.572.955-4.756 4.635 1.123 6.545z" />
                  </svg>
                ))}
              </div>
              <span className="text-sm font-medium text-gray-700">
                500+ reviews
              </span>
            </motion.div>
          </motion.div>

          {/* Content Section */}
          <div className="flex flex-col items-center md:items-end justify-center text-center md:text-right">
            {/* Welcome badge */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="bg-gradient-to-r from-[#ef5644]/10 to-orange-100 px-4 py-2 rounded-full mb-4 inline-flex items-center gap-2"
            >
              <Sparkles size={16} className="text-[#ef5644]" />
              <span className="text-sm font-medium text-[#ef5644]">
                Fine Dining Experience
              </span>
            </motion.div>

            {/* Main heading with gradient */}
            <motion.h2
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.3 }}
              className="main-head-1 text-4xl md:text-6xl font-bold mb-4 relative"
            >
              Welcome to{" "}
              <span className="relative">
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#ef5644] to-[#ff8a7a]">
                  Restobay
                </span>
                <span className="absolute -bottom-2 left-0 w-full h-1 bg-gradient-to-r from-[#ef5644] to-transparent rounded-full"></span>
              </span>
            </motion.h2>

            {/* Description */}
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.4 }}
              className="text-gray-600 text-lg mb-8 max-w-md kanit-400"
            >
              Discover amazing flavors and book your table for an unforgettable
              dining experience.
            </motion.p>

            {/* CTA Section */}
            <AnimatePresence mode="wait">
              {!showOptions ? (
                <motion.button
                  key="get-started"
                  className="group relative px-8 py-4 bg-gradient-to-r from-[#ef5644] to-[#ff8a7a] text-white rounded-2xl font-semibold text-lg shadow-xl hover:shadow-2xl transition-all overflow-hidden kanit-500"
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
                      className="group w-40 px-6 py-4 bg-white text-[#ef5644] rounded-2xl font-semibold shadow-lg hover:shadow-xl transition-all border-2 border-[#ef5644]/20 hover:border-[#ef5644] flex items-center justify-center gap-2 kanit-500"
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
                      className="group w-40 px-6 py-4 bg-gradient-to-r from-[#ef5644] to-[#ff8a7a] text-white rounded-2xl font-semibold shadow-lg hover:shadow-xl transition-all flex items-center justify-center gap-2 kanit-500"
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

            {/* Stats Section */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.8 }}
              className="mt-12 flex gap-8"
            >
              <div className="text-center">
                <div className="text-2xl font-bold text-[#ef5644] kanit-600">
                  50+
                </div>
                <div className="text-xs text-gray-500 kanit-400">Dishes</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-[#ef5644] kanit-600">
                  20+
                </div>
                <div className="text-xs text-gray-500 kanit-400">Chefs</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-[#ef5644] kanit-600">
                  5k+
                </div>
                <div className="text-xs text-gray-500 kanit-400">Customers</div>
              </div>
            </motion.div>
          </div>
        </div>
      </div>
    </BlockWrapper>
  );
};

export default Home;
