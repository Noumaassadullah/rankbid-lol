interface VerifiedBadgeProps {
  tier: 'verified' | 'professional';
  size?: 'sm' | 'md' | 'lg';
}

export default function VerifiedBadge({ tier, size = 'md' }: VerifiedBadgeProps) {
  const sizeClasses = {
    sm: 'w-4 h-4',
    md: 'w-5 h-5',
    lg: 'w-6 h-6',
  };

  const tooltips = {
    verified: 'Verified User - Active for 2+ weeks',
    professional: 'Professional User - Active and Getting Deals',
  };

  return (
    <div
      className="flex items-center justify-center"
      title={tooltips[tier]}
    >
      <svg
        className={`${sizeClasses[size]} text-blue-500`}
        viewBox="0 0 24 24"
        fill="currentColor"
      >
        <circle cx="12" cy="12" r="11" fill="none" stroke="currentColor" strokeWidth="2" />
        <path d="M9 12l2 2 4-4" stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    </div>
  );
}
