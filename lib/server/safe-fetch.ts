// Server-only fetch for user-supplied URLs. Blocks requests to private, loopback, link-local and
// cloud-metadata addresses (SSRF), re-checking every redirect hop.
import { lookup } from 'dns/promises';
import { isIP } from 'net';

export class UnsafeUrlError extends Error {}

function isPrivateIp(ip: string): boolean {
  if (isIP(ip) === 4) {
    const [a, b] = ip.split('.').map(Number);
    return (
      a === 0 || a === 10 || a === 127 || a >= 224 ||
      (a === 100 && b >= 64 && b <= 127) || // carrier-grade NAT
      (a === 169 && b === 254) || // link-local, incl. cloud metadata 169.254.169.254
      (a === 172 && b >= 16 && b <= 31) ||
      (a === 192 && b === 168) ||
      (a === 192 && b === 0) ||
      (a === 198 && (b === 18 || b === 19))
    );
  }
  const v = ip.toLowerCase();
  if (v === '::' || v === '::1') return true;
  if (v.startsWith('::ffff:')) return isPrivateIp(v.slice(7));
  return v.startsWith('fc') || v.startsWith('fd') || v.startsWith('fe80') || v.startsWith('ff');
}

/** Throws UnsafeUrlError unless `raw` is an http(s) URL on a standard port that resolves to public IPs only. */
export async function assertPublicUrl(raw: string): Promise<URL> {
  let url: URL;
  try {
    url = new URL(raw);
  } catch {
    throw new UnsafeUrlError('Invalid URL');
  }
  if (url.protocol !== 'http:' && url.protocol !== 'https:') throw new UnsafeUrlError('Only http(s) URLs are allowed');
  if (url.username || url.password) throw new UnsafeUrlError('URLs with credentials are not allowed');
  if (url.port && url.port !== '80' && url.port !== '443') throw new UnsafeUrlError('Non-standard ports are not allowed');

  const host = url.hostname.replace(/^\[|\]$/g, '');
  let addresses: string[];
  try {
    addresses = isIP(host) ? [host] : (await lookup(host, { all: true })).map((a) => a.address);
  } catch {
    throw new UnsafeUrlError('Host could not be resolved');
  }
  if (addresses.length === 0 || addresses.some(isPrivateIp)) throw new UnsafeUrlError('Private addresses are not allowed');
  return url;
}

/** fetch() for untrusted URLs: SSRF-checked, manual redirects (max 3), 8s timeout. */
export async function safeFetch(raw: string, init: RequestInit = {}, maxRedirects = 3): Promise<Response> {
  let current = raw;
  for (let hop = 0; ; hop++) {
    const url = await assertPublicUrl(current);
    const res = await fetch(url, { ...init, redirect: 'manual', signal: AbortSignal.timeout(8000) });
    const location = res.headers.get('location');
    if (res.status >= 300 && res.status < 400 && location) {
      if (hop >= maxRedirects) throw new UnsafeUrlError('Too many redirects');
      current = new URL(location, url).toString();
      continue;
    }
    return res;
  }
}

/** Reads at most `maxBytes` of a response body as text. */
export async function readTextLimited(res: Response, maxBytes = 1_000_000): Promise<string> {
  if (!res.body) return '';
  const reader = res.body.getReader();
  const chunks: Uint8Array[] = [];
  let size = 0;
  while (size < maxBytes) {
    const { done, value } = await reader.read();
    if (done) break;
    chunks.push(value);
    size += value.length;
  }
  reader.cancel().catch(() => {});
  return new TextDecoder().decode(Buffer.concat(chunks).subarray(0, maxBytes));
}
