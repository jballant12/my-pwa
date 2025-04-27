import * as React from "react";

export const Textarea = React.forwardRef<HTMLTextAreaElement, React.TextareaHTMLAttributes<HTMLTextAreaElement>>(
  (props, ref) => (
    <textarea
      ref={ref}
      className="border rounded-md px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 w-full"
      {...props}
    />
  )
);

Textarea.displayName = "Textarea";
