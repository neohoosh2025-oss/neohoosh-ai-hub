import { useScroll, useTransform, MotionValue } from "framer-motion";
import { RefObject } from "react";

interface UseParallaxOptions {
  offset?: number;
  clamp?: boolean;
}

export const useParallax = (
  ref: RefObject<HTMLElement>,
  options: UseParallaxOptions = {}
): MotionValue<number> => {
  const { offset = 50, clamp = true } = options;
  
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start end", "end start"],
  });

  const y = useTransform(
    scrollYProgress,
    [0, 1],
    [offset, -offset],
    { clamp }
  );

  return y;
};

export const useScrollOpacity = (
  ref: RefObject<HTMLElement>
): MotionValue<number> => {
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start end", "end start"],
  });

  return useTransform(
    scrollYProgress,
    [0, 0.2, 0.8, 1],
    [0, 1, 1, 0]
  );
};

export const useScrollScale = (
  ref: RefObject<HTMLElement>
): MotionValue<number> => {
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start end", "end start"],
  });

  return useTransform(
    scrollYProgress,
    [0, 0.5, 1],
    [0.8, 1, 0.8]
  );
};
