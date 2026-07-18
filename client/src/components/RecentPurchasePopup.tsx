import { useState, useEffect, useRef } from 'react';
import { X, CheckCircle } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useProducts } from '@/hooks/useProducts';

// Buyer data arrays (merged from both provided sets)
const buyers = [
  { "name": "Aadhya",      "state": "Tamil Nadu",      "district": "Coimbatore" },
  { "name": "Ananya",      "state": "Tamil Nadu",      "district": "Chennai" },
  { "name": "Nithya",      "state": "Tamil Nadu",      "district": "Madurai" },
  { "name": "Divya",       "state": "Tamil Nadu",      "district": "Salem" },
  { "name": "Priya",       "state": "Tamil Nadu",      "district": "Erode" },
  { "name": "Kavya",       "state": "Tamil Nadu",      "district": "Tiruppur" },
  { "name": "Harini",      "state": "Tamil Nadu",      "district": "Tiruchirappalli" },
  { "name": "Shruthi",     "state": "Tamil Nadu",      "district": "Thanjavur" },
  { "name": "Vaishnavi",   "state": "Tamil Nadu",      "district": "Dindigul" },
  { "name": "Lakshmi",     "state": "Tamil Nadu",      "district": "Kanchipuram" },
  { "name": "Anjali",      "state": "Tamil Nadu",      "district": "Villupuram" },
  { "name": "Shreya",      "state": "Tamil Nadu",      "district": "Vellore" },
  { "name": "Aishwarya",   "state": "Tamil Nadu",      "district": "Tirunelveli" },
  { "name": "Meera",       "state": "Tamil Nadu",      "district": "Thoothukudi" },
  { "name": "Saranya",     "state": "Tamil Nadu",      "district": "Namakkal" },
  { "name": "Yazhini",     "state": "Tamil Nadu",      "district": "Tiruvannamalai" },
  { "name": "Dharani",     "state": "Tamil Nadu",      "district": "Nagapattinam" },
  { "name": "Poornima",    "state": "Tamil Nadu",      "district": "Pudukkottai" },
  { "name": "Pavithra",    "state": "Tamil Nadu",      "district": "Krishnagiri" },
  { "name": "Rithika",     "state": "Tamil Nadu",      "district": "Kanyakumari" },
  { "name": "Athira",      "state": "Kerala",          "district": "Thiruvananthapuram" },
  { "name": "Nandana",     "state": "Kerala",          "district": "Kollam" },
  { "name": "Devika",      "state": "Kerala",          "district": "Pathanamthitta" },
  { "name": "Malavika",    "state": "Kerala",          "district": "Alappuzha" },
  { "name": "Anjana",      "state": "Kerala",          "district": "Kottayam" },
  { "name": "Sreelakshmi", "state": "Kerala",          "district": "Ernakulam" },
  { "name": "Parvathi",    "state": "Kerala",          "district": "Thrissur" },
  { "name": "Dhanya",      "state": "Kerala",          "district": "Palakkad" },
  { "name": "Remya",       "state": "Kerala",          "district": "Malappuram" },
  { "name": "Aswathi",     "state": "Kerala",          "district": "Kozhikode" },
  { "name": "Aiswarya",    "state": "Kerala",          "district": "Kannur" },
  { "name": "Anju",        "state": "Kerala",          "district": "Idukki" },
  { "name": "Saanvi",      "state": "Karnataka",       "district": "Bengaluru Urban" },
  { "name": "Tanvi",       "state": "Karnataka",       "district": "Mysuru" },
  { "name": "Diya",        "state": "Karnataka",       "district": "Mangaluru (Dakshina Kannada)" },
  { "name": "Navya",       "state": "Karnataka",       "district": "Udupi" },
  { "name": "Anvi",        "state": "Karnataka",       "district": "Belagavi" },
  { "name": "Riya",        "state": "Karnataka",       "district": "Hubballi-Dharwad (Dharwad)" },
  { "name": "Ishani",      "state": "Karnataka",       "district": "Ballari" },
  { "name": "Sahana",      "state": "Karnataka",       "district": "Tumakuru" },
  { "name": "Mahika",      "state": "Karnataka",       "district": "Shivamogga" },
  { "name": "Anusha",      "state": "Karnataka",       "district": "Hassan" },
  { "name": "Keerthi",     "state": "Andhra Pradesh",  "district": "Visakhapatnam" },
  { "name": "Sindhu",      "state": "Andhra Pradesh",  "district": "Vijayawada (Krishna)" },
  { "name": "Harika",      "state": "Andhra Pradesh",  "district": "Guntur" },
  { "name": "Navya Sri",   "state": "Andhra Pradesh",  "district": "Nellore" },
  { "name": "Lasya",       "state": "Andhra Pradesh",  "district": "Tirupati (Chittoor)" },
  { "name": "Manasa",      "state": "Andhra Pradesh",  "district": "Kurnool" },
  { "name": "Sravani",     "state": "Andhra Pradesh",  "district": "Anantapur" },
  { "name": "Tejaswini",   "state": "Andhra Pradesh",  "district": "Kadapa (Y.S.R.)" },
  { "name": "Likitha",     "state": "Andhra Pradesh",  "district": "Rajahmundry (East Godavari)" },
  { "name": "Bhavya",      "state": "Andhra Pradesh",  "district": "Srikakulam" },
  { "name": "Shravya",     "state": "Telangana",       "district": "Hyderabad" },
  { "name": "Sanjana",     "state": "Telangana",       "district": "Rangareddy" },
  { "name": "Niharika",    "state": "Telangana",       "district": "Warangal" },
  { "name": "Vaishnavi",   "state": "Telangana",       "district": "Khammam" },
  { "name": "Greeshma",    "state": "Telangana",       "district": "Nizamabad" },
  { "name": "Mounika",     "state": "Telangana",       "district": "Karimnagar" },
  { "name": "Chandana",    "state": "Telangana",       "district": "Mahbubnagar" },
  { "name": "Yashaswi",    "state": "Telangana",       "district": "Medchal–Malkajgiri" },
  { "name": "Alekhya",     "state": "Telangana",       "district": "Sangareddy" },
  { "name": "Sruthi",      "state": "Telangana",       "district": "Adilabad" },
  { "name": "Abinaya",     "state": "Tamil Nadu", "district": "Ariyalur" },
  { "name": "Thiya",       "state": "Tamil Nadu", "district": "Chengalpattu" },
  { "name": "Sara",        "state": "Tamil Nadu", "district": "Chennai" },
  { "name": "Thanvi",      "state": "Tamil Nadu", "district": "Coimbatore" },
  { "name": "Aadhira",     "state": "Tamil Nadu", "district": "Cuddalore" },
  { "name": "Thara",       "state": "Tamil Nadu", "district": "Dharmapuri" },
  { "name": "Mahalakshmi", "state": "Tamil Nadu", "district": "Dindigul" },
  { "name": "Iravati",     "state": "Tamil Nadu", "district": "Erode" },
  { "name": "Kirthika",    "state": "Tamil Nadu", "district": "Kallakurichi" },
  { "name": "Sowmiya",     "state": "Tamil Nadu", "district": "Kancheepuram" },
  { "name": "Nila",        "state": "Tamil Nadu", "district": "Kanniyakumari" },
  { "name": "Yamuna",      "state": "Tamil Nadu", "district": "Karur" },
  { "name": "Monika",      "state": "Tamil Nadu", "district": "Krishnagiri" },
  { "name": "Anagha",      "state": "Tamil Nadu", "district": "Madurai" },
  { "name": "Mullai",      "state": "Tamil Nadu", "district": "Mayiladuthurai" },
  { "name": "Aparna",      "state": "Tamil Nadu", "district": "Nagapattinam" },
  { "name": "Kavyashri",   "state": "Tamil Nadu", "district": "Namakkal" },
  { "name": "Iyshwarya",   "state": "Tamil Nadu", "district": "Perambalur" },
  { "name": "Harshitha",   "state": "Tamil Nadu", "district": "Pudukkottai" },
  { "name": "Sahana",      "state": "Tamil Nadu", "district": "Ramanathapuram" },
  { "name": "Samyuktha",   "state": "Tamil Nadu", "district": "Ranipet" },
  { "name": "Hasini",      "state": "Tamil Nadu", "district": "Salem" },
  { "name": "Srimathi",    "state": "Tamil Nadu", "district": "Sivagangai" },
  { "name": "Laavanya",    "state": "Tamil Nadu", "district": "Tenkasi" },
  { "name": "Nandhitha",   "state": "Tamil Nadu", "district": "Thanjavur" },
  { "name": "Ishwarya",    "state": "Tamil Nadu", "district": "Theni" },
  { "name": "Varsha",      "state": "Tamil Nadu", "district": "Thoothukudi" },
  { "name": "Kripa",       "state": "Tamil Nadu", "district": "Tiruchirappalli" },
  { "name": "Harshika",    "state": "Tamil Nadu", "district": "Tirunelveli" },
  { "name": "Santhiya",    "state": "Tamil Nadu", "district": "Tirupathur" },
  { "name": "Nivedha",     "state": "Tamil Nadu", "district": "Tiruppur" },
  { "name": "Keerthika",   "state": "Tamil Nadu", "district": "Tiruvallur" },
  { "name": "Sindhura",    "state": "Tamil Nadu", "district": "Tiruvannamalai" },
  { "name": "Haripriya",   "state": "Tamil Nadu", "district": "Tiruvarur" },
  { "name": "Sanjana",     "state": "Tamil Nadu", "district": "Vellore" },
  { "name": "Meenakshi",   "state": "Tamil Nadu", "district": "Viluppuram" },
  { "name": "Swetha",      "state": "Tamil Nadu", "district": "Virudhunagar" }
];

