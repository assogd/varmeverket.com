import { StackedCardGrid } from './StackedCardGrid';
import type { CardGridProps } from './types';

interface CardGridBlockProps extends Partial<CardGridProps> {
  backgroundColor?: 'default' | 'orange';
}

const CardGridBlock: React.FC<CardGridBlockProps> = ({
  backgroundColor = 'default',
  cards = [],
  ...props
}) => {
  return <StackedCardGrid {...props} cards={cards} variant={backgroundColor} />;
};

export default CardGridBlock;
