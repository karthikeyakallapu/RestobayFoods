const MainLoader = () => {
  return (
    <div className="fixed inset-0 flex items-center justify-center">
      <div className="relative flex flex-col items-center">
        {/* Main bouncing dots */}
        <div className="flex flex-row gap-4">
          <div className="w-10 h-10 rounded-full bg-[#ef5644] animate-bounce shadow-lg shadow-[#ef5644]/50 border-2 border-[#ef5644]/30"></div>
          <div className="w-10 h-10 rounded-full bg-[#ef5644] animate-bounce shadow-lg shadow-[#ef5644]/50 border-2 border-[#ef5644]/30 [animation-delay:-.1s]"></div>
          <div className="w-10 h-10 rounded-full bg-[#ef5644] animate-bounce shadow-lg shadow-[#ef5644]/50 border-2 border-[#ef5644]/30 [animation-delay:-.2s]"></div>
        </div>

        {/* Reflection effect */}
        <div className="flex flex-row gap-4 mt-2 opacity-30 blur-sm">
          <div className="w-12 h-4 rounded-full bg-[#ef5644] animate-bounce scale-y-50 origin-top shadow-lg shadow-[#ef5644]/30 [animation-delay:0s] [animation-direction:reverse]"></div>
          <div className="w-12 h-4 rounded-full bg-[#ef5644] animate-bounce scale-y-50 origin-top shadow-lg shadow-[#ef5644]/30 [animation-delay:-.1s] [animation-direction:reverse]"></div>
          <div className="w-12 h-4 rounded-full bg-[#ef5644] animate-bounce scale-y-50 origin-top shadow-lg shadow-[#ef5644]/30 [animation-delay:-.2s] [animation-direction:reverse]"></div>
        </div>

        {/* Ambient glow */}
        <div className="absolute inset-0 -m-8 bg-[#ef5644]/10 rounded-full blur-xl animate-pulse -z-10"></div>
      </div>
    </div>
  );
};

export default MainLoader;
