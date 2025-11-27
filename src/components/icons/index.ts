// Base Icon component
export {
  Icon,
  type IconProps,
  type BaseIconProps,
} from '@/components/icons/Icon';

// Individual icons
export { CheckIcon } from './CheckIcon';
export { OpenNavIcon } from './OpenNavIcon';
export { CloseIcon } from './CloseIcon';
export { CloseNavIcon } from './CloseNavIcon';
export { VarmeverketIcon } from './VarmeverketIcon';
export { CapacityIcon } from './CapacityIcon';
export { AreaIcon } from './AreaIcon';
export { AccordionArrowIcon } from './AccordionArrowIcon';
export { PlusIcon } from './PlusIcon';
export { MuteIcon } from './MuteIcon';
export { UnmuteIcon } from './UnmuteIcon';

// Icon name type for type safety
export type IconName =
  | 'check'
  | 'open-nav'
  | 'close'
  | 'close-nav'
  | 'varmeverket'
  | 'capacity'
  | 'area'
  | 'accordion-arrow'
  | 'plus'
  | 'mute'
  | 'unmute';

// Icon mapping for dynamic usage
import { CheckIcon } from './CheckIcon';
import { OpenNavIcon } from './OpenNavIcon';
import { CloseIcon } from './CloseIcon';
import { CloseNavIcon } from './CloseNavIcon';
import { VarmeverketIcon } from './VarmeverketIcon';
import { CapacityIcon } from './CapacityIcon';
import { AreaIcon } from './AreaIcon';
import { AccordionArrowIcon } from './AccordionArrowIcon';
import { PlusIcon } from './PlusIcon';
import { MuteIcon } from './MuteIcon';
import { UnmuteIcon } from './UnmuteIcon';
import { IconProps } from '@/components/icons/Icon';

export const ICONS: Record<IconName, React.ComponentType<IconProps>> = {
  check: CheckIcon,
  'open-nav': OpenNavIcon,
  close: CloseIcon,
  'close-nav': CloseNavIcon,
  varmeverket: VarmeverketIcon,
  capacity: CapacityIcon,
  area: AreaIcon,
  'accordion-arrow': AccordionArrowIcon,
  plus: PlusIcon,
  mute: MuteIcon,
  unmute: UnmuteIcon,
};
