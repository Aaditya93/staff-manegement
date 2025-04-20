import { Input } from "@/components/ui/input";
import { Search } from "lucide-react";
import { SearchResults } from "./SearchResults";
import { type User } from "./chat-types";
interface SearchBarProps {
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  isSearching: boolean;
  isSearchDropdownOpen: boolean;
  setIsSearchDropdownOpen: (open: boolean) => void;
  searchResults: User[];
  handleCreateConversation: (userId: string) => void;
  isCreatingConversation: boolean;
  handleClickOutside: (e: React.MouseEvent) => void;
}

export function SearchBar({
  searchQuery,
  setSearchQuery,
  isSearching,
  isSearchDropdownOpen,
  setIsSearchDropdownOpen,
  searchResults,
  handleCreateConversation,
  isCreatingConversation,
  handleClickOutside,
}: SearchBarProps) {
  return (
    <div className="p-3 relative">
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Search or start new chat"
          className="pl-9 bg-muted/30 border rounded-xl"
          value={searchQuery}
          onChange={(e) => {
            const value = e.target.value;
            setSearchQuery(value);
            if (value.length >= 2) {
              setIsSearchDropdownOpen(true);
            } else {
              setIsSearchDropdownOpen(false);
            }
          }}
          onFocus={() => {
            if (searchQuery.length >= 2) {
              setIsSearchDropdownOpen(true);
            }
          }}
        />
        {isSearching && (
          <div className="absolute right-3 top-1/2 -translate-y-1/2">
            <div className="h-4 w-4 animate-spin rounded-full border-2 border-primary border-t-transparent" />
          </div>
        )}
      </div>

      {isSearchDropdownOpen && (
        <SearchResults
          results={searchResults}
          isSearching={isSearching}
          onCreate={handleCreateConversation}
          isCreating={isCreatingConversation}
          onClickOutside={handleClickOutside}
        />
      )}
    </div>
  );
}
