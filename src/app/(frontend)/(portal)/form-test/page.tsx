import { notFound } from 'next/navigation';
import PayloadAPI from '@/lib/api';
import { ArticleHeader } from '@/components/headers';
import FormBlock from '@/components/blocks/interactive/FormBlock';
import PageLayout from '@/components/layout/PageLayout';

/**
 * Renders a CMS form in article context (header + content area + form under content).
 * Use: /form-test?form=your-form-slug (e.g. /form-test?form=contact)
 */
export default async function FormTestPage({
  searchParams,
}: {
  searchParams: Promise<{ form?: string }>;
}) {
  const { form: formSlug } = await searchParams;
  if (!formSlug) {
    return (
      <PageLayout contentType="page">
        <div className="max-w-2xl mx-auto px-4 py-12">
          <h1 className="text-xl font-semibold mb-4">Form test</h1>
          <p className="text-sm text-neutral-600 dark:text-neutral-400">
            Add a form slug to the URL to render it in article context, e.g.:{' '}
            <code className="bg-black/5 dark:bg-white/5 px-1 rounded">
              /form-test?form=your-form-slug
            </code>
          </p>
          <p className="text-sm text-neutral-500 dark:text-neutral-500 mt-2">
            Create forms in Payload admin (Content → Forms) and use their slug
            here. The form will appear under content as in an article.
          </p>
        </div>
      </PageLayout>
    );
  }

  const result = await PayloadAPI.find<{
    id: string;
    slug?: string;
    [key: string]: unknown;
  }>({
    collection: 'forms',
    where: { slug: { equals: formSlug } },
    limit: 1,
    depth: 5,
  });

  const formDoc = result.docs[0];
  if (!formDoc) {
    notFound();
  }

  const articleData = {
    title: 'Form test',
    author: { email: 'dev@local' },
    publishedDate: new Date().toISOString(),
  };

  return (
    <PageLayout contentType="article">
      <ArticleHeader articleData={articleData} />

      {/* Placeholder content (same slot as article body) */}
      <main className="relative max-w-2xl mx-auto px-4 pb-8">
        <p className="text-sm text-neutral-500 dark:text-neutral-500">
          Form below is rendered in the same position as when you add a form
          reference to an article (under content).
        </p>
      </main>

      {/* Form under content (article form reference) */}
      <FormBlock form={formDoc} />

      <footer className="font-mono mx-auto w-full max-w-2xl px-4 -mt-24 pt-8">
        ———
        <div className="text-sm text-neutral-500">Form test page</div>
      </footer>
    </PageLayout>
  );
}
