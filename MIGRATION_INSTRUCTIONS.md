# Migration Instructions: Consolidating Text and TextBlock

## Overview
We're consolidating the `text` and `textBlock` blocks into a single `textBlock` block. The `textBlock` block now includes:
- H1 validation (from `text`)
- Variant field (existing in `textBlock`)
- Backward compatibility in frontend components

## Code Changes (Already Done)
✅ Added H1 validation to `TextBlock`
✅ Updated `Spaces` collection to use `TextBlock` instead of `Text`
✅ Updated `InfoOverlay` block to use `TextBlock` instead of `Text`
✅ Updated frontend components to handle both `text` and `textBlock` during migration

## Database Migration Required

### Current State
- **1 instance** of `text` block in database:
  - **Spaces collection**: "Fotostudio" space (1 block)

### Manual Migration Steps

1. **Open Payload Admin Panel**
   - Navigate to your Payload admin: `https://payload.cms.varmeverket.com/admin` (or your local admin URL)
   - Log in with your admin credentials

2. **Find the Space with the Text Block**
   - Go to **Spaces** collection
   - Find and open the **"Fotostudio"** space

3. **Locate the Text Block**
   - Scroll to the **Content** section
   - Find the block with type "Text Block" (slug: `text`)
   - Note: This is the only `text` block in your database

4. **Convert the Block**
   - Click on the Text Block to edit it
   - Copy the content from the `content` field
   - Delete the Text Block
   - Add a new **Text Block** (this will now be `textBlock` with variant support)
   - Paste the content into the new block
   - Set the variant to **"Default"** (or "Article" if appropriate)
   - Save the space

5. **Verify the Migration**
   - Run the count script to verify:
     ```bash
     node scripts/count-block-usage.mjs
     ```
   - You should see:
     - `text` blocks: **0** (was 1)
     - `textBlock` blocks: **5** (was 4, now includes the migrated one)

6. **Clean Up (After Verification)**
   - Once verified, you can delete the old `Text.ts` file:
     ```bash
     rm src/blocks/content/Text.ts
     ```
   - The frontend will continue to handle both block types for backward compatibility, but the old block won't be available in the admin anymore

## Verification Checklist

- [ ] Migrated the Text block in "Fotostudio" space to TextBlock
- [ ] Verified count script shows 0 `text` blocks
- [ ] Verified count script shows 5 `textBlock` blocks
- [ ] Tested the "Fotostudio" space page renders correctly
- [ ] Tested InfoOverlay blocks still work (if any use text blocks)
- [ ] Deleted `src/blocks/content/Text.ts` file

## Notes

- The frontend components already handle both `text` and `textBlock` block types, so existing pages will continue to work during migration
- The `textBlock` block now has H1 validation, matching the old `text` block behavior
- The variant field defaults to "default", so migrated blocks will render the same way

## Rollback (If Needed)

If you need to rollback:
1. Restore `Text.ts` file from git
2. Revert changes in `Spaces.ts` and `InfoOverlay.ts`
3. The database entry will still work since the frontend handles both types

