import React from 'react';

export const Headline = ({ level=2, kicker, children, center=false, className='' }) => {
  const Tag = `h${level}`;
  return (
    <div className={`space-y-2 ${center?'text-center':''} ${className}`}>
      {kicker && <div className="text-[11px] tracking-wider font-semibold uppercase text-brand-600">{kicker}</div>}
      <Tag className="text-xl md:text-2xl font-semibold tracking-tight text-gray-800">{children}</Tag>
    </div>
  );
};
