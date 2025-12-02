/**
 * Intelligently breaks text into evenly distributed lines
 * @param text - The text to break
 * @param charsPerLine - Target characters per line (default: 24)
 * @returns Text with line breaks inserted
 */
export function breakTextIntoLines(
  text: string,
  charsPerLine: number = 24
): string {
  // Remove existing line breaks and normalize whitespace
  const cleanText = text.replace(/\s+/g, ' ').trim();
  const totalChars = cleanText.length;

  // Early return if text fits on one line
  if (totalChars <= charsPerLine) {
    return cleanText;
  }

  // Calculate optimal number of lines
  const optimalLines = Math.ceil(totalChars / charsPerLine);
  const targetCharsPerLine = Math.ceil(totalChars / optimalLines);

  // Split into words
  const words = cleanText.split(' ');
  const lines: string[] = [];
  let currentLine = '';

  for (let i = 0; i < words.length; i++) {
    const word = words[i];
    const testLine = currentLine ? `${currentLine} ${word}` : word;

    // If adding this word would exceed target, start a new line
    // But allow some flexibility (±2 chars) to avoid awkward breaks
    if (
      currentLine &&
      testLine.length > targetCharsPerLine + 2 &&
      currentLine.length >= targetCharsPerLine - 2
    ) {
      lines.push(currentLine);
      currentLine = word;
    } else {
      currentLine = testLine;
    }
  }

  // Add the last line
  if (currentLine) {
    lines.push(currentLine);
  }

  return lines.join('\n');
}

/**
 * Extracts plain text from React node/element
 * Handles both string and React element inputs
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function extractTextFromNode(node: any): string {
  if (typeof node === 'string') {
    return node;
  }

  if (typeof node === 'number') {
    return String(node);
  }

  if (node && typeof node === 'object') {
    // Handle React elements
    if (node.props && node.props.children) {
      if (typeof node.props.children === 'string') {
        return node.props.children;
      }
      if (Array.isArray(node.props.children)) {
        return (
          node.props.children
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            .map((child: any) => extractTextFromNode(child))
            .join('')
        );
      }
      return extractTextFromNode(node.props.children);
    }
  }

  if (Array.isArray(node)) {
    return node.map(item => extractTextFromNode(item)).join('');
  }

  return '';
}
