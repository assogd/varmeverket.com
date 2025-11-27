import { type LinkGroup } from '@/utils/linkRouter';

export interface NavigationLink extends LinkGroup {
  reference?: unknown;
}

export interface MenuItem {
  blockType: 'navigationItem';
  link: NavigationLink;
  children?: MenuItem[];
}

export interface NavigationData {
  _id: string;
  name: string;
  description?: string;
  highlight?: NavigationLink;
  menuItems: MenuItem[];
}

export interface NavigationProps {
  navigation: NavigationData;
}
