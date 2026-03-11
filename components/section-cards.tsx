/**
 * Dashboard stats cards component.
 * Displays key metrics: Total Events, Members, Partners, and Active Users.
 * Server component that fetches real data from the database.
 */

import { Badge } from "@/components/ui/badge"
import {
  Card,
  CardAction,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { TrendingUpIcon } from "lucide-react"
import { getDashboardStats } from "@/lib/actions/dashboard"

export async function SectionCards() {
  const stats = await getDashboardStats()

  return (
    <div className="grid grid-cols-1 gap-4 px-4 *:data-[slot=card]:bg-linear-to-t *:data-[slot=card]:from-primary/5 *:data-[slot=card]:to-card *:data-[slot=card]:shadow-xs lg:px-6 @xl/main:grid-cols-2 @5xl/main:grid-cols-4 dark:*:data-[slot=card]:bg-card">
      <Card className="@container/card">
        <CardHeader>
          <CardDescription>Total Events</CardDescription>
          <CardTitle className="text-2xl font-semibold tabular-nums @[250px]/card:text-3xl">
            {stats.totalEvents}
          </CardTitle>
          <CardAction>
            <Badge variant="outline">
              <TrendingUpIcon className="size-4" />
              CMS
            </Badge>
          </CardAction>
        </CardHeader>
        <CardFooter className="flex-col items-start gap-1.5 text-sm">
          <div className="line-clamp-1 flex gap-2 font-medium">
            Active events in system{" "}
            <TrendingUpIcon className="size-4" />
          </div>
          <div className="text-muted-foreground">
            Published and draft events
          </div>
        </CardFooter>
      </Card>
      <Card className="@container/card">
        <CardHeader>
          <CardDescription>Team Members</CardDescription>
          <CardTitle className="text-2xl font-semibold tabular-nums @[250px]/card:text-3xl">
            {stats.totalMembers}
          </CardTitle>
          <CardAction>
            <Badge variant="outline">
              <TrendingUpIcon className="size-4" />
              CMS
            </Badge>
          </CardAction>
        </CardHeader>
        <CardFooter className="flex-col items-start gap-1.5 text-sm">
          <div className="line-clamp-1 flex gap-2 font-medium">
            Featured team members{" "}
            <TrendingUpIcon className="size-4" />
          </div>
          <div className="text-muted-foreground">
            Active members on platform
          </div>
        </CardFooter>
      </Card>
      <Card className="@container/card">
        <CardHeader>
          <CardDescription>Partners</CardDescription>
          <CardTitle className="text-2xl font-semibold tabular-nums @[250px]/card:text-3xl">
            {stats.totalPartners}
          </CardTitle>
          <CardAction>
            <Badge variant="outline">
              <TrendingUpIcon className="size-4" />
              CMS
            </Badge>
          </CardAction>
        </CardHeader>
        <CardFooter className="flex-col items-start gap-1.5 text-sm">
          <div className="line-clamp-1 flex gap-2 font-medium">
            Active partners{" "}
            <TrendingUpIcon className="size-4" />
          </div>
          <div className="text-muted-foreground">Partner ecosystem</div>
        </CardFooter>
      </Card>
      <Card className="@container/card">
        <CardHeader>
          <CardDescription>Admin Users</CardDescription>
          <CardTitle className="text-2xl font-semibold tabular-nums @[250px]/card:text-3xl">
            {stats.activeUsers}
          </CardTitle>
          <CardAction>
            <Badge variant="outline">
              <TrendingUpIcon className="size-4" />
              Active
            </Badge>
          </CardAction>
        </CardHeader>
        <CardFooter className="flex-col items-start gap-1.5 text-sm">
          <div className="line-clamp-1 flex gap-2 font-medium">
            Active admin users{" "}
            <TrendingUpIcon className="size-4" />
          </div>
          <div className="text-muted-foreground">Team accounts</div>
        </CardFooter>
      </Card>
    </div>
  )
}
