import type { Metadata } from 'next';
import ProductView from '@/components/ProductView';
import JsonLd from '@/components/JsonLd';
import { getListingById, getRankedListings } from '@/lib/server/listings';
import { categoryPath, getCategoryLabel } from '@/lib/categories';
import { absoluteUrl, breadcrumbSchema, pageMetadata } from '@/lib/seo';

type Props = { params: Promise<{ id: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params;
  const product = await getListingById(id);
  if (!product) {
    return pageMetadata({ title: 'Product not found', description: 'This product is not listed on RankBid.', path: `/product/${id}`, noindex: true });
  }

  const category = getCategoryLabel(product.category);
  const summary = product.description ? `${product.description.slice(0, 110).trim()}. ` : '';
  return pageMetadata({
    title: `${product.title}: ${category} ranking & votes`,
    description: `${summary}${product.title} has ${product.totalVotes} community votes on RankBid. See its live rank in ${category} and vote for free.`,
    path: `/product/${product.id}`,
  });
}

export default async function ProductPage({ params }: Props) {
  const { id } = await params;
  const [product, allListings] = await Promise.all([getListingById(id), getRankedListings()]);

  return (
    <>
      {product && (
        <JsonLd
          data={[
            breadcrumbSchema([
              { name: 'Categories', path: '/categories' },
              { name: getCategoryLabel(product.category), path: categoryPath(product.category) },
              { name: product.title, path: `/product/${product.id}` },
            ]),
            {
              '@type': 'WebPage',
              '@id': absoluteUrl(`/product/${product.id}`),
              name: product.title,
              description: product.description || undefined,
              datePublished: product.createdAt,
              dateModified: product.updatedAt,
              isPartOf: { '@id': absoluteUrl('/#website') },
              about: {
                '@type': 'Thing',
                name: product.title,
                ...(product.platform === 'website' && /^https?:\/\//.test(product.url) && { url: product.url }),
              },
            },
          ]}
        />
      )}
      <ProductView key={id} id={id} initialProduct={product} initialAllListings={allListings} />
    </>
  );
}
