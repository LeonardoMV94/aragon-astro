import React, { forwardRef } from "react";

const CollapsibleSection = forwardRef(({ title, children }, ref) => {
  return (
    <details
      ref={ref}
      className="border-b border-gray-300 group transition-colors duration-800"
    >
      <summary
        className="
      flex justify-between items-center w-full py-4 px-6 text-left font-semibold text-gray-800 bg-gray-100
      hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-[#f09300] focus:ring-offset-2 cursor-pointer
      shadow-sm marker:hidden [&::-webkit-details-marker]:hidden
      after:content-['+'] after:ml-6 after:flex-shrink-0 after:h-6 after:w-6 after:flex after:items-center after:justify-center after:transition-transform after:duration-200
      group-open:after:content-['-'] group-open:after:rotate-180
      group-open:border-l-4 group-open:border-[#f09300]
    "
      >
        <span>{title}</span>
      </summary>

      <div className="px-6 py-4 bg-white text-gray-800">{children}</div>
    </details>
  );
});

export default CollapsibleSection;
