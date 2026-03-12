/**
 * Dashboard overview page.
 * Displays summary statistics, charts, and recent activity.
 * Protected by authentication via middleware and dashboard layout.
 */

import { Suspense } from "react"
// import { ChartAreaInteractive } from "@/components/chart-area-interactive"
// import { DataTable } from "@/components/data-table"
import { SectionCards, SectionCardsSkeleton } from "@/components/section-cards"

export default function DashboardPage() {
  return (
    <div className="flex flex-1 flex-col">
      <div className="@container/main flex flex-1 flex-col gap-2">
        <div className="flex flex-col gap-4 py-4 md:gap-6 md:py-6">
          <Suspense fallback={<SectionCardsSkeleton />}>
            <SectionCards />
          </Suspense>
          {/* <div className="px-4 lg:px-6">
            <ChartAreaInteractive />
          </div> */}
          {/* <DataTable data={[]} /> */}
        </div>
      </div>
    </div>
  )
}
