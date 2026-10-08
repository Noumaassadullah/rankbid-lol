// Renders schema.org nodes as one JSON-LD @graph. "<" is escaped so user-submitted
// titles can't close the script tag.
export default function JsonLd({ data }: { data: object | object[] }) {
  const graph = Array.isArray(data) ? data : [data];
  const json = JSON.stringify({ '@context': 'https://schema.org', '@graph': graph }).replace(/</g, '\\u003c');
  return <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: json }} />;
}
