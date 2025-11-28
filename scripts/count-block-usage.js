/**
 * Script to count usage of 'text' and 'textBlock' blocks in the database
 * 
 * Usage: node scripts/count-block-usage.js
 */

import mongoose from 'mongoose';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, resolve } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Load environment variables
dotenv.config({ path: resolve(__dirname, '../.env.local') });
dotenv.config({ path: resolve(__dirname, '../.env') });

const DATABASE_URI = process.env.DATABASE_URI;

if (!DATABASE_URI) {
  console.error('❌ DATABASE_URI not found in environment variables');
  process.exit(1);
}

/**
 * Recursively count block types in a layout/content array
 */
function countBlocksInArray(arr, blockType, path = '') {
  if (!Array.isArray(arr)) return 0;
  
  let count = 0;
  
  for (let i = 0; i < arr.length; i++) {
    const item = arr[i];
    if (item && typeof item === 'object') {
      // Check if this is a block with the target blockType
      if (item.blockType === blockType) {
        count++;
        console.log(`  Found at: ${path}[${i}]`);
      }
      
      // Recursively check nested blocks (e.g., in InfoOverlay.layout, AssetTextContainer.assetTextBlocks)
      if (item.layout && Array.isArray(item.layout)) {
        count += countBlocksInArray(item.layout, blockType, `${path}[${i}].layout`);
      }
      if (item.content && Array.isArray(item.content)) {
        count += countBlocksInArray(item.content, blockType, `${path}[${i}].content`);
      }
      if (item.assetTextBlocks && Array.isArray(item.assetTextBlocks)) {
        count += countBlocksInArray(item.assetTextBlocks, blockType, `${path}[${i}].assetTextBlocks`);
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
    count += countBlocksInArray(doc.layout, blockType, `layout`);
  }
  
  // Check content field (Articles - richText blocks)
  if (doc.content && doc.content.root && doc.content.root.children) {
    // RichText content can have blocks embedded
    const children = doc.content.root.children;
    for (let i = 0; i < children.length; i++) {
      const child = children[i];
      if (child && child.type === 'block' && child.fields && child.fields.blockType === blockType) {
        count++;
        console.log(`  Found in content at: content.root.children[${i}]`);
      }
    }
  }
  
  return count;
}

async function countBlockUsage() {
  try {
    console.log('🔌 Connecting to database...');
    await mongoose.connect(DATABASE_URI);
    console.log('✅ Connected to database\n');

    const db = mongoose.connection.db;
    
    // Count in Pages collection
    console.log('📄 Checking Pages collection...');
    const pages = await db.collection('pages').find({}).toArray();
    let textCountPages = 0;
    let textBlockCountPages = 0;
    
    for (const page of pages) {
      const textCount = countBlocksInDocument(page, 'text');
      const textBlockCount = countBlocksInDocument(page, 'textBlock');
      if (textCount > 0 || textBlockCount > 0) {
        console.log(`  Page: ${page.title || page.slug || page._id}`);
        if (textCount > 0) {
          textCountPages += textCount;
          console.log(`    - 'text' blocks: ${textCount}`);
        }
        if (textBlockCount > 0) {
          textBlockCountPages += textBlockCount;
          console.log(`    - 'textBlock' blocks: ${textBlockCount}`);
        }
      }
    }
    
    // Count in Spaces collection
    console.log('\n🏢 Checking Spaces collection...');
    const spaces = await db.collection('spaces').find({}).toArray();
    let textCountSpaces = 0;
    let textBlockCountSpaces = 0;
    
    for (const space of spaces) {
      const textCount = countBlocksInDocument(space, 'text');
      const textBlockCount = countBlocksInDocument(space, 'textBlock');
      if (textCount > 0 || textBlockCount > 0) {
        console.log(`  Space: ${space.title || space.slug || space._id}`);
        if (textCount > 0) {
          textCountSpaces += textCount;
          console.log(`    - 'text' blocks: ${textCount}`);
        }
        if (textBlockCount > 0) {
          textBlockCountSpaces += textBlockCount;
          console.log(`    - 'textBlock' blocks: ${textBlockCount}`);
        }
      }
    }
    
    // Count in Articles collection (richText blocks)
    console.log('\n📝 Checking Articles collection...');
    const articles = await db.collection('articles').find({}).toArray();
    let textCountArticles = 0;
    let textBlockCountArticles = 0;
    
    for (const article of articles) {
      const textCount = countBlocksInDocument(article, 'text');
      const textBlockCount = countBlocksInDocument(article, 'textBlock');
      if (textCount > 0 || textBlockCount > 0) {
        console.log(`  Article: ${article.title || article.slug || article._id}`);
        if (textCount > 0) {
          textCountArticles += textCount;
          console.log(`    - 'text' blocks: ${textCount}`);
        }
        if (textBlockCount > 0) {
          textBlockCountArticles += textBlockCount;
          console.log(`    - 'textBlock' blocks: ${textBlockCount}`);
        }
      }
    }
    
    // Summary
    console.log('\n' + '='.repeat(50));
    console.log('📊 SUMMARY');
    console.log('='.repeat(50));
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
    console.log('='.repeat(50));
    
    await mongoose.disconnect();
    console.log('\n✅ Disconnected from database');
    
  } catch (error) {
    console.error('❌ Error:', error);
    await mongoose.disconnect();
    process.exit(1);
  }
}

countBlockUsage();

