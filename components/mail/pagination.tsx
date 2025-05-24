"use client";
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";
import { useRouter, usePathname } from "next/navigation";

const PaginationComponent = ({
  hasMore = true, // This can be passed as a prop since it can't be determined from URL
  itemsPerPage = 20, // Default items per page
}: {
  hasMore?: boolean;
  itemsPerPage?: number;
}) => {
  const router = useRouter();
  const pathname = usePathname();

  // Extract values from the URL path
  // Expected format: /mail/[inboxNumber]/[folder]/[status]/[range]
  const pathParts = pathname.split("/").filter(Boolean);

  // Extract values from path parts
  const inboxNumber =
    pathParts.length > 1 ? parseInt(pathParts[1], 10) || 0 : 0;
  const folder = pathParts.length > 2 ? pathParts[2] : "inbox";
  const status = pathParts.length > 3 ? pathParts[3] : "all";
  const range = pathParts.length > 4 ? parseInt(pathParts[4], 10) || 0 : 0;

  // Calculate the current page based on range value
  const currentPage = Math.floor(range / itemsPerPage) + 1;

  // Determine if we should show navigation buttons
  const showPrevious = currentPage > 1;
  const showNext = hasMore;

  // Generate page numbers to display
  const getPageNumbers = () => {
    const pages = [];
    const startPage = Math.max(1, currentPage - 1);
    const endPage = Math.min(currentPage + 1, currentPage + (hasMore ? 1 : 0));

    for (let i = startPage; i <= endPage; i++) {
      if (i > 0) {
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

  // Handle navigation programmatically
  const handleNavigation = (page: number) => {
    const url = getPageUrl(page);
    router.push(url);
  };

  return (
    <Pagination className="justify-end w-full">
      <PaginationContent>
        <PaginationItem>
          <PaginationPrevious
            href={showPrevious ? getPageUrl(currentPage - 1) : "#"}
            onClick={(e) => {
              if (!showPrevious) {
                e.preventDefault();
                return;
              }
              e.preventDefault();
              handleNavigation(currentPage - 1);
            }}
            aria-disabled={!showPrevious}
            className={!showPrevious ? "pointer-events-none opacity-50" : ""}
          />
        </PaginationItem>

        {getPageNumbers().map((pageNumber) => (
          <PaginationItem key={pageNumber}>
            <PaginationLink
              href={getPageUrl(pageNumber)}
              onClick={(e) => {
                e.preventDefault();
                handleNavigation(pageNumber);
              }}
              isActive={currentPage === pageNumber}
            >
              {pageNumber}
            </PaginationLink>
          </PaginationItem>
        ))}

        {hasMore && (
          <PaginationItem>
            <PaginationEllipsis />
          </PaginationItem>
        )}

        <PaginationItem>
          <PaginationNext
            href={showNext ? getPageUrl(currentPage + 1) : "#"}
            onClick={(e) => {
              if (!showNext) {
                e.preventDefault();
                return;
              }
              e.preventDefault();
              handleNavigation(currentPage + 1);
            }}
            aria-disabled={!showNext}
            className={!showNext ? "pointer-events-none opacity-50" : ""}
          />
        </PaginationItem>
      </PaginationContent>
    </Pagination>
  );
};

export default PaginationComponent;
