interface PaginationProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
}

export default function Pagination({ currentPage, totalPages, onPageChange }: PaginationProps) {
  const pages = [];
  const maxPagesToShow = 5;

  let startPage = Math.max(1, currentPage - Math.floor(maxPagesToShow / 2));
  let endPage = Math.min(totalPages, startPage + maxPagesToShow - 1);

  if (endPage - startPage < maxPagesToShow - 1) {
    startPage = Math.max(1, endPage - maxPagesToShow + 1);
  }

  if (startPage > 1) {
    pages.push(
      <button
        key="first"
        onClick={() => onPageChange(1)}
        className="px-4 py-2 font-black border-2 border-black hover:bg-black hover:text-white transition-all"
      >
        « First
      </button>
    );
  }

  if (startPage > 1) {
    pages.push(
      <span key="dots-start" className="px-2 py-2 text-black font-bold">...</span>
    );
  }

  for (let i = startPage; i <= endPage; i++) {
    pages.push(
      <button
        key={i}
        onClick={() => onPageChange(i)}
        className={`px-4 py-2 font-black border-2 transition-all ${
          i === currentPage
            ? 'bg-black text-white border-black'
            : 'border-black text-black hover:bg-black hover:text-white'
        }`}
      >
        {i}
      </button>
    );
  }

  if (endPage < totalPages) {
    pages.push(
      <span key="dots-end" className="px-2 py-2 text-black font-bold">...</span>
    );
  }

  if (endPage < totalPages) {
    pages.push(
      <button
        key="last"
        onClick={() => onPageChange(totalPages)}
        className="px-4 py-2 font-black border-2 border-black hover:bg-black hover:text-white transition-all"
      >
        Last »
      </button>
    );
  }

  return (
    <div className="flex gap-2 justify-center items-center mt-12 flex-wrap">
      {pages}
    </div>
  );
}
