export interface Card {
  title: string;
  description?: string;
  image?: { url: string; alt?: string };
  tags?: { id: string; name: string; description?: string }[];
  link?: {
    type: 'internal' | 'external' | 'copy';
    text?: string;
    url?: string;
    doc?: any; // eslint-disable-line @typescript-eslint/no-explicit-any
    reference?: any; // eslint-disable-line @typescript-eslint/no-explicit-any
  };
}

export interface CardGridProps {
  headline?: string;
  description?: any; // eslint-disable-line @typescript-eslint/no-explicit-any
  cards: Card[];
  link?: {
    type: 'internal' | 'external' | 'copy';
    text?: string;
    url?: string;
    doc?: any; // eslint-disable-line @typescript-eslint/no-explicit-any
    reference?: any; // eslint-disable-line @typescript-eslint/no-explicit-any
  };
}

export interface StackedCardGridProps extends CardGridProps {
  variant?: 'default' | 'orange';
}
