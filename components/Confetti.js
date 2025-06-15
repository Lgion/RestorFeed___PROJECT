"use client";
import { useEffect } from "react";

export default function Confetti({ trigger }) {
  useEffect(() => {
    if (!trigger) return;
    // Dynamically import canvas-confetti only when needed
    import("canvas-confetti").then((confetti) => {
      confetti.default({
        particleCount: 150,
        spread: 70,
        origin: { y: 0.7 },
        zIndex: 3000,
      });
    });
  }, [trigger]);
  return null;
}
