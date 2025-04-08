import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";

const PaginationComponent = ({
  currentValue,
  itemsPerPage = 10,
  maxPage = 3,
  hasMore = true,
  status,
  folder,
  inboxNumber,
}: {
  currentValue: string | number;
  itemsPerPage?: number;
  maxPage?: number;
  hasMore?: boolean;
  status?: string;
  folder?: string;
  inboxNumber?: number;
}) => {
  // Parse currentValue to ensure it's a number (it comes as a string from URL)
  const parsedCurrentValue =
    typeof currentValue === "string"
      ? parseInt(currentValue, 10) || 0
      : currentValue || 0;

  // Calculate the current page - ensure it's at least 1
  const currentPage = Math.max(1, Math.ceil(parsedCurrentValue / itemsPerPage));

  // Determine if we should show navigation buttons
  const showPrevious = currentPage > 1;
  const showNext = hasMore;

  // Generate page numbers to display
  const getPageNumbers = () => {
    const pages = [];
    // We'll show a window around the current page
    const startPage = Math.max(1, currentPage - 1);
    const endPage = currentPage + 1;

    for (let i = startPage; i <= endPage; i++) {
      if (i > 0 && (hasMore || i <= currentPage)) {
        pages.push(i);
      }
    }

    return pages;
  };

  // Generate URL for a specific page
  const getPageUrl = (page: number) => {
    // Calculate the actual range value based on page number
    const rangeValue = (page - 1) * itemsPerPage;
    return `/mail/${inboxNumber}/${folder}/${status}/${rangeValue}`;
  };

  return (
    <Pagination className="justify-end w-full">
      <PaginationContent>
        {showPrevious && (
          <PaginationItem>
            <PaginationPrevious
              href={getPageUrl(currentPage - 1)}
              aria-disabled={!showPrevious}
            />
          </PaginationItem>
        )}

        {getPageNumbers().map((pageNumber) => (
          <PaginationItem key={pageNumber}>
            <PaginationLink
              href={getPageUrl(pageNumber)}
              isActive={currentPage === pageNumber}
            >
              {pageNumber}
            </PaginationLink>
          </PaginationItem>
        ))}

        {hasMore && (
          <PaginationItem>
            <PaginationNext href={getPageUrl(currentPage + 1)} />
          </PaginationItem>
        )}
      </PaginationContent>
    </Pagination>
  );
};

export default PaginationComponent;
