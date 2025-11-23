import React from 'react';

interface SectionTitleProps {
  children: React.ReactNode;
  className?: string;
}

export function SectionTitle({ children, className = '' }: SectionTitleProps) {
  return (
    <h2 className={`text-2xl font-bold mb-4 ${className}`}>
      {children}
    </h2>
  );
}
