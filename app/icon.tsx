import { ImageResponse } from 'next/og';

// Brand mark, also used as the Organization logo in JSON-LD and the PWA manifest icon.
export const size = { width: 512, height: 512 };
export const contentType = 'image/png';

export default function Icon() {
  return new ImageResponse(
    (
      <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', borderRadius: 112, background: 'linear-gradient(135deg, #0F3460 0%, #1a5490 100%)', color: 'white', fontSize: 320, fontWeight: 900 }}>
        R
      </div>
    ),
    size,
  );
}
