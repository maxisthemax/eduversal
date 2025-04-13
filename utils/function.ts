import { useState, useRef, useEffect, useCallback } from "react";

export function useHover<T extends HTMLElement>(): [
  React.RefObject<T>,
  boolean
] {
  const [isHovered, setIsHovered] = useState(false);
  const ref = useRef<T>(null);

  const handleMouseOver = useCallback(() => setIsHovered(true), []);
  const handleMouseOut = useCallback(() => setIsHovered(false), []);

  useEffect(() => {
    const node = ref.current;
    if (node) {
      node.addEventListener("mouseover", handleMouseOver);
      node.addEventListener("mouseout", handleMouseOut);

      return () => {
        node.removeEventListener("mouseover", handleMouseOver);
        node.removeEventListener("mouseout", handleMouseOut);
      };
    }
  }, [handleMouseOver, handleMouseOut]);

  return [ref, isHovered];
}
