import * as React from "react";

export const Input = React.forwardRef<HTMLInputElement, React.InputHTMLAttributes<HTMLInputElement>>(
  (props, ref) => (
    <input
      ref={ref}
      className="border rounded-md px-4 py-2 focus:outline-none focus:ring-2 focus:ring-white/50 bg-white/5 text-white placeholder:text-gray-400 border-white/20"
      {...props}
    />
  )
);

Input.displayName = "Input";