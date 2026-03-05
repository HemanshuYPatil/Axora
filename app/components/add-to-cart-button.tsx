"use client";

import { SignInButton, useAuth } from "@clerk/nextjs";
import { useEffect, useRef, useState } from "react";

type AddToCartButtonProps = {
  className: string;
  productName: string;
  onAdded?: () => void;
};

export function AddToCartButton({
  className,
  productName,
  onAdded,
}: AddToCartButtonProps) {
  const { isLoaded, isSignedIn } = useAuth();
  const [added, setAdded] = useState(false);
  const timeoutRef = useRef<number | null>(null);

  useEffect(() => {
    return () => {
      if (timeoutRef.current !== null) {
        window.clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  const handleAddToCart = () => {
    onAdded?.();
    setAdded(true);

    if (timeoutRef.current !== null) {
      window.clearTimeout(timeoutRef.current);
    }

    timeoutRef.current = window.setTimeout(() => {
      setAdded(false);
    }, 1400);
  };

  if (!isLoaded) {
    return (
      <button
        type="button"
        className={className}
        disabled
        aria-label={`Loading sign-in state for ${productName}`}
      >
        Add to Cart
      </button>
    );
  }

  if (isSignedIn) {
    return (
      <button
        type="button"
        className={className}
        onClick={handleAddToCart}
        aria-label={`Add ${productName} to cart`}
      >
        {added ? "Added" : "Add to Cart"}
      </button>
    );
  }

  return (
    <SignInButton mode="modal">
      <button
        type="button"
        className={className}
        aria-label={`Sign in to add ${productName} to cart`}
      >
        Add to Cart
      </button>
    </SignInButton>
  );
}
