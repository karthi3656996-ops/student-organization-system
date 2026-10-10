import { redirect } from "next/navigation";
import { getSessionFromCookie } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import AdminDashboard from "@/components/admin/admin-dashboard";


export default async function AdminPage() {
  const session = await getSessionFromCookie();

  if (!session) redirect("/admin/login");
  if (session.role !== "ADMIN" && session.role !== "TREASURER" && session.role !== "EVENT_LEAD") {
    redirect("/admin/login?error=unauthorized");
  }

  // Fetch all dashboard stats server-side for initial load
  const [
    totalMembers,
    activeMembers,
    pendingMembers,
    totalEvents,
    publishedEvents,
    pendingClaims,
    totalOrders,
    incomeAgg,
    expenseAgg,
    recentTransactions,
    recentMembers,
  ] = await Promise.all([
    prisma.member.count(),
    prisma.member.count({ where: { status: "ACTIVE" } }),
    prisma.member.count({ where: { status: "PENDING_PAYMENT" } }),
    prisma.event.count(),
    prisma.event.count({ where: { status: "PUBLISHED" } }),
    prisma.reimbursementClaim.count({ where: { status: "SUBMITTED" } }),
    prisma.merchOrder.count(),
    prisma.financialTransaction.aggregate({ where: { type: "INCOME" }, _sum: { amount: true } }),
    prisma.financialTransaction.aggregate({ where: { type: "EXPENSE" }, _sum: { amount: true } }),
    prisma.financialTransaction.findMany({
      orderBy: { recordedAt: "desc" },
      take: 10,
    }),
    prisma.member.findMany({
      include: { user: { select: { name: true, email: true } } },
      orderBy: { createdAt: "desc" },
      take: 8,
    }),
  ]);

  const totalIncome = Number(incomeAgg._sum.amount ?? 0);
  const totalExpense = Number(expenseAgg._sum.amount ?? 0);

  const stats = {
    totalMembers,
    activeMembers,
    pendingMembers,
    totalEvents,
    publishedEvents,
    pendingClaims,
    totalOrders,
    totalIncome,
    totalExpense,
    balance: totalIncome - totalExpense,
  };

  const formattedTransactions = recentTransactions.map((t) => ({
    id: t.id,
    transactionNumber: t.transactionNumber,
    type: t.type as "INCOME" | "EXPENSE",
    sourceModule: t.sourceModule,
    amount: Number(t.amount),
    description: t.description,
    recordedAt: t.recordedAt.toISOString(),
  }));

  const formattedMembers = recentMembers.map((m) => ({
    id: m.id,
    studentId: m.studentId,
    name: m.user.name,
    email: m.user.email,
    department: m.department,
    status: m.status,
    createdAt: m.createdAt.toISOString(),
  }));

  return (
    <AdminDashboard
      adminName={session.name}
      adminRole={session.role}
      stats={stats}
      recentTransactions={formattedTransactions}
      recentMembers={formattedMembers}
    />
  );
}

