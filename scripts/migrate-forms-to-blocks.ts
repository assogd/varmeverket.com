/**
 * Migrate legacy Payload form data (fields / sections) into the new blocks-based
 * `content` structure. Non-destructive: does not remove legacy keys.
 *
 * Usage:
 *   npm run migrate:forms:inspect   # list forms with legacy data
 *   npm run migrate:forms:dry-run   # show what would be migrated
 *   npm run migrate:forms           # run migration (loads .env from project root)
 *
 * Uses DATABASE_URI and PAYLOAD_SECRET from .env.
 */

import path from 'path';
import { fileURLToPath } from 'url';
const __dirname = path.dirname(fileURLToPath(import.meta.url));
// Load .env from project root before any Payload code
import { config as loadEnv } from 'dotenv';
loadEnv({ path: path.resolve(__dirname, '..', '.env') });
loadEnv({ path: path.resolve(__dirname, '..', '.env.local') });

import { getPayload } from 'payload';

const DRY_RUN = process.argv.includes('--dry-run');
const INSPECT_ONLY = process.argv.includes('--inspect');

// Legacy field type (from form builder / FormBlock CMSFormField) -> block slug
const FIELD_TYPE_TO_BLOCK: Record<string, string> = {
  text: 'formFieldText',
  textarea: 'formFieldTextarea',
  email: 'formFieldEmail',
  select: 'formFieldSelect',
  checkbox: 'formFieldCheckbox',
  number: 'formFieldNumber',
  state: 'formFieldState',
  country: 'formFieldCountry',
  message: 'formFieldMessage',
  date: 'formFieldDate',
  tel: 'formFieldTel',
  url: 'formFieldUrl',
};

interface LegacyField {
  name?: string;
  label?: string;
  fieldType?: string;
  required?: boolean;
  defaultValue?: string | number | boolean;
  placeholder?: string;
  helpText?: string;
  options?: Array<{ label: string; value: string }>;
  width?: number;
}

interface LegacySection {
  id?: string;
  title?: string;
  fields?: LegacyField[];
}

interface FormDoc {
  id: string;
  title?: string;
  slug?: string;
  content?: unknown[];
  fields?: LegacyField[];
  sections?: LegacySection[];
  [key: string]: unknown;
}

function legacyFieldToBlock(f: LegacyField): Record<string, unknown> | null {
  const fieldType = (f.fieldType || 'text').toLowerCase();
  const blockType = FIELD_TYPE_TO_BLOCK[fieldType];
  if (!blockType) {
    return null;
  }
  const block: Record<string, unknown> = {
    blockType,
    name: f.name ?? '',
    label: f.label ?? '',
    required: Boolean(f.required),
    placeholder: f.placeholder,
    helpText: f.helpText,
    defaultValue: f.defaultValue,
  };
  if (fieldType === 'select' && Array.isArray(f.options)) {
    block.options = f.options;
  }
  if (fieldType === 'date') {
    if (typeof (f as { minYear?: number }).minYear === 'number') {
      block.minYear = (f as { minYear?: number }).minYear;
    }
    if (typeof (f as { maxYear?: number }).maxYear === 'number') {
      block.maxYear = (f as { maxYear?: number }).maxYear;
    }
  }
  return block;
}

function legacySectionsAndFieldsToContent(
  sections?: LegacySection[],
  fields?: LegacyField[]
): Record<string, unknown>[] {
  const content: Record<string, unknown>[] = [];

  if (sections && sections.length > 0) {
    for (const sec of sections) {
      const sectionFields: Record<string, unknown>[] = [];
      for (const f of sec.fields ?? []) {
        const b = legacyFieldToBlock(f);
        if (b) sectionFields.push(b);
      }
      content.push({
        blockType: 'formSection',
        title: sec.title ?? '',
        fields: sectionFields,
      });
    }
    return content;
  }

  if (fields && fields.length > 0) {
    for (const f of fields) {
      const b = legacyFieldToBlock(f);
      if (b) content.push(b);
    }
  }

  return content;
}

async function main() {
  const configModule = await import('../src/payload.config');
  const payloadConfig = configModule.default;

  const payload = await getPayload({ config: payloadConfig });
  const { docs } = await payload.find({
    collection: 'forms',
    limit: 500,
    depth: 0,
  });

  const forms = docs as FormDoc[];
  const withLegacy = forms.filter(
    (f) =>
      (Array.isArray(f.fields) && f.fields.length > 0) ||
      (Array.isArray(f.sections) && f.sections.length > 0)
  );

  if (INSPECT_ONLY) {
    console.log('Forms with legacy fields/sections:', withLegacy.length);
    for (const f of withLegacy) {
      const fieldCount = f.fields?.length ?? 0;
      const sectionCount = f.sections?.length ?? 0;
      const contentCount = Array.isArray(f.content) ? f.content.length : 0;
      console.log(
        `  id=${f.id} slug=${f.slug ?? '-'} title=${f.title ?? '-'} fields=${fieldCount} sections=${sectionCount} contentBlocks=${contentCount}`
      );
    }
    process.exit(0);
    return;
  }

  if (withLegacy.length === 0) {
    console.log('No forms with legacy fields/sections found.');
    process.exit(0);
    return;
  }

  const toMigrate = withLegacy.filter((f) => {
    const hasContent = Array.isArray(f.content) && f.content.length > 0;
    return !hasContent;
  });

  console.log(
    `Found ${withLegacy.length} form(s) with legacy data; ${toMigrate.length} need migration (no content blocks yet).`
  );

  for (let i = 0; i < toMigrate.length; i++) {
    const form = toMigrate[i];
    const content = legacySectionsAndFieldsToContent(form.sections, form.fields);
    if (content.length === 0) {
      console.log(`  Skip ${form.slug ?? form.id}: no blocks produced`);
      continue;
    }

    if (DRY_RUN) {
      console.log(`  [DRY-RUN] Would set content (${content.length} blocks) on form ${form.slug ?? form.id}`);
      if (i === 0) {
        console.log('  Sample content (first form):', JSON.stringify(content.slice(0, 2), null, 2));
      }
      continue;
    }

    try {
      await payload.update({
        collection: 'forms',
        id: form.id,
        data: { content },
      });
      console.log(`  Migrated ${form.slug ?? form.id} (${content.length} blocks)`);
    } catch (err) {
      console.error(`  Failed to update form ${form.slug ?? form.id}:`, err);
    }
  }

  console.log('Done.');
  process.exit(0);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
