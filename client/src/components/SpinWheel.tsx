import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Phone, Mail, Check } from "lucide-react";

interface SpinWheelProps {
  onClose: () => void;
  onDiscountWon: (discount: string) => void;
}

export default function SpinWheel({ onClose, onDiscountWon }: SpinWheelProps) {
  const [isSpinning, setIsSpinning] = useState(false);
  const [rotation, setRotation] = useState(0);
  const [showResult, setShowResult] = useState(false);
  const [result, setResult] = useState("");
  const [isSpinAgain, setIsSpinAgain] = useState(false);
  const [hasSpun, setHasSpun] = useState(false);
  const [wonDiscount, setWonDiscount] = useState<string | null>(null);
  const [showClaimMessage, setShowClaimMessage] = useState(false);
  
  // Form state
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [termsAccepted, setTermsAccepted] = useState(false);
  
  // Validation
  const isFormValid = phone.length >= 10 && email.includes("@") && termsAccepted;

  // Lock body scroll when modal is open
  useEffect(() => {
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = '';
    };
  }, []);

  // Color palette - only yellow and green
  const colors = {
    softGreen: "#7FB069",
    lightGreen: "#4DB6AC",
    darkGreen: "#2D7A7A",
    warmYellow: "#F4D03F"
  };

  // Wheel segments - 8 slices with opposite pairs
  // Pair 1: Get 10% Off (index 0) : Get 10% Off (index 4)
  // Pair 2: Get 5% Off (index 1) : Get 5% Off (index 5)
  // Pair 3: Get 15% Off (index 2) : Spin Again (index 6)
  // Pair 4: No Luck (index 3) : No Luck (index 7)
  const segments = [
    { label: "Get 10% Off", color: colors.lightGreen },
    { label: "Get 5% Off", color: colors.darkGreen },
    { label: "Get 15% Off", color: colors.warmYellow },
    { label: "No Luck", color: colors.softGreen },
    { label: "Get 10% Off", color: colors.lightGreen },
    { label: "Get 5% Off", color: colors.darkGreen },
    { label: "Spin Again", color: colors.warmYellow },
    { label: "No Luck", color: colors.softGreen },
  ];

  const spinWheel = () => {
    if (!isFormValid || isSpinning || hasSpun) return;

    setIsSpinning(true);
    setShowResult(false);

    // Rigged logic: never land on 15% Off (index 2)
    // Possible outcomes: all other segments (indices 0, 1, 3, 4, 5, 6, 7)
    const possibleIndices = [0, 1, 3, 4, 5, 6, 7];
    const winningIndex = possibleIndices[Math.floor(Math.random() * possibleIndices.length)];
    
    // Calculate rotation to land on the winning segment
    // Each segment is 45 degrees (360 / 8)
    const segmentAngle = 360 / segments.length;
    const targetAngle = 360 - (winningIndex * segmentAngle) - (segmentAngle / 2);
    const extraRotations = 6 * 360; // 6 full rotations for smoother deceleration
    const newRotation = rotation + extraRotations + targetAngle - (rotation % 360);

    setRotation(newRotation);

    // Show result after spin completes (matches transition duration)
    setTimeout(() => {
      const resultLabel = segments[winningIndex].label;
      
      if (resultLabel === "Spin Again") {
        // Spin again automatically
        setIsSpinAgain(true);
        setTimeout(() => {
          setIsSpinAgain(false);
          spinWheel();
        }, 1000);
      } else {
        setIsSpinning(false);
        setResult(resultLabel);
        setShowResult(true);
        setHasSpun(true); // Disable future spins
        
        // Set won discount if it's a discount result
        if (resultLabel.includes("5%") || resultLabel.includes("10%")) {
          setWonDiscount(resultLabel);
          onDiscountWon(resultLabel); // Notify parent component
        }
      }
    }, 6000); // 6 seconds spin duration
  };

  const handleClose = () => {
    if (!isSpinning) {
      onClose();
    }
  };

  return (
    <AnimatePresence>
      {/* Overlay backdrop with gradient */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.3 }}
        className="fixed inset-0 z-[9998]"
        style={{
          background: 'linear-gradient(135deg, rgba(77, 182, 172, 0.3) 0%, rgba(255, 213, 79, 0.3) 100%)',
          backdropFilter: 'blur(8px)'
        }}
        onClick={handleClose}
      />
      
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.9 }}
        transition={{ duration: 0.3 }}
        className="fixed inset-0 z-[9999] flex items-center justify-center p-4 sm:p-8"
      >
        <div className="relative bg-white rounded-3xl shadow-2xl max-w-5xl w-full flex flex-col lg:flex-row overflow-hidden">
          {/* Close button */}
          <button
            onClick={handleClose}
            disabled={isSpinning}
            className="absolute top-4 right-4 z-20 p-2 bg-white/80 hover:bg-white rounded-full shadow-lg transition-colors disabled:opacity-50"
          >
            <X className="w-5 h-5 text-gray-700" />
          </button>

          {/* Left side - Wheel */}
          <div className="flex-1 p-8 sm:p-12 flex items-center justify-center bg-gradient-to-br from-teal-50 to-yellow-50">
            <div className="relative">
              {/* Modern Pointer on right edge */}
              <div className="absolute -right-8 top-1/2 -translate-y-1/2 z-10">
                <div className="relative">
                  <div className="w-12 h-12 bg-black rounded-full shadow-2xl flex items-center justify-center border-4 border-white">
                    <span className="text-white text-3xl font-black flex items-center justify-center">←</span>
                  </div>
                  {/* Glow effect */}
                  <div className="absolute inset-0 bg-black/20 rounded-full blur-md -z-10" />
                </div>
              </div>

              {/* Wheel */}
              <div className="relative w-72 h-72 sm:w-96 sm:h-96">
                <motion.div
                  animate={{ rotate: rotation }}
                  transition={{ duration: 6, ease: [0.25, 0.1, 0.25, 1] }}
                  className="w-full h-full rounded-full overflow-hidden shadow-2xl border-8 border-white"
                  style={{
                    background: `conic-gradient(
                      ${segments.map((seg, i) => `${seg.color} ${i * 12.5}% ${(i + 1) * 12.5}%`).join(", ")}
                    )`,
                  }}
                >
                  {/* Segment Labels */}
                  {segments.map((segment, index) => {
                    const segmentAngle = 360 / segments.length;
                    const angle = (index * segmentAngle + segmentAngle / 2) * (Math.PI / 180);
                    const radius = 35;
                    const x = 50 + radius * Math.cos(angle);
                    const y = 50 + radius * Math.sin(angle);
                    const rotationDegrees = (angle * 180) / Math.PI;
                    
                    return (
                      <div
                        key={index}
                        className="absolute text-xs sm:text-sm font-bold text-white"
                        style={{
                          left: `${x}%`,
                          top: `${y}%`,
                          transform: `translate(-50%, -50%) rotate(${rotationDegrees}deg)`,
                          textShadow: "0 1px 2px rgba(0,0,0,0.3)"
                        }}
                      >
                        {segment.label}
                      </div>
                    );
                  })}
                </motion.div>

                {/* Center Circle */}
                <div className="absolute inset-0 m-auto w-10 h-10 sm:w-12 sm:h-12 bg-black rounded-full shadow-lg flex items-center justify-center">
                  <div className="w-8 h-8 sm:w-10 sm:h-10 bg-gradient-to-br from-gray-800 to-black rounded-full" />
                </div>
              </div>
            </div>
          </div>

          {/* Right side - Form */}
          <div className="flex-1 p-8 sm:p-12 bg-white flex flex-col justify-center">
            <div className="max-w-md mx-auto w-full space-y-6">
              {/* Result Display */}
              <AnimatePresence>
                {showResult && (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.8 }}
                    className="text-center p-4 bg-gradient-to-r from-teal-100 to-yellow-100 rounded-2xl"
                  >
                    <p className="text-lg font-semibold text-gray-700">
                      {result === "No Luck" ? "Better luck next time!" : `Congratulations! ${result}`}
                    </p>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Header */}
              <div>
                <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-2">Welcome</h2>
                <p className="text-gray-600 text-sm sm:text-base">
                  Spin the wheel to unlock exclusive discounts on your favorite baby products. Enter your details to get started!
                </p>
              </div>

              {/* Form */}
              <div className="space-y-4">
                {/* Phone Input */}
                <div className="relative">
                  <Phone className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input
                    type="tel"
                    placeholder="Phone Number"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value.replace(/\D/g, ""))}
                    className="w-full pl-12 pr-4 py-4 border-2 border-gray-200 rounded-xl focus:border-teal-500 focus:outline-none transition-colors bg-gray-50"
                    disabled={isSpinning}
                  />
                </div>

                {/* Email Input */}
                <div className="relative">
                  <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input
                    type="email"
                    placeholder="Email Address"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full pl-12 pr-4 py-4 border-2 border-gray-200 rounded-xl focus:border-teal-500 focus:outline-none transition-colors bg-gray-50"
                    disabled={isSpinning}
                  />
                </div>

                {/* Terms Checkbox */}
                <label className="flex items-start gap-3 cursor-pointer">
                  <div className="relative mt-1">
                    <input
                      type="checkbox"
                      checked={termsAccepted}
                      onChange={(e) => setTermsAccepted(e.target.checked)}
                      disabled={isSpinning}
                      className="sr-only"
                    />
                    <div
                      className={`w-5 h-5 border-2 rounded flex items-center justify-center transition-colors ${
                        termsAccepted ? "bg-teal-500 border-teal-500" : "border-gray-300"
                      }`}
                    >
                      {termsAccepted && <Check className="w-3 h-3 text-white" />}
                    </div>
                  </div>
                  <span className="text-sm text-gray-600">
                    I accept the{" "}
                    <a href="/terms" className="text-teal-600 hover:underline font-medium">
                      Terms of Service
                    </a>
                    ,{" "}
                    <a href="/privacy" className="text-teal-600 hover:underline font-medium">
                      Privacy Policy
                    </a>
                    , and{" "}
                    <a href="/return-policy" className="text-teal-600 hover:underline font-medium">
                      Return Policy
                    </a>
                  </span>
                </label>

                {/* Spin Button */}
                {!hasSpun && (
                  <button
                    onClick={spinWheel}
                    disabled={!isFormValid || isSpinning}
                    className={`w-full py-4 rounded-xl font-bold text-lg transition-all ${
                      isFormValid && !isSpinning
                        ? "bg-black text-white hover:bg-gray-800 hover:shadow-lg hover:scale-[1.02]"
                        : "bg-gray-300 text-gray-500 cursor-not-allowed"
                    }`}
                  >
                    {isSpinning ? "Spinning..." : "Click here to Spin the Wheel"}
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      </motion.div>
    </AnimatePresence>
  );
}




