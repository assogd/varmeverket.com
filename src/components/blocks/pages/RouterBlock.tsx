'use client';
import React from 'react';
import { AppAction } from '@/components/ui';
import { DevIndicator } from '@/components/dev/DevIndicator';
import { BlockHeader } from '@/components/blocks/BlockHeader';
import { FadeInUp } from '@/components/ui';
import { routeLink, type LinkGroup } from '@/utils/linkRouter';

interface NavigationLink {
  link: LinkGroup;
}

interface RouterBlockProps {
  headline?: string;
  description?: unknown;
  links: NavigationLink[];
}

const RouterBlock: React.FC<RouterBlockProps> = ({
  headline,
  description,
  links,
}) => {
  return (
    <section className="grid relative">
      <DevIndicator componentName="RouterBlock" />
      <FadeInUp timing="normal">
        <BlockHeader headline={headline} description={description} />
      </FadeInUp>
      <hr className="mx-2 my-2" />

      <div className="relative flex justify-center items-center py-24">
        {/* Central vertical line */}
        <div className="absolute left-1/2 top-0 bottom-0 w-px bg-text transform -translate-x-1/2"></div>

        {/* Links stacked vertically */}
        <div className="relative z-10 flex flex-col items-center space-y-24">
          {links.map((link, idx) => {
            // Use the link router to resolve the link
            const linkResult = routeLink(link.link);
            const href = linkResult.href;

            return (
              <div key={idx} className="text-center">
                {href && (
                  <FadeInUp timing="normal" delay={0.2 + idx * 0.1}>
                    <AppAction
                      link={link.link}
                      className="text-4xl sm:text-6xl md:text-7xl font-ballPill uppercase bg-bg py-1"
                      variant="minimal"
                    >
                      {link.link.text}
                    </AppAction>
                  </FadeInUp>
                )}
              </div>
            );
          })}
        </div>
      </div>

      <hr className="mx-2 my-2" />
    </section>
  );
};

export default RouterBlock;
