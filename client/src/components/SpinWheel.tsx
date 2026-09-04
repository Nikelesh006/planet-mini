import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Phone, Mail, Check, Loader2 } from "lucide-react";
import { apiFetch } from "@/lib/api";
import { getCookieOrStorage, setCookieAndStorage } from "@/lib/cookies";

interface SpinWheelProps {
  onClose: () => void;
  onDiscountWon: (discount: string) => void;
}

interface PrizeItem {
  _id?: string;
  label: string;
  color: string;
  discountPercentage?: number | null;
  discountType?: string;
  discountValue?: number | null;
  isSpinAgain?: boolean;
  isNoLuck?: boolean;
  position?: number;
}

export default function SpinWheel({ onClose, onDiscountWon }: SpinWheelProps) {
  const [isSpinning, setIsSpinning] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [rotation, setRotation] = useState(0);
  const [showResult, setShowResult] = useState(false);
  const [result, setResult] = useState("");
  const [isSpinAgain, setIsSpinAgain] = useState(false);
  const [hasSpun, setHasSpun] = useState(false);
  const [wonDiscount, setWonDiscount] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [userId, setUserId] = useState<string | null>(null);
  const [prizes, setPrizes] = useState<PrizeItem[]>([]);

  // Form state - initialize from cookies or localStorage (supports guest profiles)
  const [phone, setPhone] = useState(() => getCookieOrStorage("spin_wheel_phone") || "");
  const [email, setEmail] = useState(() => getCookieOrStorage("spin_wheel_email") || "");
  const [termsAccepted, setTermsAccepted] = useState(false);

  // Validation
  const isFormValid = phone.trim().length >= 10 && email.trim().includes("@") && termsAccepted;

  // Lock body scroll when modal is open and load existing state
  useEffect(() => {
    document.body.style.overflow = "hidden";

    // Check if guest user already spun in this session or previously
    const savedHasSpun = getCookieOrStorage("spin_wheel_has_spun") === "true";
    const savedDiscount = getCookieOrStorage("spin_wheel_won_discount");
    const savedUserId = getCookieOrStorage("spin_wheel_user_id");

    if (savedUserId) {
      setUserId(savedUserId);
    }

    if (savedHasSpun) {
      setHasSpun(true);
      if (savedDiscount) {
        setWonDiscount(savedDiscount);
        setResult(savedDiscount);
        setShowResult(true);
      }
    }

    // Fetch active prizes from database
    let isMounted = true;
    const fetchPrizes = async () => {
      try {
        const response = await apiFetch("/api/spin-wheel/prizes");
        if (response.ok) {
          const data = await response.json();
          if (data.success && Array.isArray(data.data) && data.data.length > 0 && isMounted) {
            setPrizes(data.data);
          }
        }
      } catch (err) {
        console.warn("Could not fetch spin-wheel prizes from server, using default segments:", err);
      }
    };

    fetchPrizes();

    return () => {
      document.body.style.overflow = "";
      isMounted = false;
    };
  }, []);

  // Color palette
  const colors = {
    softGreen: "#7FB069",
    lightGreen: "#4DB6AC",
    darkGreen: "#2D7A7A",
    warmYellow: "#F4D03F"
  };

  // Wheel segments - 8 slices matching database positions 0 to 7
  const defaultSegments: PrizeItem[] = [
    { label: "Get 10% Off", color: colors.lightGreen, position: 0, discountPercentage: 10, discountType: "percentage", discountValue: 10, isSpinAgain: false, isNoLuck: false },
    { label: "Get 5% Off", color: colors.darkGreen, position: 1, discountPercentage: 5, discountType: "percentage", discountValue: 5, isSpinAgain: false, isNoLuck: false },
    { label: "Get 15% Off", color: colors.warmYellow, position: 2, discountPercentage: 15, discountType: "percentage", discountValue: 15, isSpinAgain: false, isNoLuck: false },
    { label: "No Luck", color: colors.softGreen, position: 3, discountPercentage: null, discountType: "none", discountValue: null, isSpinAgain: false, isNoLuck: true },
    { label: "Get 10% Off", color: colors.lightGreen, position: 4, discountPercentage: 10, discountType: "percentage", discountValue: 10, isSpinAgain: false, isNoLuck: false },
    { label: "Get 5% Off", color: colors.darkGreen, position: 5, discountPercentage: 5, discountType: "percentage", discountValue: 5, isSpinAgain: false, isNoLuck: false },
    { label: "Spin Again", color: colors.warmYellow, position: 6, discountPercentage: null, discountType: "none", discountValue: null, isSpinAgain: true, isNoLuck: false },
    { label: "No Luck", color: colors.softGreen, position: 7, discountPercentage: null, discountType: "none", discountValue: null, isSpinAgain: false, isNoLuck: true },
  ];

  const segments: PrizeItem[] = prizes.length === 8
    ? [...prizes].sort((a, b) => (a.position ?? 0) - (b.position ?? 0))
    : defaultSegments;

  // Execute a single spin round (used for normal spin and spin-again)
  const executeSpinRound = async (activeUserId: string, winningIndex: number) => {
    try {
      const segmentAngle = 360 / segments.length;
      const targetAngle = 360 - (winningIndex * segmentAngle) - (segmentAngle / 2);
      const extraRotations = 6 * 360; // 6 full rotations for smooth deceleration
      const newRotation = rotation + extraRotations + targetAngle - (rotation % 360);

      const winningPrize = segments[winningIndex] || defaultSegments[winningIndex];
      const prizeId = winningPrize._id || (prizes.find(p => p.position === winningIndex)?._id);

      // Record spin result in MongoDB backend
      const spinRes = await apiFetch("/api/spin-wheel/spin", {
        method: "POST",
        body: JSON.stringify({
          userId: activeUserId,
          prizeId: prizeId || undefined,
          prizeLabel: winningPrize.label,
          prizeColor: winningPrize.color,
          discountPercentage: winningPrize.discountPercentage,
          discountType: winningPrize.discountType,
          discountValue: winningPrize.discountValue,
          isSpinAgain: Boolean(winningPrize.isSpinAgain),
          isNoLuck: Boolean(winningPrize.isNoLuck),
          wheelPosition: winningIndex,
          rotationAngle: newRotation,
          spinDuration: 6000,
          phone: phone.trim(),
          email: email.trim().toLowerCase()
        })
      });

      const spinData = await spinRes.json();
      if (!spinRes.ok || !spinData.success) {
        setErrorMessage(spinData.error || "Failed to record spin. Please try again.");
        setIsLoading(false);
        setIsSpinning(false);
        return;
      }

      // Start rotation animation
      setIsLoading(false);
      setIsSpinning(true);
      setShowResult(false);
      setRotation(newRotation);

      // Handle result after 6s animation completes
      setTimeout(() => {
        const resultLabel = winningPrize.label;

        if (winningPrize.isSpinAgain) {
          // Spin again automatically
          setIsSpinAgain(true);
          setTimeout(() => {
            setIsSpinAgain(false);
            // Non-spin-again outcome for second spin
            const secondRoundOptions = [0, 1, 3, 4, 5, 7];
            const nextWinningIndex = secondRoundOptions[Math.floor(Math.random() * secondRoundOptions.length)];
            executeSpinRound(activeUserId, nextWinningIndex);
          }, 1000);
        } else {
          setIsSpinning(false);
          setResult(resultLabel);
          setShowResult(true);
          setHasSpun(true);

          // Save guest status in cookies & localStorage
          setCookieAndStorage("spin_wheel_has_spun", "true", 30);
          setCookieAndStorage("spinWheelSeen", "true", 30);
          if (spinData.data?._id) {
            setCookieAndStorage("spin_wheel_result_id", spinData.data._id, 30);
          }

          // Handle discount win
          if (resultLabel.includes("5%") || resultLabel.includes("10%")) {
            setWonDiscount(resultLabel);
            setCookieAndStorage("spin_wheel_won_discount", resultLabel, 30);
            onDiscountWon(resultLabel);
          }
        }
      }, 6000);
    } catch (err) {
      console.error("Error executing spin:", err);
      setErrorMessage("Something went wrong during the spin. Please try again.");
      setIsLoading(false);
      setIsSpinning(false);
    }
  };

  const spinWheel = async () => {
    if (!isFormValid || isSpinning || hasSpun || isLoading) return;

    setErrorMessage(null);
    setIsLoading(true);

    try {
      const cleanPhone = phone.trim();
      const cleanEmail = email.trim().toLowerCase();

      // Store in cookies & localStorage immediately for guest profile continuity
      setCookieAndStorage("spin_wheel_phone", cleanPhone, 30);
      setCookieAndStorage("spin_wheel_email", cleanEmail, 30);

      // 1. Create or fetch user in MongoDB
      const userRes = await apiFetch("/api/spin-wheel/user", {
        method: "POST",
        body: JSON.stringify({
          phone: cleanPhone,
          email: cleanEmail,
          termsAccepted: true
        })
      });

      const userData = await userRes.json();
      if (!userRes.ok || !userData.success) {
        setErrorMessage(userData.error || "Unable to register your details. Please check your phone and email.");
        setIsLoading(false);
        return;
      }

      const registeredUser = userData.data;
      setUserId(registeredUser._id);
      setCookieAndStorage("spin_wheel_user_id", registeredUser._id, 30);

      // Check if user has already spun the wheel
      if (registeredUser.hasSpun) {
        setHasSpun(true);
        setCookieAndStorage("spin_wheel_has_spun", "true", 30);
        setErrorMessage("You have already spun the wheel with this phone number or email.");
        setIsLoading(false);
        return;
      }

      // 2. Rigged logic: never land on 15% Off (index 2)
      // Possible outcomes: segments at indices 0, 1, 3, 4, 5, 6, 7
      const possibleIndices = [0, 1, 3, 4, 5, 6, 7];
      const winningIndex = possibleIndices[Math.floor(Math.random() * possibleIndices.length)];

      await executeSpinRound(registeredUser._id, winningIndex);
    } catch (err) {
      console.error("Spin initialization error:", err);
      setErrorMessage("Failed to connect to the server. Please check your internet connection.");
      setIsLoading(false);
    }
  };

  const handleClose = () => {
    if (!isSpinning && !isLoading) {
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
        className="fixed inset-0 z-[9999] flex items-center justify-center p-2 sm:p-8"
      >
        <div className="relative bg-white rounded-2xl sm:rounded-3xl shadow-2xl max-w-5xl w-full max-h-[calc(100dvh-1rem)] sm:max-h-none flex flex-col lg:flex-row overflow-y-auto lg:overflow-hidden">
          {/* Close button */}
          <button
            onClick={handleClose}
            disabled={isSpinning || isLoading}
            className="absolute top-3 right-3 sm:top-4 sm:right-4 z-20 p-2 bg-white/80 hover:bg-white rounded-full shadow-lg transition-colors disabled:opacity-50"
            title="Close"
          >
            <X className="w-5 h-5 text-gray-700" />
          </button>

          {/* Left side - Wheel */}
          <div className="flex-1 p-4 pt-10 sm:p-12 flex items-center justify-center bg-gradient-to-br from-teal-50 to-yellow-50">
            <div className="relative">
              {/* Modern Pointer on right edge */}
              <div className="absolute -right-5 sm:-right-8 top-1/2 -translate-y-1/2 z-10">
                <div className="relative">
                  <div className="w-9 h-9 sm:w-12 sm:h-12 bg-black rounded-full shadow-2xl flex items-center justify-center border-[3px] sm:border-4 border-white">
                    <span className="text-white text-2xl sm:text-3xl font-black flex items-center justify-center">←</span>
                  </div>
                  {/* Glow effect */}
                  <div className="absolute inset-0 bg-black/20 rounded-full blur-md -z-10" />
                </div>
              </div>

              {/* Wheel */}
              <div className="relative w-56 h-56 sm:w-96 sm:h-96">
                <motion.div
                  animate={{ rotate: rotation }}
                  transition={{ duration: 6, ease: [0.25, 0.1, 0.25, 1] }}
                  className="w-full h-full rounded-full overflow-hidden shadow-2xl border-4 sm:border-8 border-white"
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
                        className="absolute text-[10px] sm:text-sm font-bold text-white"
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
                <div className="absolute inset-0 m-auto w-9 h-9 sm:w-12 sm:h-12 bg-black rounded-full shadow-lg flex items-center justify-center">
                  <div className="w-7 h-7 sm:w-10 sm:h-10 bg-gradient-to-br from-gray-800 to-black rounded-full" />
                </div>
              </div>
            </div>
          </div>

          {/* Right side - Form */}
          <div className="flex-1 p-4 sm:p-12 bg-white flex flex-col justify-center">
            <div className="max-w-md mx-auto w-full space-y-4 sm:space-y-6">
              {/* Result Display */}
              <AnimatePresence>
                {showResult && (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.8 }}
                    className="text-center p-4 bg-gradient-to-r from-teal-100 to-yellow-100 rounded-2xl"
                  >
                    <p className="text-sm sm:text-lg font-semibold text-gray-700">
                      {result === "No Luck" ? "Better luck next time!" : `Congratulations! ${result}`}
                    </p>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Header */}
              <div>
                <h2 className="text-2xl sm:text-4xl font-bold text-gray-900 mb-1 sm:mb-2">Welcome</h2>
                <p className="text-gray-600 text-xs sm:text-base">
                  Spin the wheel to unlock exclusive discounts on your favorite baby products. Enter your details to get started!
                </p>
              </div>

              {/* Error Message */}
              {errorMessage && (
                <div className="p-3 bg-red-50 border border-red-200 rounded-xl text-red-600 text-xs sm:text-sm">
                  {errorMessage}
                </div>
              )}

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
                    className="w-full pl-11 sm:pl-12 pr-4 py-3 sm:py-4 border-2 border-gray-200 rounded-xl focus:border-teal-500 focus:outline-none transition-colors bg-gray-50 text-sm sm:text-base"
                    disabled={isSpinning || isLoading || hasSpun}
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
                    className="w-full pl-11 sm:pl-12 pr-4 py-3 sm:py-4 border-2 border-gray-200 rounded-xl focus:border-teal-500 focus:outline-none transition-colors bg-gray-50 text-sm sm:text-base"
                    disabled={isSpinning || isLoading || hasSpun}
                  />
                </div>

                {/* Terms Checkbox */}
                <label className="flex items-start gap-3 cursor-pointer">
                  <div className="relative mt-1">
                    <input
                      type="checkbox"
                      checked={termsAccepted}
                      onChange={(e) => setTermsAccepted(e.target.checked)}
                      disabled={isSpinning || isLoading || hasSpun}
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
                  <span className="text-xs sm:text-sm text-gray-600">
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
                {!hasSpun ? (
                  <button
                    onClick={spinWheel}
                    disabled={!isFormValid || isSpinning || isLoading}
                    className={`w-full py-3 sm:py-4 rounded-xl font-bold text-base sm:text-lg transition-all flex items-center justify-center gap-2 ${
                      isFormValid && !isSpinning && !isLoading
                        ? "bg-black text-white hover:bg-gray-800 hover:shadow-lg hover:scale-[1.02]"
                        : "bg-gray-300 text-gray-500 cursor-not-allowed"
                    }`}
                  >
                    {isLoading ? (
                      <>
                        <Loader2 className="w-5 h-5 animate-spin" />
                        <span>Verifying...</span>
                      </>
                    ) : isSpinning ? (
                      isSpinAgain ? "Spinning Again..." : "Spinning..."
                    ) : (
                      "Click here to Spin the Wheel"
                    )}
                  </button>
                ) : (
                  <div className="text-center p-3 sm:p-4 bg-gray-100 rounded-xl text-gray-700 font-medium text-sm sm:text-base border border-gray-200">
                    You have already spun the wheel. Thank you!
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </motion.div>
    </AnimatePresence>
  );
}
