interface ShareButtonProps {
  url: string;
  title: string;
}

export default function ShareButton({ url, title }: ShareButtonProps) {
  const handleShare = (platform: 'twitter' | 'linkedin' | 'copy') => {
    if (platform === 'twitter') {
      const twitterUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(title)}&url=${encodeURIComponent(url)}`;
      window.open(twitterUrl, '_blank');
    } else if (platform === 'linkedin') {
      const linkedinUrl = `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(url)}`;
      window.open(linkedinUrl, '_blank');
    } else if (platform === 'copy') {
      navigator.clipboard.writeText(url);
      alert('📋 Link copied!');
    }
  };

  return (
    <div className="flex gap-2">
      <button
        onClick={() => handleShare('twitter')}
        title="Share on Twitter"
        className="p-2 text-gray-600 hover:text-blue-400 transition-colors"
      >
        𝕏
      </button>
      <button
        onClick={() => handleShare('linkedin')}
        title="Share on LinkedIn"
        className="p-2 text-gray-600 hover:text-blue-700 transition-colors"
      >
        🔗
      </button>
      <button
        onClick={() => handleShare('copy')}
        title="Copy link"
        className="p-2 text-gray-600 hover:text-gray-900 transition-colors"
      >
        📋
      </button>
    </div>
  );
}
