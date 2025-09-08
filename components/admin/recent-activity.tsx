import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { formatDistanceToNow } from "date-fns"

interface Activity {
  id: string
  action: string
  details: string | null
  createdAt: Date
  user: {
    name: string | null
    email: string
  }
}

interface RecentActivityProps {
  activities: Activity[]
}

export function RecentActivity({ activities }: RecentActivityProps) {
  const getActionColor = (action: string) => {
    switch (action) {
      case "LOGIN":
        return "bg-green-100 text-green-800"
      case "REGISTER":
        return "bg-blue-100 text-blue-800"
      case "LOGOUT":
        return "bg-gray-100 text-gray-800"
      case "EXPENSE_CREATED":
        return "bg-purple-100 text-purple-800"
      case "EXPENSE_UPDATED":
        return "bg-yellow-100 text-yellow-800"
      case "EXPENSE_DELETED":
        return "bg-red-100 text-red-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg font-semibold">Recent Activity</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {activities.length === 0 ? (
            <p className="text-sm text-gray-500 text-center py-4">No recent activity</p>
          ) : (
            activities.map((activity) => (
              <div key={activity.id} className="flex items-start space-x-3">
                <Badge className={getActionColor(activity.action)}>{activity.action}</Badge>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-900">{activity.user.name || activity.user.email}</p>
                  {activity.details && <p className="text-sm text-gray-500">{activity.details}</p>}
                  <p className="text-xs text-gray-400">
                    {formatDistanceToNow(new Date(activity.createdAt), { addSuffix: true })}
                  </p>
                </div>
              </div>
            ))
          )}
        </div>
      </CardContent>
    </Card>
  )
}
