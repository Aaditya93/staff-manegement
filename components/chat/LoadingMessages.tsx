export function LoadingMessages() {
  return (
    <div className="flex flex-col items-center justify-center h-full space-y-6">
      <div className="flex flex-col space-y-3 w-full max-w-md">
        {/* Loading animation with pulsing chat bubbles */}
        <div className="flex justify-start">
          <div className="bg-secondary/40 animate-pulse h-10 w-48 rounded-2xl rounded-bl-none"></div>
        </div>
        <div className="flex justify-end">
          <div className="bg-primary/40 animate-pulse h-10 w-32 rounded-2xl rounded-br-none"></div>
        </div>
        <div className="flex justify-start">
          <div className="bg-secondary/40 animate-pulse h-10 w-40 rounded-2xl rounded-bl-none"></div>
        </div>
        <div className="flex justify-end">
          <div className="bg-primary/40 animate-pulse h-10 w-56 rounded-2xl rounded-br-none"></div>
        </div>
      </div>
      <div className="flex items-center space-x-2">
        <div
          className="h-3 w-3 bg-primary/60 rounded-full animate-bounce"
          style={{ animationDelay: "0ms" }}
        ></div>
        <div
          className="h-3 w-3 bg-primary/60 rounded-full animate-bounce"
          style={{ animationDelay: "150ms" }}
        ></div>
        <div
          className="h-3 w-3 bg-primary/60 rounded-full animate-bounce"
          style={{ animationDelay: "300ms" }}
        ></div>
      </div>
    </div>
  );
}
