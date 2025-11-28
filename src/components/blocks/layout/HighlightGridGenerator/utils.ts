// Utility function to extract text from rich text content
export const extractTextFromRichText = (
  richText:
    | {
        root?: {
          children: Array<{
            type: string;
            children?: Array<{
              text?: string;
              type?: string;
            }>;
            text?: string;
          }>;
        };
      }
    | string
): string => {
  if (!richText) return '';

  if (typeof richText === 'string') {
    return richText;
  }

  if (richText.root?.children) {
    return richText.root.children
      .map(
        (child: {
          type: string;
          children?: Array<{
            text?: string;
            type?: string;
          }>;
          text?: string;
        }) => {
          if (child.children) {
            return child.children
              .map(
                (textChild: { text?: string; type?: string }) =>
                  textChild.text || ''
              )
              .join('');
          }
          return child.text || '';
        }
      )
      .join(' ')
      .trim();
  }

  return '';
};

// Utility function to format date for tags
export const formatDateForTags = (dateString: string) => {
  if (!dateString) return { year: null, month: null };

  const date = new Date(dateString);
  const year = date.getFullYear().toString();
  const monthNames = [
    'JAN',
    'FEB',
    'MAR',
    'APR',
    'MAY',
    'JUN',
    'JUL',
    'AUG',
    'SEP',
    'OKT',
    'NOV',
    'DEC',
  ];
  const month = monthNames[date.getMonth()];

  return { year, month };
};

// Utility function to find image in showcase assets
export const findImageInAssets = (
  assets: Array<{
    blockType: string;
    image?: {
      id: string;
      url: string;
      alt?: string;
      width?: number;
      height?: number;
    };
    [key: string]: unknown;
  }>
) => {
  if (!assets) return null;

  const imageAsset = assets.find(
    (asset: {
      blockType: string;
      image?: {
        id: string;
        url: string;
        alt?: string;
        width?: number;
        height?: number;
      };
      [key: string]: unknown;
    }) => asset.blockType === 'imageWithCaption' && asset.image
  );

  return imageAsset ? imageAsset.image : null;
};

// Utility function to get article content with fallbacks
export const getArticleContent = (item: {
  excerpt?: string;
  introduction?: {
    root?: {
      children: Array<{
        type: string;
        children?: Array<{
          text?: string;
          type?: string;
        }>;
        text?: string;
      }>;
    };
  };
  content?: {
    root?: {
      children: Array<{
        type: string;
        children?: Array<{
          text?: string;
          type?: string;
        }>;
        text?: string;
      }>;
    };
  };
}): string => {
  if (item.excerpt) {
    return item.excerpt;
  } else if (item.introduction) {
    return extractTextFromRichText(item.introduction);
  } else if (item.content) {
    return extractTextFromRichText(item.content);
  }
  return '';
};
