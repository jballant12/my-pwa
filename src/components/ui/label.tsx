import * as React from "react";
import * as LabelPrimitive from "@radix-ui/react-label";

export const Label = React.forwardRef<HTMLLabelElement, React.ComponentPropsWithoutRef<typeof LabelPrimitive.Root>>(
  (props, ref) => (
    <LabelPrimitive.Root
      ref={ref}
      className="block text-sm font-medium text-gray-700"
      {...props}
    />
  )
);

Label.displayName = "Label";
