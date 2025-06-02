import React, { forwardRef } from 'react';

const CollapsibleSection = forwardRef(({ title, children }, ref) => {
  return (
    <details ref={ref} className="border-b border-gray-200 group">
      <summary
        className="
          flex justify-between items-center w-full py-4 px-6 text-left font-medium text-white // Texto blanco para contraste
          bg-[#f09300] // Color de fondo principal
          hover:bg-[#e96d00] // Color de fondo al hacer hover
          focus:outline-none focus:ring-2 focus:ring-[#f09300] focus:ring-offset-2 cursor-pointer
          marker:hidden
          [&::-webkit-details-marker]:hidden
          after:content-['+'] after:ml-6 after:flex-shrink-0 after:h-6 after:w-6 after:flex after:items-center after:justify-center after:transition-transform after:duration-200 after:text-white // Cambia el color del '+' a blanco
          group-open:after:content-['-'] group-open:after:rotate-180
          rounded-lg
          transition-colors duration-200
          mb-2
        "
      >
        <span>{title}</span>
      </summary>

      <div className="px-6 py-4 bg-gray-50">
        {children}
      </div>
    </details>
  );
});

export default CollapsibleSection;
