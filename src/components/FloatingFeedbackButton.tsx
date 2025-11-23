import { MessageCircle } from "lucide-react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";

const FloatingFeedbackButton = () => {
  return (
    <motion.div
      initial={{ scale: 0, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      transition={{ delay: 1, type: "spring", stiffness: 200 }}
      className="fixed bottom-20 sm:bottom-6 left-4 sm:left-6 z-40"
    >
      <Link to="/contact">
        <Button
          size="lg"
          className="rounded-full h-14 w-14 sm:h-16 sm:w-16 shadow-glow-strong group hover:scale-110 transition-transform"
        >
          <MessageCircle className="h-6 w-6 sm:h-7 sm:w-7 group-hover:rotate-12 transition-transform" />
        </Button>
      </Link>
    </motion.div>
  );
};

export default FloatingFeedbackButton;
