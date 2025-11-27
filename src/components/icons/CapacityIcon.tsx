import { Icon, type IconProps } from '@/components/icons/Icon';

export const CapacityIcon = ({ size = 16, ...props }: IconProps) => (
  <Icon size={size} {...props}>
    <path d="M5.5 5.5C6.88125 5.5 8 4.38125 8 3C8 1.61875 6.88125 0.5 5.5 0.5C4.11875 0.5 3 1.61875 3 3C3 4.38125 4.11875 5.5 5.5 5.5ZM5.5 6.75C3.83125 6.75 0.5 7.5875 0.5 9.25V10.5H10.5V9.25C10.5 7.5875 7.16875 6.75 5.5 6.75Z" />
  </Icon>
);
