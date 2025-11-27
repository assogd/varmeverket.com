'use client';

import { useRouter } from 'next/navigation';
import { ShowcaseOverlay } from '@/components/ui/overlays';

interface ShowcasePageWrapperProps {
  showcase: {
    id: string;
    title: string;
    slug: string;
    [key: string]: unknown;
  };
}

const ShowcasePageWrapper: React.FC<ShowcasePageWrapperProps> = ({
  showcase,
}) => {
  const router = useRouter();

  const handleClose = () => {
    router.back();
  };

  return <ShowcaseOverlay showcase={showcase} onClose={handleClose} />;
};

export default ShowcasePageWrapper;
