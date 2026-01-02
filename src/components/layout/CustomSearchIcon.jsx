import React from 'react';

const CustomSearchIcon = ({ className, strokeWidth = 2 }) => {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
    >
      {/* O círculo principal (lente) com uma espessura de traço definida */}
      <circle cx="10.5" cy="10.5" r="7.5" strokeWidth={strokeWidth} />
      {/* O cabo - mais grosso (espessura dobrada) e apontando para a direita */}
      <line x1="16" y1="16" x2="21" y2="21" strokeWidth={strokeWidth * 2} />
    </svg>
  );
};

export default CustomSearchIcon;