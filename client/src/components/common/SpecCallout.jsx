import React from "react";
import { Info } from "lucide-react";

/**
 * SpecCallout: Renders the signature wireframe amber note callout box
 * seen across all 18 screens in the DealFlow360 architecture specification.
 */
export const SpecCallout = ({ children, text, bullets = [], className = "" }) => {
  return (
    <div className={"spec-callout flex items-start gap-3 " + className}>
      <div className="w-4.5 h-4.5 rounded-full flex items-center justify-center shrink-0 mt-0.5 opacity-85">
        <Info className="w-4 h-4" />
      </div>
      <div className="flex-1 space-y-1">
        {text && <p className="font-medium">{text}</p>}
        {children}
        {bullets && bullets.length > 0 && (
          <ul className="mt-1 space-y-0.5 list-none pl-0">
            {bullets.map((b, idx) => (
              <li key={idx} className="flex items-center gap-2 opacity-95">
                <span className="text-[10px] opacity-70 leading-none">•</span>
                <span>{b}</span>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
};

export default SpecCallout;
