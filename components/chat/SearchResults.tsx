import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { type User } from "./chat-types";

interface SearchResultsProps {
  results: User[];
  isSearching: boolean;
  onCreate: (userId: string) => void;
  isCreating: boolean;
  onClickOutside: (e: React.MouseEvent) => void;
}

export function SearchResults({
  results,
  isSearching,
  onCreate,
  isCreating,
  onClickOutside,
}: SearchResultsProps) {
  return (
    <>
      {/* Backdrop for capturing click outside */}
      <div className="fixed inset-0 z-10" onClick={onClickOutside} />

      {/* Results dropdown */}
      <div className="absolute z-20 bg-popover shadow-md rounded-md w-full mt-1 border max-h-64 overflow-auto">
        <div className="p-2">
          <h4 className="text-sm font-medium px-2 py-1.5 text-muted-foreground">
            {isSearching ? "Searching..." : "Users"}
          </h4>

          {/* Loading state */}
          {isSearching ? (
            <div className="px-2 py-3 text-center text-sm text-muted-foreground">
              Searching for users...
            </div>
          ) : /* Empty results state */
          results.length === 0 ? (
            <div className="px-2 py-3 text-center text-sm text-muted-foreground">
              No users found
            </div>
          ) : (
            /* Results list */
            <div className="space-y-1">
              {results.map((user) => (
                <button
                  key={user._id}
                  data-search-result
                  onClick={() => onCreate(user._id)}
                  disabled={isCreating}
                  className="flex items-center gap-2 w-full p-2 hover:bg-muted rounded-md text-left"
                >
                  <Avatar className="h-8 w-8 border">
                    <AvatarImage src={user.image || ""} />
                    <AvatarFallback>
                      {user.name?.[0] || user.email[0]}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1 overflow-hidden">
                    <p className="text-sm font-medium truncate">
                      {user.name || "Unknown User"}
                    </p>
                    <p className="text-xs text-muted-foreground truncate">
                      {user.email}
                    </p>
                  </div>
                  {isCreating &&
                    user._id === localStorage.getItem("creatingUserId") && (
                      <div className="h-4 w-4 animate-spin rounded-full border-2 border-primary border-t-transparent" />
                    )}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>
    </>
  );
}
