import * as React from "react";

export const Input = React.forwardRef<HTMLInputElement, React.InputHTMLAttributes<HTMLInputElement>>(
  (props, ref) => (
    <input
      ref={ref}
      className="border rounded-md px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
      {...props}
    />
  )
);

Input.displayName = "Input";
