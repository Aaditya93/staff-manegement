import AppSidebar from "@/components/sidebar/app-sidebar";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";
import { Skeleton } from "@/components/ui/skeleton";
export default function Loading() {
  return (
    <div className="flex flex-1 flex-col gap-4 p-4 pt-0 mt-4 border-b ">
      <SidebarProvider>
        <AppSidebar />
        <SidebarInset>
          <Skeleton className=" ml-4 h-8 mb-4 w-80" />
          <div className="flex flex-1 flex-col gap-2 pt-0">
            <Skeleton className="ml-4 h-[1050px] w-full">
              <div className="border-b">
                {/* Header Row */}
                <div className=" border-b">
                  <Skeleton className="h-14 w-full mb-2" />
                </div>

                {/* Data Rows */}
                {[...Array(12)].map((_, rowIndex) => (
                  <div key={rowIndex} className="grid grid-cols-5 border-b">
                    {[...Array(5)].map((_, colIndex) => (
                      <div
                        key={colIndex}
                        className={`p-2 border-r last:border-r-0 ${
                          colIndex === 0 ? "col-span-1" : "col-span-1"
                        }`}
                      >
                        <Skeleton className="h-16 w-full" />
                      </div>
                    ))}
                  </div>
                ))}
              </div>
            </Skeleton>
          </div>
        </SidebarInset>
      </SidebarProvider>
    </div>
  );
}