// Cycle configuration
const VISIBLE_DURATION_MS = 5000;
const PROGRESS_TICK_MS = 50;
const INITIAL_DELAY_MS = 20000;
const MIN_CYCLE_DELAY_MS = 5000;
const MAX_CYCLE_DELAY_MS = 40000;

type CurrentPurchase = {
  id: number;
  buyer: typeof buyers[number];
  product: any;
  timeAgo: number;
};

const getRandomItem = <T,>(arr: T[]): T =>
  arr[Math.floor(Math.random() * arr.length)];

const getRandomDelay = (): number =>
  Math.floor(Math.random() * (MAX_CYCLE_DELAY_MS - MIN_CYCLE_DELAY_MS + 1)) +
  MIN_CYCLE_DELAY_MS;

export default function RecentPurchasePopup() {
  const { data: products } = useProducts();
  const [currentPurchase, setCurrentPurchase] = useState<CurrentPurchase | null>(null);
  const [progress, setProgress] = useState(100);
  const [isPermanentlyDisabled, setIsPermanentlyDisabled] = useState(() => {
    // Read the flag synchronously on the first render to avoid a flash of popup
    if (typeof window !== 'undefined') {
      return localStorage.getItem('recentPurchasePopupDisabled') === 'true';
    }
    return false;
  });

  // One ref per active timer — simpler and more reliable than a Set<>.
  const cycleTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const progressIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const cycleIdRef = useRef(0);

  const clearCycleTimers = () => {
    if (cycleTimeoutRef.current !== null) {
      clearTimeout(cycleTimeoutRef.current);
      cycleTimeoutRef.current = null;
    }
    if (progressIntervalRef.current !== null) {
      clearInterval(progressIntervalRef.current);
      progressIntervalRef.current = null;
    }
  };

  // Keep products in a ref so the cycle effect doesn't re-run on every render.
  // Without this, the cycle is torn down and rebuilt every time `products` resolves,
  // which kills the initial 20s timer and the popup never gets a chance to show.
  const productsRef = useRef<typeof products>([]);
  useEffect(() => {
    productsRef.current = products || [];
  }, [products]);

  // Master cycle. Runs ONCE on mount (after the localStorage flag check),
  // then self-schedules via setTimeout. No deps on `products`.
  useEffect(() => {
    if (isPermanentlyDisabled) return;

    let isActive = true;
    let cancelled = false;

    const showOnce = () => {
      if (cancelled || !isActive) return;
      const prods = productsRef.current;
      if (!prods || prods.length === 0) {
        // Products not loaded yet — try again in a second
        cycleTimeoutRef.current = setTimeout(showOnce, 1000);
        return;
      }

      cycleIdRef.current += 1;
      const randomProduct = getRandomItem(prods);
      const randomBuyer = getRandomItem(buyers);
      const randomTime = Math.floor(Math.random() * 100) + 1;

      setCurrentPurchase({
        id: cycleIdRef.current,
        buyer: randomBuyer,
        product: randomProduct,
        timeAgo: randomTime,
      });
      setProgress(100);

      // Animate the progress bar from 100 → 0 over 3 seconds
      const totalTicks = Math.ceil(VISIBLE_DURATION_MS / PROGRESS_TICK_MS);
      const tickAmount = 100 / totalTicks;
      progressIntervalRef.current = setInterval(() => {
        if (cancelled || !isActive) {
          if (progressIntervalRef.current !== null) {
            clearInterval(progressIntervalRef.current);
            progressIntervalRef.current = null;
          }
          return;
        }
        setProgress((prev) => Math.max(0, prev - tickAmount));
      }, PROGRESS_TICK_MS);

      // Hide after exactly 3 seconds
      cycleTimeoutRef.current = setTimeout(() => {
        if (cancelled || !isActive) return;
        clearCycleTimers();
        setCurrentPurchase(null);
        setProgress(0);

        if (cancelled || !isActive) return;
        // Schedule the next popup after a random 5-40s pause
        cycleTimeoutRef.current = setTimeout(showOnce, getRandomDelay());
      }, VISIBLE_DURATION_MS);
    };

    // First popup: 20s after the page loads
    cycleTimeoutRef.current = setTimeout(showOnce, INITIAL_DELAY_MS);

    return () => {
      cancelled = true;
      isActive = false;
      clearCycleTimers();
      setCurrentPurchase(null);
      setProgress(0);
    };
  }, [isPermanentlyDisabled]);

  const handleClose = () => {
    clearCycleTimers();
    setCurrentPurchase(null);
    setProgress(0);

    if (isPermanentlyDisabled) return;
    const prods = productsRef.current;
    if (!prods || prods.length === 0) return;

    // After a short random pause, manually show one more popup
    cycleTimeoutRef.current = setTimeout(() => {
      if (isPermanentlyDisabled) return;
      const prods2 = productsRef.current;
      if (!prods2 || prods2.length === 0) return;
      cycleIdRef.current += 1;
      const randomProduct = getRandomItem(prods2);
      const randomBuyer = getRandomItem(buyers);
      const randomTime = Math.floor(Math.random() * 100) + 1;
      setCurrentPurchase({
        id: cycleIdRef.current,
        buyer: randomBuyer,
        product: randomProduct,
        timeAgo: randomTime,
      });
      setProgress(100);

      const totalTicks = Math.ceil(VISIBLE_DURATION_MS / PROGRESS_TICK_MS);
      const tickAmount = 100 / totalTicks;
      progressIntervalRef.current = setInterval(() => {
        setProgress((prev) => Math.max(0, prev - tickAmount));
      }, PROGRESS_TICK_MS);
      cycleTimeoutRef.current = setTimeout(() => {
        clearCycleTimers();
        setCurrentPurchase(null);
        setProgress(0);
      }, VISIBLE_DURATION_MS);
    }, getRandomDelay());
  };

  const handlePermanentDisable = () => {
    setIsPermanentlyDisabled(true);
    clearCycleTimers();
    setCurrentPurchase(null);
    setProgress(0);
    localStorage.setItem('recentPurchasePopupDisabled', 'true');
  };

  const getCloudinaryImageUrl = (url: string, transformation: string) => {
    if (!url || typeof url !== 'string') return url;
    if (!url.includes('res.cloudinary.com') || !url.includes('/image/upload/')) {
      return url;
    }
    return url.replace('/image/upload/', `/image/upload/${transformation}/`);
  };

  if (isPermanentlyDisabled || !currentPurchase) {
    return null;
  }

  return (
    <AnimatePresence>
      <motion.div
        key={currentPurchase.id}
        initial={{ opacity: 0, x: -100, y: 100 }}
        animate={{ opacity: 1, x: 0, y: 0 }}
        exit={{ opacity: 0, x: -100, y: 100 }}
        transition={{ duration: 0.4, ease: 'easeOut' }}
        className="fixed bottom-4 left-4 z-[100] max-w-sm w-[calc(100vw-2rem)] sm:w-auto"
        role="dialog"
        aria-live="polite"
        aria-label="Recent purchase notification"
      >
        <div className="bg-white rounded-2xl shadow-2xl border-2 border-[#B4C49A] overflow-hidden">
          {/* Close button */}
          <button
            onClick={handleClose}
            className="absolute -top-3 -right-3 p-2 rounded-full bg-white border border-gray-200 shadow-md hover:bg-gray-50 transition-colors z-10"
            aria-label="Close notification"
          >
            <X className="w-3.5 h-3.5 text-gray-600" />
          </button>

          <div className="flex items-start p-4 pr-10 gap-4">
            {/* Product image */}
            <div className="flex-shrink-0 w-20 h-20 rounded-xl overflow-hidden bg-gray-50 border border-gray-200">
              <img
                src={getCloudinaryImageUrl(
                  currentPurchase.product.image,
                  'f_auto,q_100,dpr_auto,w_200,h_200'
                )}
                alt={currentPurchase.product.name}
                className="w-full h-full object-cover"
                draggable={false}
                onError={(e) => {
                  (e.target as HTMLImageElement).style.visibility = 'hidden';
                }}
              />
            </div>

            {/* Content */}
            <div className="flex-1 min-w-0 pt-1">
              <p className="text-sm font-semibold text-gray-900 mb-1">
                {currentPurchase.buyer.name} ({currentPurchase.buyer.district})
              </p>
              <p className="text-xs text-gray-600 mb-2 line-clamp-2">
                purchased{' '}
                <span className="font-medium text-gray-900">
                  {currentPurchase.product.name}
                </span>
              </p>

              {/* Time ago */}
              <p className="text-xs text-gray-500 mb-2">
                {currentPurchase.timeAgo}{' '}
                {currentPurchase.timeAgo === 1 ? 'minute' : 'minutes'} ago
              </p>

              {/* Verify badge */}
              <div className="flex items-center gap-1.5 text-[#B4C49A]">
                <CheckCircle className="w-3.5 h-3.5" strokeWidth={2.5} />
                <span className="text-xs font-semibold">Verify</span>
              </div>
            </div>
          </div>

          {/* Progress bar */}
          <div className="h-1 bg-gray-200 w-full">
            <div
              className="h-full bg-[#B4C49A] transition-all duration-75 ease-linear"
              style={{ width: `${Math.max(0, progress)}%` }}
            />
          </div>

          {/* Permanent disable option */}
          <button
            onClick={handlePermanentDisable}
            className="w-full py-2 px-4 text-xs text-gray-400 hover:text-gray-600 hover:bg-gray-50 transition-colors border-t border-gray-100"
          >
            Don&apos;t show again
          </button>
        </div>
      </motion.div>
    </AnimatePresence>
  );
}
