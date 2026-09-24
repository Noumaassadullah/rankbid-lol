interface PaginationProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
}

export default function Pagination({ currentPage, totalPages, onPageChange }: PaginationProps) {
  const pages = [];
  const maxPagesToShow = 3;

  // Show numbered pages (1, 2, 3, etc.)
  for (let i = 1; i <= Math.min(maxPagesToShow, totalPages); i++) {
    pages.push(
      <button
        key={i}
        onClick={() => onPageChange(i)}
        className={`w-10 h-10 font-bold border-2 rounded-lg transition-all ${
          i === currentPage
            ? 'bg-[#0F3460] text-white border-[#0F3460]'
            : 'border-gray-300 text-[#1F2937] hover:border-[#0F3460] hover:bg-[#0F3460] hover:text-white'
        }`}
      >
        {i}
      </button>
    );
  }

  return (
    <div className="flex gap-3 justify-center items-center mt-8 sm:mt-12 flex-wrap">
      {pages}

      {currentPage < totalPages && (
        <button
          onClick={() => onPageChange(currentPage + 1)}
          className="px-4 sm:px-6 py-2 font-bold border-2 border-[#0F3460] text-[#0F3460] rounded-lg hover:bg-[#0F3460] hover:text-white transition-all active:scale-95"
        >
          Show More →
        </button>
      )}
    </div>
  );
}
