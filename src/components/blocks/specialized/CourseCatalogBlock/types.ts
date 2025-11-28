export interface NavigationItem {
  blockType: 'common-card';
  tags?: Array<{
    id: string;
    name: string;
    description?: string;
  }>;
  title: string;
  body?: {
    root: {
      children: Array<{
        type: string;
        children?: Array<{
          text?: string;
          type?: string;
        }>;
      }>;
    };
  };
  image?: {
    url: string;
    alt?: string;
    width?: number;
    height?: number;
  };
  link?: {
    type: 'internal' | 'external';
    url: string;
    label?: string;
  };
}

export interface NavigationSection {
  sectionId: string;
  sectionTitle: string;
  navigationItems: NavigationItem[];
}

export interface CourseCatalogProps {
  headline: string;
  navigationSections: NavigationSection[];
}
