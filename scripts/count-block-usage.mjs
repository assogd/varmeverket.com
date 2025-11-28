/**
 * Script to count usage of 'text' and 'textBlock' blocks in the database
 * Uses Payload API to query the database
 * 
 * Usage: node scripts/count-block-usage.mjs
 * 
 * Make sure NEXT_PUBLIC_PAYLOAD_API_URL is set in your environment
 * or the script will use http://localhost:3000/api
 */

// Use external API if available, otherwise localhost
const API_BASE_URL = process.env.NEXT_PUBLIC_PAYLOAD_API_URL || 'https://payload.cms.varmeverket.com/api';

/**
 * Recursively count block types in a layout/content array
 */
function countBlocksInArray(arr, blockType) {
  if (!Array.isArray(arr)) return 0;
  
  let count = 0;
  
  for (const item of arr) {
    if (item && typeof item === 'object') {
      // Check if this is a block with the target blockType
      if (item.blockType === blockType) {
        count++;
      }
      
      // Recursively check nested blocks
      if (item.layout && Array.isArray(item.layout)) {
        count += countBlocksInArray(item.layout, blockType);
      }
      if (item.assetTextBlocks && Array.isArray(item.assetTextBlocks)) {
        count += countBlocksInArray(item.assetTextBlocks, blockType);
      }
    }
  }
  
  return count;
}

/**
 * Count blocks in richText content (Lexical format)
 */
function countBlocksInRichText(content, blockType) {
  if (!content || !content.root || !content.root.children) return 0;
  
  let count = 0;
  const children = content.root.children;
  
  for (const child of children) {
    if (child && child.type === 'block' && child.fields) {
      if (child.fields.blockType === blockType) {
        count++;
      }
    }
  }
  
  return count;
}

/**
 * Count blocks in a document
 */
function countBlocksInDocument(doc, blockType) {
  let count = 0;
  
  // Check layout field (Pages, Spaces)
  if (doc.layout && Array.isArray(doc.layout)) {
    count += countBlocksInArray(doc.layout, blockType);
  }
  
  // Check content field (Articles - richText blocks)
  if (doc.content) {
    count += countBlocksInRichText(doc.content, blockType);
  }
  
  return count;
}

async function fetchAll(collection) {
  const allDocs = [];
  let page = 1;
  let hasMore = true;
  
  while (hasMore) {
    const url = `${API_BASE_URL}/${collection}?limit=100&page=${page}&depth=0`;
    try {
      const response = await fetch(url);
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }
      const data = await response.json();
      allDocs.push(...data.docs);
      hasMore = data.hasNextPage;
      page++;
    } catch (error) {
      console.error(`Error fetching ${collection}:`, error.message);
      return [];
    }
  }
  
  return allDocs;
}

async function countBlockUsage() {
  try {
    console.log('🔍 Counting block usage in database...\n');
    console.log(`Using API: ${API_BASE_URL}\n`);

    // Count in Pages collection
    console.log('📄 Checking Pages collection...');
    const pages = await fetchAll('pages');
    let textCountPages = 0;
    let textBlockCountPages = 0;
    const pagesWithText = [];
    const pagesWithTextBlock = [];
    
    for (const page of pages) {
      const textCount = countBlocksInDocument(page, 'text');
      const textBlockCount = countBlocksInDocument(page, 'textBlock');
      if (textCount > 0) {
        textCountPages += textCount;
        pagesWithText.push({ title: page.title || page.slug || page.id, count: textCount });
      }
      if (textBlockCount > 0) {
        textBlockCountPages += textBlockCount;
        pagesWithTextBlock.push({ title: page.title || page.slug || page.id, count: textBlockCount });
      }
    }
    
    if (pagesWithText.length > 0) {
      console.log(`  'text' blocks found in ${pagesWithText.length} page(s):`);
      pagesWithText.forEach(p => console.log(`    - ${p.title}: ${p.count}`));
    }
    if (pagesWithTextBlock.length > 0) {
      console.log(`  'textBlock' blocks found in ${pagesWithTextBlock.length} page(s):`);
      pagesWithTextBlock.forEach(p => console.log(`    - ${p.title}: ${p.count}`));
    }
    
    // Count in Spaces collection
    console.log('\n🏢 Checking Spaces collection...');
    const spaces = await fetchAll('spaces');
    let textCountSpaces = 0;
    let textBlockCountSpaces = 0;
    const spacesWithText = [];
    const spacesWithTextBlock = [];
    
    for (const space of spaces) {
      const textCount = countBlocksInDocument(space, 'text');
      const textBlockCount = countBlocksInDocument(space, 'textBlock');
      if (textCount > 0) {
        textCountSpaces += textCount;
        spacesWithText.push({ title: space.title || space.slug || space.id, count: textCount });
      }
      if (textBlockCount > 0) {
        textBlockCountSpaces += textBlockCount;
        spacesWithTextBlock.push({ title: space.title || space.slug || space.id, count: textBlockCount });
      }
    }
    
    if (spacesWithText.length > 0) {
      console.log(`  'text' blocks found in ${spacesWithText.length} space(s):`);
      spacesWithText.forEach(s => console.log(`    - ${s.title}: ${s.count}`));
    }
    if (spacesWithTextBlock.length > 0) {
      console.log(`  'textBlock' blocks found in ${spacesWithTextBlock.length} space(s):`);
      spacesWithTextBlock.forEach(s => console.log(`    - ${s.title}: ${s.count}`));
    }
    
    // Count in Articles collection
    console.log('\n📝 Checking Articles collection...');
    const articles = await fetchAll('articles');
    let textCountArticles = 0;
    let textBlockCountArticles = 0;
    const articlesWithText = [];
    const articlesWithTextBlock = [];
    
    for (const article of articles) {
      const textCount = countBlocksInDocument(article, 'text');
      const textBlockCount = countBlocksInDocument(article, 'textBlock');
      if (textCount > 0) {
        textCountArticles += textCount;
        articlesWithText.push({ title: article.title || article.slug || article.id, count: textCount });
      }
      if (textBlockCount > 0) {
        textBlockCountArticles += textBlockCount;
        articlesWithTextBlock.push({ title: article.title || article.slug || article.id, count: textBlockCount });
      }
    }
    
    if (articlesWithText.length > 0) {
      console.log(`  'text' blocks found in ${articlesWithText.length} article(s):`);
      articlesWithText.forEach(a => console.log(`    - ${a.title}: ${a.count}`));
    }
    if (articlesWithTextBlock.length > 0) {
      console.log(`  'textBlock' blocks found in ${articlesWithTextBlock.length} article(s):`);
      articlesWithTextBlock.forEach(a => console.log(`    - ${a.title}: ${a.count}`));
    }
    
    // Summary
    console.log('\n' + '='.repeat(60));
    console.log('📊 SUMMARY');
    console.log('='.repeat(60));
    console.log(`'text' block usage:`);
    console.log(`  - Pages: ${textCountPages}`);
    console.log(`  - Spaces: ${textCountSpaces}`);
    console.log(`  - Articles: ${textCountArticles}`);
    console.log(`  - TOTAL: ${textCountPages + textCountSpaces + textCountArticles}`);
    console.log(`\n'textBlock' block usage:`);
    console.log(`  - Pages: ${textBlockCountPages}`);
    console.log(`  - Spaces: ${textBlockCountSpaces}`);
    console.log(`  - Articles: ${textBlockCountArticles}`);
    console.log(`  - TOTAL: ${textBlockCountPages + textBlockCountSpaces + textBlockCountArticles}`);
    console.log('='.repeat(60));
    
  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  }
}

countBlockUsage();
