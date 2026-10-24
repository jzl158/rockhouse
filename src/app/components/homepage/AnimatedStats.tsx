"use client";

import { useEffect } from 'react';
import { motion, useAnimation } from 'framer-motion';
import { useInView } from 'react-intersection-observer';

interface AnimatedStatProps {
  end: number;
  suffix?: string;
  label: string;
}

const AnimatedStat = ({ end, suffix = '', label }: AnimatedStatProps) => {
  const controls = useAnimation();
  const [ref, inView] = useInView({
    triggerOnce: true,
    threshold: 0.5,
  });

  useEffect(() => {
    if (inView) {
      controls.start({
        opacity: 1,
        y: 0,
        scale: 1,
        transition: {
          duration: 0.5,
          ease: "easeOut"
        }
      });
    }
  }, [controls, inView]);

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 20, scale: 0.9 }}
      animate={controls}
      className="text-center"
    >
      <motion.div
        className="text-5xl font-extrabold text-[#255756]"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5, delay: 0.2 }}
      >
        <motion.span
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 2 }}
        >
          {end}{suffix}
        </motion.span>
      </motion.div>
      <motion.div
        className="mt-2 text-sm uppercase tracking-wide"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5, delay: 0.4 }}
      >
        {label}
      </motion.div>
    </motion.div>
  );
};

export default function AnimatedStats() {
  return (
    <div className="grid gap-8 sm:grid-cols-3">
      <AnimatedStat end={500} suffix="+" label="Projects" />
      <AnimatedStat end={15} suffix="+" label="Years" />
      <AnimatedStat end={98} suffix="%" label="Satisfaction" />
    </div>
  );
}
