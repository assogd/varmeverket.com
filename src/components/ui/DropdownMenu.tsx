'use client';

import React, { useState, useRef, useEffect } from 'react';
import clsx from 'clsx';

type Placement = 'right' | 'bottom-start' | 'bottom-end';

const menuPanelClass =
  'absolute z-10 min-w-[11rem] rounded-lg border border-text/20 bg-bg dark:border-dark-text/20 dark:bg-dark-bg py-1 shadow-lg';

const placementClasses: Record<Placement, string> = {
  right: 'left-full top-0 ml-2',
  'bottom-start': 'left-0 top-full mt-2',
  'bottom-end': 'right-0 top-full mt-2',
};

const menuItemClass =
  'flex w-full items-center gap-2 px-3 py-2 text-left text-sm text-text transition-colors hover:bg-white/15 dark:text-dark-text dark:hover:bg-white/10 disabled:opacity-50';

interface DropdownMenuContextValue {
  close: () => void;
}

const DropdownMenuContext = React.createContext<DropdownMenuContextValue | null>(
  null
);

export interface DropdownMenuProps {
  /** Element that opens the menu on click */
  trigger: React.ReactNode;
  /** Menu panel placement relative to trigger */
  placement?: Placement;
  /** Content of the menu (e.g. DropdownMenu.Item) */
  children: React.ReactNode;
  /** Optional controlled open state */
  open?: boolean;
  /** Called when open state changes (for controlled usage) */
  onOpenChange?: (open: boolean) => void;
  /** Disable opening the menu */
  disabled?: boolean;
  className?: string;
}

export const DropdownMenuRoot: React.FC<DropdownMenuProps> = ({
  trigger,
  placement = 'right',
  children,
  open: controlledOpen,
  onOpenChange,
  disabled = false,
  className,
}) => {
  const [internalOpen, setInternalOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const isControlled = controlledOpen !== undefined;
  const open = isControlled ? controlledOpen : internalOpen;

  const setOpen = (next: boolean) => {
    if (!isControlled) setInternalOpen(next);
    onOpenChange?.(next);
  };

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        containerRef.current &&
        !containerRef.current.contains(event.target as Node)
      ) {
        setOpen(false);
      }
    };
    if (open) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [open]);

  const handleTriggerClick = () => {
    if (disabled) return;
    setOpen(!open);
  };

  const contextValue: DropdownMenuContextValue = {
    close: () => setOpen(false),
  };

  return (
    <div className={clsx('relative', className)} ref={containerRef}>
      <div
        onClick={handleTriggerClick}
        onKeyDown={e => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            handleTriggerClick();
          }
        }}
        role="button"
        tabIndex={disabled ? -1 : 0}
        aria-expanded={open}
        aria-haspopup="true"
        className={clsx(
          'outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-offset-bg focus-visible:ring-text/40',
          disabled ? 'cursor-default' : 'cursor-pointer'
        )}
      >
        {trigger}
      </div>
      {open && (
        <DropdownMenuContext.Provider value={contextValue}>
          <div
            className={clsx(menuPanelClass, placementClasses[placement])}
            role="menu"
          >
            {children}
          </div>
        </DropdownMenuContext.Provider>
      )}
    </div>
  );
};

export interface DropdownMenuItemProps {
  icon?: React.ReactNode;
  onSelect: () => void;
  disabled?: boolean;
  children: React.ReactNode;
}

export const DropdownMenuItem: React.FC<DropdownMenuItemProps> = ({
  icon,
  onSelect,
  disabled = false,
  children,
}) => {
  const context = React.useContext(DropdownMenuContext);

  const handleClick = () => {
    if (disabled) return;
    context?.close();
    onSelect();
  };

  return (
    <button
      type="button"
      role="menuitem"
      onClick={handleClick}
      disabled={disabled}
      className={menuItemClass}
    >
      {icon && <span className="shrink-0 [&>svg]:size-4">{icon}</span>}
      {children}
    </button>
  );
};

export const DropdownMenu = {
  Root: DropdownMenuRoot,
  Item: DropdownMenuItem,
};

export default DropdownMenu;
