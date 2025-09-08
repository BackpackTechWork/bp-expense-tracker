import { notFound } from "next/navigation"
import { prisma } from "@/lib/prisma"
import { UserDetails } from "@/components/admin/user-details"

interface UserDetailPageProps {
  params: {
    userId: string
  }
}

export default async function UserDetailPage({ params }: UserDetailPageProps) {
  const user = await prisma.user.findUnique({
    where: { id: params.userId },
    include: {
      expenses: {
        orderBy: { createdAt: "desc" },
        take: 10,
        include: {
          category: true,
        },
      },
      activityLogs: {
        orderBy: { createdAt: "desc" },
        take: 20,
      },
      _count: {
        select: {
          expenses: true,
          activityLogs: true,
        },
      },
    },
  })

  if (!user) {
    notFound()
  }

  return (
    <div className="space-y-6">
      <UserDetails user={user} />
    </div>
  )
}
