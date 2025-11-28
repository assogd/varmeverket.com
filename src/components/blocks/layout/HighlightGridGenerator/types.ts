export interface ContentItem {
  id: string;
  title: string;
  slug: string;
  featuredImage?: {
    id: string;
    url: string;
    alt?: string;
    width?: number;
    height?: number;
  };
  assets?: Array<{
    id: string;
    blockType: 'imageWithCaption' | 'videoWithCaption' | 'text';
    image?: {
      id: string;
      url: string;
      alt?: string;
      width?: number;
      height?: number;
    };
    caption?: string;
    host?: string;
    playbackId?: string;
    video?: {
      id: string;
      url: string;
      alt?: string;
      width?: number;
      height?: number;
    };
    autoplay?: boolean;
    controls?: boolean;
    title?: string;
    content?: {
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
  }>;
  year?: number;
  publishedDate?: string;
  createdAt?: string;
  lastModifiedDate?: string;
  excerpt?: string;
  introduction?: {
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
  content?: {
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
  tags?: Array<{
    id: string;
    name: string;
  }>;
  author?: {
    firstName?: string;
    lastName?: string;
    email?: string;
    bylineDescription?: string;
  };
  _contentType: 'article' | 'showcase';
}

export interface CardProps {
  item: ContentItem;
  index: number;
  isHovered: boolean;
  onHoverStart: () => void;
  onHoverEnd: () => void;
  onClick: () => void;
  isHomepage?: boolean;
}
