'use client';
import NextLink from 'next/link';
import React from 'react';
import {
  routeLink,
  type LinkGroup,
  isExternalUrl,
  getExternalLinkAttributes,
  isEmailAddress,
} from '@/utils/linkRouter';
import { useNotification } from '@/hooks/useNotification';
import { useIsDark } from '@/hooks/useTheme';
import clsx from 'clsx';

interface AppActionProps {
  href?: string;
  children: React.ReactNode;
  variant?: 'primary' | 'secondary' | 'outline' | 'minimal' | 'noCSS';
  size?: 'sm' | 'md' | 'lg';
  asButton?: boolean;
  className?: string;
  actionType?: 'link' | 'copy';
  onCopy?: () => void;
  onClick?: React.MouseEventHandler<HTMLElement>;
  target?: string;
  rel?: string;
  // New prop for LinkGroup support
  link?: LinkGroup;
}

const sizeStyles = {
  sm: 'px-2 pt-[.4em] pb-1',
  md: 'px-4 py-2.5',
  lg: 'px-4 pt-[1.1em] pb-4',
};

const getBaseStyles = (isDark: boolean) => ({
  primary: isDark
    ? 'uppercase border border-text rounded-md inline-block max-w-full text-center overflow-hidden text-ellipsis whitespace-nowrap'
    : 'uppercase bg-text text-bg mix-blend-multiply rounded-md block text-center max-w-full overflow-hidden text-ellipsis whitespace-nowrap',
  secondary:
    'uppercase bg-accent rounded-md block text-center max-w-full overflow-hidden text-ellipsis whitespace-nowrap',
  outline:
    'uppercase border border-text rounded-md inline-block max-w-full overflow-hidden text-ellipsis whitespace-nowrap',
  minimal: 'block max-w-full overflow-hidden text-ellipsis whitespace-nowrap',
  noCSS: '',
});

export const AppAction: React.FC<AppActionProps> = ({
  href,
  children,
  variant = 'primary',
  size = 'md',
  asButton = false,
  className = '',
  actionType = 'link',
  onCopy,
  link,
}) => {
  const { showSuccess, showError } = useNotification();
  const isDark = useIsDark();
  const baseStyles = getBaseStyles(isDark);

  // Use link router if link prop is provided, otherwise fall back to legacy behavior
  const linkResult = link
    ? routeLink(link)
    : {
        href: href || '#',
        isExternal: href ? isExternalUrl(href) : false,
        isCopy: actionType === 'copy',
        shouldRenderAsButton: asButton || actionType === 'copy',
      };

  const handleCopy = async () => {
    const textToCopy = linkResult.href || href || '';
    if (textToCopy) {
      try {
        await navigator.clipboard.writeText(textToCopy);
        showSuccess('Kopierat!', {
          duration: 5000,
        });
        onCopy?.();
      } catch (err) {
        console.error('Failed to copy:', err);
        showError('Kunde inte kopiera texten');
      }
    }
  };

  const style = clsx(
    variant !== 'noCSS' && baseStyles[variant],
    variant !== 'minimal' && variant !== 'noCSS' && sizeStyles[size],
    variant !== 'noCSS' &&
      'transition-transform duration-75 ease-out active:scale-[0.99]',
    className
  );

  // Handle copy action
  if (linkResult.isCopy || actionType === 'copy') {
    return (
      <>
        <button onClick={handleCopy} className={style} type="button">
          <div className="flex items-center gap-3 justify-center">
            <svg
              className="w-5 h-5 shrink-0"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z"
              />
            </svg>
            <div className="truncate min-w-0">{children}</div>
          </div>
        </button>
      </>
    );
  }

  // Handle button actions
  if (linkResult.shouldRenderAsButton || asButton) {
    return (
      <button className={style} type="button">
        {children}
      </button>
    );
  }

  if (!linkResult.href || linkResult.href === '#') {
    return null;
  }

  // Ensure href is always a string
  const safeHref = typeof linkResult.href === 'string' ? linkResult.href : '#';

  // Handle external links
  if (linkResult.isExternal) {
    const externalAttrs = getExternalLinkAttributes();
    return (
      <a
        href={safeHref}
        className={style}
        target={externalAttrs.target}
        rel={externalAttrs.rel}
      >
        {children}
      </a>
    );
  }

  // Handle internal links
  return (
    <NextLink href={safeHref} className={style}>
      {children}
    </NextLink>
  );
};

/**
 * Minimal link component that handles internal and external links from LinkGroup
 * Skips copy functionality and complex styling - just renders the link
 */
export const AppLink: React.FC<{
  link: LinkGroup;
  children: React.ReactNode;
  className?: string;
}> = ({ link, children, className = '' }) => {
  const linkResult = routeLink(link);

  // Skip copy links - return just the text
  if (linkResult.isCopy) {
    return <span className={className}>{children}</span>;
  }

  // No valid href
  if (!linkResult.href || linkResult.href === '#') {
    return <span className={className}>{children}</span>;
  }

  // Check if href or original url is an email address (even if marked as internal)
  const href = linkResult.href;
  const originalUrl = link.url || '';
  const isEmail = isEmailAddress(href) || isEmailAddress(originalUrl);
  const emailAddress = isEmailAddress(href)
    ? href
    : isEmailAddress(originalUrl)
      ? originalUrl
      : null;

  // External links or email addresses
  if (linkResult.isExternal || isEmail) {
    const emailHref = emailAddress ? `mailto:${emailAddress}` : href;
    return (
      <a
        href={emailHref}
        target={isEmail ? undefined : '_blank'}
        rel={isEmail ? undefined : 'noopener noreferrer'}
        className={className}
      >
        {children}
      </a>
    );
  }

  // Internal links
  return (
    <NextLink href={href} className={className}>
      {children}
    </NextLink>
  );
};
