import { ImageResponse } from 'next/og';
import { getListingById, getRankedListings } from '@/lib/server/listings';
import { getCategoryLabel } from '@/lib/categories';

export const alt = 'Product ranking on RankBid';
export const size = { width: 1200, height: 630 };
export const contentType = 'image/png';

// Share card for a product: title, category, live rank and votes.
export default async function Image({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const [product, all] = await Promise.all([getListingById(id), getRankedListings()]);
  const rank = product && product.totalVotes > 0 ? all.findIndex(l => l.id === product.id) + 1 : 0;
  const title = product?.title ?? 'RankBid';

  return new ImageResponse(
    (
      <div
        style={{
          width: '100%', height: '100%', display: 'flex', flexDirection: 'column', justifyContent: 'space-between',
          padding: 72, color: 'white', background: 'linear-gradient(135deg, #0B2545 0%, #0F3460 55%, #1a5490 100%)',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 18 }}>
          <div style={{ width: 60, height: 60, borderRadius: 16, background: 'white', color: '#0F3460', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 36, fontWeight: 900 }}>R</div>
          <div style={{ fontSize: 36, fontWeight: 900 }}>RankBid</div>
          {product && (
            <div style={{ marginLeft: 'auto', fontSize: 26, padding: '8px 22px', borderRadius: 999, background: 'rgba(255,255,255,0.15)' }}>
              {getCategoryLabel(product.category)}
            </div>
          )}
        </div>
        <div style={{ fontSize: title.length > 40 ? 64 : 88, fontWeight: 900, lineHeight: 1.05, letterSpacing: -2, display: 'flex' }}>
          {title.length > 80 ? `${title.slice(0, 77)}...` : title}
        </div>
        <div style={{ display: 'flex', gap: 28 }}>
          {[
            { label: 'RANK', value: rank ? `#${rank}` : 'New', color: '#FCD34D' },
            { label: 'VOTES', value: String(product?.totalVotes ?? 0), color: '#6EE7B7' },
          ].map(stat => (
            <div key={stat.label} style={{ display: 'flex', flexDirection: 'column', padding: '18px 32px', borderRadius: 24, background: 'rgba(255,255,255,0.1)', border: '1px solid rgba(255,255,255,0.2)' }}>
              <div style={{ fontSize: 20, letterSpacing: 3, color: 'rgba(255,255,255,0.6)' }}>{stat.label}</div>
              <div style={{ fontSize: 64, fontWeight: 900, color: stat.color }}>{stat.value}</div>
            </div>
          ))}
        </div>
      </div>
    ),
    size,
  );
}
