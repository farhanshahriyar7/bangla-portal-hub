import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { useNavigate } from "react-router-dom";

export default function NotFound() {
  const navigate = useNavigate();

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-gradient-to-b from-gray-50 to-gray-100 px-4">
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="w-full max-w-md"
      >
        <Card className="shadow-lg border border-gray-200 rounded-2xl backdrop-blur-sm">
          <CardContent className="flex flex-col items-center text-center py-10">
            {/* 404 Title */}
            <h1 className="text-7xl font-extrabold text-gray-800 mb-3">404 !</h1>

            {/* English Title */}
            <p className="text-lg font-medium text-gray-700 mb-1">
              Oops! Page not found
            </p>

            {/* Bangla Title */}
            <p className="text-base text-gray-600 mb-3">
              উফ! আপনি যে পৃষ্ঠাটি খুঁজছেন সেটি পাওয়া যায়নি।
            </p>

            {/* Description */}
            <p className="text-sm text-gray-500 mb-8 max-w-xs">
              It might have been removed, had its name changed, or is temporarily
              unavailable. <br />
              এটি হয়তো মুছে ফেলা হয়েছে অথবা নাম পরিবর্তন করা হয়েছে।
            </p>

            {/* Button */}
            <Button
              variant="default"
              onClick={() => navigate("/")}
              className="rounded-xl text-base"
            >
              ⬅ Back to Home / হোমপেজে ফিরুন
            </Button>
          </CardContent>
        </Card>

        {/* Footer Text */}
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 0.6 }}
          transition={{ delay: 0.8 }}
          className="text-center mt-6 text-sm text-gray-500"
        >
          © {new Date().getFullYear()} Farhan Shahriyar
        </motion.p>
      </motion.div>
    </div>
  );
}
