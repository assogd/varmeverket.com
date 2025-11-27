'use client';
import React from 'react';
import clsx from 'clsx';
import Marquee from 'react-fast-marquee';
import Image from 'next/image';
import { AppLink } from '@/components/ui';
import { type LinkGroup } from '@/utils/linkRouter';

// Style constants
const GRID_COLUMN_WIDTH = 'basis-[6.6666vw]';
const GRID_COLUMN_HEIGHT = 'h-[12.6666vw]';
const BORDER_RIGHT = 'border-r border-text';
const BORDER_LEFT = 'border-l border-text';
const BORDER_TOP_BOTTOM = 'border-t border-b border-text';
const FOOTER_LINK_CLASS = 'whitespace-nowrap';

// Helper component for grid columns
const GridColumn: React.FC<{ isLast?: boolean }> = ({ isLast = false }) => (
  <div
    className={clsx(
      GRID_COLUMN_WIDTH,
      GRID_COLUMN_HEIGHT,
      !isLast && BORDER_RIGHT
    )}
  />
);

// Helper component for grid rows
const GridRow: React.FC<{
  hasBorders?: boolean;
  children?: React.ReactNode;
  className?: string;
}> = ({ hasBorders = false, children, className = '' }) => (
  <div
    className={clsx(
      'flex justify-between py-[1vw] md:py-2 h-[14vw]',
      hasBorders && BORDER_TOP_BOTTOM,
      className
    )}
  >
    {children}
  </div>
);

// Marquee component
const MarqueeText: React.FC = () => {
  const marqueeSize = 11.6666;

  return (
    <div
      className="font-ballPill w-[86.5%] pointer-events-none"
      style={{
        height: `${marqueeSize}vw`,
        fontSize: `${marqueeSize}vw`,
        lineHeight: `${marqueeSize * 1.3}vw`,
      }}
    >
      <Marquee speed={50}>
        {Array(5)
          .fill(null)
          .map((_, i) => (
            <span key={i} className="mx-12">
              VÄRMEVERKET
            </span>
          ))}
      </Marquee>
    </div>
  );
};

// Helper function to generate grid columns
const generateGridColumns = (count: number) =>
  Array(count)
    .fill(null)
    .map((_, i) => <GridColumn key={i} isLast={i === count - 1} />);

// Helper component for side columns in marquee row
const SideColumn: React.FC<{ hasRightBorder?: boolean }> = ({
  hasRightBorder = false,
}) => (
  <div
    className={clsx(
      GRID_COLUMN_WIDTH,
      GRID_COLUMN_HEIGHT,
      hasRightBorder ? BORDER_RIGHT : BORDER_LEFT
    )}
  />
);

// Helper component for footer links
const FooterItem: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <div className={FOOTER_LINK_CLASS}>{children}</div>
);

interface FooterProps {
  links?: Array<{ link: LinkGroup }>;
}

export const Footer: React.FC<FooterProps> = ({ links = [] }) => {
  return (
    <footer className="relative bg-bg">
      <div className="mx-2">
        {/* Top row */}
        <GridRow hasBorders>{generateGridColumns(15)}</GridRow>

        {/* Middle row with marquee */}
        <GridRow>
          <SideColumn hasRightBorder />
          <MarqueeText />
          <SideColumn />
        </GridRow>

        {/* Bottom row */}
        <GridRow hasBorders>{generateGridColumns(15)}</GridRow>
      </div>
      <div className="flex flex-col md:flex-wrap md:flex-row gap-x-3 p-2 uppercase pb-12 md:pb-2">
        <FooterItem>&copy; {new Date().getFullYear()} Värmeverket</FooterItem>
        <FooterItem>Bredängsvägen 203, 127 34 Skärholmen</FooterItem>
        {links.map((item, index) => {
          const link = item.link;
          const linkText = link.text || 'Link';

          return (
            <FooterItem key={index}>
              <AppLink link={link}>{linkText}</AppLink>
            </FooterItem>
          );
        })}
      </div>
      <div>
        <Image
          src="/VV_ROSES.gif"
          alt="Two spinning roses"
          width={670}
          height={520}
          unoptimized
          className="p-2 mt-20 w-28 h-auto mix-blend-multiply dark:invert dark:mix-blend-lighten"
        />
      </div>
    </footer>
  );
};
