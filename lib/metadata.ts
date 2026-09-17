export interface URLMetadata {
  title: string;
  description: string;
  image: string | null;
  platform: string;
  category: string;
  followers?: string;
  posts?: string;
}

export async function extractMetadata(url: string): Promise<URLMetadata> {
  try {
    // Detect platform from URL
    const urlObj = new URL(url);
    const hostname = urlObj.hostname.toLowerCase();

    let platform = 'website';
    let category = 'Other';

    if (hostname.includes('linkedin.com')) {
      platform = 'linkedin';
      category = 'Technology';
    } else if (hostname.includes('twitter.com') || hostname.includes('x.com')) {
      platform = 'twitter';
      category = 'Technology';
    } else if (hostname.includes('facebook.com')) {
      platform = 'facebook';
      category = 'Technology';
    } else if (hostname.includes('instagram.com')) {
      platform = 'instagram';
      category = 'Technology';
    } else if (hostname.includes('tiktok.com')) {
      platform = 'tiktok';
      category = 'Technology';
    } else if (hostname.includes('github.com')) {
      platform = 'website';
      category = 'Developer';
    } else if (hostname.includes('youtube.com') || hostname.includes('youtu.be')) {
      platform = 'website';
      category = 'Technology';
    }

    // Fetch metadata from the URL
    let title = url.split('/').pop() || 'Listing';
    let description = '';
    let image: string | null = null;
    let followers: string | undefined;
    let posts: string | undefined;

    try {
      const response = await fetch(url, {
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
        }
      });

      if (response.ok) {
        const html = await response.text();

        // Extract Open Graph metadata
        const ogTitleMatch = html.match(/<meta\s+property=["']og:title["']\s+content=["']([^"']+)["']/i);
        const ogDescMatch = html.match(/<meta\s+property=["']og:description["']\s+content=["']([^"']+)["']/i);
        const ogImageMatch = html.match(/<meta\s+property=["']og:image["']\s+content=["']([^"']+)["']/i);

        // Fallback to regular meta tags
        const metaTitleMatch = html.match(/<meta\s+name=["']title["']\s+content=["']([^"']+)["']/i);
        const metaDescMatch = html.match(/<meta\s+name=["']description["']\s+content=["']([^"']+)["']/i);

        // Extract title from h1 if no meta title
        const h1Match = html.match(/<h1[^>]*>([^<]+)<\/h1>/i);

        if (ogTitleMatch?.[1]) title = ogTitleMatch[1];
        else if (metaTitleMatch?.[1]) title = metaTitleMatch[1];
        else if (h1Match?.[1]) title = h1Match[1];

        if (ogDescMatch?.[1]) description = ogDescMatch[1];
        else if (metaDescMatch?.[1]) description = metaDescMatch[1];

        if (ogImageMatch?.[1]) image = ogImageMatch[1];

        // Extract platform-specific data
        if (platform === 'instagram') {
          // Try to extract followers and posts from Instagram profile
          const followersMatch = html.match(/([0-9.,]+)\s*(?:follower|followers)/i);
          const postsMatch = html.match(/([0-9.,]+)\s*(?:post|posts)/i);
          if (followersMatch?.[1]) followers = followersMatch[1];
          if (postsMatch?.[1]) posts = postsMatch[1];
        }

        // Make relative image URLs absolute
        if (image && !image.startsWith('http')) {
          const protocol = urlObj.protocol;
          const host = urlObj.host;
          image = image.startsWith('/') ? `${protocol}//${host}${image}` : `${protocol}//${host}/${image}`;
        }
      }
    } catch (fetchError) {
      console.warn('Error fetching URL metadata:', fetchError);
    }

    // Fallback to favicon if no image found
    if (!image) {
      image = `https://www.google.com/s2/favicons?domain=${hostname}&sz=256`;
    }

    // Clean up title and description
    title = title.replace(/&amp;/g, '&').replace(/&quot;/g, '"').replace(/&lt;/g, '<').replace(/&gt;/g, '>').substring(0, 100);
    description = description.replace(/&amp;/g, '&').replace(/&quot;/g, '"').substring(0, 160);

    return {
      title,
      description,
      image,
      platform,
      category,
      followers,
      posts,
    };
  } catch (error) {
    console.error('Error in extractMetadata:', error);
    return {
      title: 'Listing',
      description: '',
      image: null,
      platform: 'website',
      category: 'Other',
    };
  }
}
