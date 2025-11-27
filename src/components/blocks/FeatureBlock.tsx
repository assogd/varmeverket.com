import Image from 'next/image';
import Link from 'next/link';
import { AppAction } from '@/components/ui';
import { DevIndicator } from '@/components/dev/DevIndicator';

interface FeatureBlockProps {
  image?: { url: string; alt?: string; width?: number; height?: number };
  headline?: string;
  description: string;
  link?: {
    type?: 'internal' | 'external';
    text?: string;
    url?: string;
    reference?: {
      id: string;
      title?: string;
      slug?: string;
      [key: string]: unknown;
    };
  };
}

export default function FeatureBlock({
  image,
  description,
  link,
}: FeatureBlockProps) {
  // Determine the href for the CTA
  let href: string | undefined = undefined;
  if (link?.type === 'internal' && link?.reference) {
    // Handle Payload's reference structure: { relationTo: "pages", value: {...} }
    if (typeof link.reference === 'object' && link.reference?.value?.slug) {
      href =
        link.reference?.relationTo === 'spaces'
          ? `/spaces/${link.reference?.value?.slug}`
          : `/${link.reference?.value?.slug}`;
    }
    // Handle direct object structure: { slug: "...", collection: "..." }
    else if (typeof link.reference === 'object' && link.reference?.slug) {
      href =
        link.reference?.collection === 'spaces'
          ? `/spaces/${link.reference?.slug}`
          : `/${link.reference?.slug}`;
    } else {
      // Fallback for unpopulated references (just ID)
      href = `/${link.reference}`;
    }
  } else if (link?.type === 'external') {
    href = link.url;
  }

  return (
    <div className="grid grid-cols-16 p-4 my-20 gap-4 relative">
      <DevIndicator componentName="FeatureBlock" />
      {image?.url && (
        <div className="col-start-1 col-end-12 md:col-end-9">
          <Image
            src={image.url}
            alt={image.alt || ''}
            width={image.width || 800}
            height={image.height || 600}
            className=""
            sizes="(min-width: 768px) 50vw, 100vw"
            priority
          />
        </div>
      )}
      <div className="col-start-1 md:col-start-9 col-end-16">
        <div className="mb-4 whitespace-pre-line font-mono">{description}</div>
        {href &&
        typeof href === 'string' &&
        link?.text &&
        link.type === 'internal' ? (
          <Link href={href} className="font-bold underline mt-2 inline-block">
            {link.text} &rarr;
          </Link>
        ) : href && typeof href === 'string' && link?.text ? (
          <AppAction href={href} variant="secondary">
            {link.text} &rarr;
          </AppAction>
        ) : null}
      </div>
    </div>
  );
}
