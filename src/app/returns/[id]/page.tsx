import Link from "next/link"
import { redirect, notFound } from "next/navigation"
import { ArrowLeft, Package, RefreshCw, ShieldCheck } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import { getCurrentUser } from "@/lib/auth/supabase-auth"
import { getReturnById } from "@/lib/db/queries"
import { ReturnStatusBadge } from "@/components/returns/return-status-badge"
import { ReturnTimeline } from "@/components/returns/return-timeline"
import type { ReturnAnalysis } from "@/app/api/returns/analyze/route"

interface ReturnDetailPageProps {
  params: Promise<{ id: string }>
}

export default async function ReturnDetailPage({
  params,
}: ReturnDetailPageProps) {
  const user = await getCurrentUser()
  if (!user) {
    redirect("/login")
  }

  const { id } = await params
  const returnRecord = await getReturnById(id, user.id)

  if (!returnRecord) {
    notFound()
  }

  const analysis = (returnRecord.ai_analysis ?? {}) as Partial<ReturnAnalysis>

  return (
    <main className="flex-1 px-4 py-8 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-4xl">
        <Link href="/returns">
          <Button variant="ghost" size="sm" className="mb-6 rounded-full">
            <ArrowLeft className="mr-2 size-4" />
            Back to returns
          </Button>
        </Link>

        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="font-heading text-3xl font-bold">
              Return #{returnRecord.id.slice(0, 8)}
            </h1>
            <p className="mt-1 text-sm text-muted-foreground">
              Submitted on{" "}
              {new Date(returnRecord.created_at).toLocaleDateString()}
            </p>
          </div>
          <ReturnStatusBadge status={returnRecord.status} />
        </div>

        <div className="surface-bento mt-8">
          <h2 className="font-heading text-lg font-bold">Status Timeline</h2>
          <div className="mt-6">
            <ReturnTimeline status={returnRecord.status} />
          </div>
        </div>

        <div className="mt-8 grid gap-8 lg:grid-cols-3">
          <div className="lg:col-span-2 space-y-6">
            <div className="surface-bento">
              <h2 className="font-heading text-lg font-bold">
                Return Details
              </h2>
              <div className="mt-4 space-y-3">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Order ID</span>
                  <span className="font-medium">
                    #{returnRecord.order_id.slice(0, 8)}
                  </span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Reason</span>
                  <span className="max-w-[60%] text-right font-medium">
                    {returnRecord.reason}
                  </span>
                </div>
                {returnRecord.resolved_at && (
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Resolved On</span>
                    <span className="font-medium">
                      {new Date(returnRecord.resolved_at).toLocaleDateString()}
                    </span>
                  </div>
                )}
              </div>
            </div>

            {analysis.summary && (
              <div className="surface-bento">
                <div className="flex items-center gap-2">
                  <ShieldCheck className="size-5 text-primary" />
                  <h2 className="font-heading text-lg font-bold">
                    AI Analysis
                  </h2>
                </div>
                <div className="mt-4 space-y-4">
                  <div className="grid gap-4 sm:grid-cols-2">
                    <div className="rounded-xl bg-muted/50 p-4">
                      <p className="text-xs text-muted-foreground">
                        Suggested Resolution
                      </p>
                      <p className="mt-1 font-heading text-lg font-semibold capitalize">
                        {analysis.suggested_resolution?.replace("_", " ") ??
                          "Review needed"}
                      </p>
                    </div>
                    <div className="rounded-xl bg-muted/50 p-4">
                      <p className="text-xs text-muted-foreground">
                        Confidence
                      </p>
                      <p className="mt-1 font-heading text-lg font-semibold capitalize">
                        {analysis.confidence ?? "Unknown"}
                      </p>
                    </div>
                  </div>
                  <div>
                    <p className="text-sm font-medium">Summary</p>
                    <p className="mt-1 text-sm leading-relaxed text-muted-foreground">
                      {analysis.summary}
                    </p>
                  </div>
                  {analysis.follow_up_questions &&
                    analysis.follow_up_questions.length > 0 && (
                      <div>
                        <p className="text-sm font-medium">
                          Follow-up Questions
                        </p>
                        <ul className="mt-2 space-y-2">
                          {analysis.follow_up_questions.map((question, index) => (
                            <li
                              key={index}
                              className="flex items-start gap-2 text-sm text-muted-foreground"
                            >
                              <span className="mt-1.5 size-1.5 shrink-0 rounded-full bg-primary" />
                              {question}
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                </div>
              </div>
            )}
          </div>

          <div className="lg:col-span-1">
            <div className="surface-bento sticky top-28 space-y-4">
              <h2 className="font-heading text-lg font-bold">
                Resolution
              </h2>

              {returnRecord.status === "approved" && (
                <div className="rounded-xl bg-green-50 p-4 dark:bg-green-900/20">
                  <div className="flex items-center gap-2">
                    <RefreshCw className="size-5 text-green-600 dark:text-green-400" />
                    <p className="font-semibold text-green-600 dark:text-green-400">
                      Approved
                    </p>
                  </div>
                  <p className="mt-2 text-sm text-muted-foreground">
                    Your return has been approved. A{" "}
                    {analysis.suggested_resolution === "replacement"
                      ? "replacement"
                      : "refund"}{" "}
                    will be processed shortly.
                  </p>
                </div>
              )}

              {returnRecord.status === "declined" && (
                <div className="rounded-xl bg-red-50 p-4 dark:bg-red-900/20">
                  <div className="flex items-center gap-2">
                    <Package className="size-5 text-red-600 dark:text-red-400" />
                    <p className="font-semibold text-red-600 dark:text-red-400">
                      Declined
                    </p>
                  </div>
                  <p className="mt-2 text-sm text-muted-foreground">
                    This return request was not approved. Please contact support
                    if you have questions.
                  </p>
                </div>
              )}

              {returnRecord.status === "processed" && (
                <div className="rounded-xl bg-gray-100 p-4 dark:bg-gray-800">
                  <div className="flex items-center gap-2">
                    <ShieldCheck className="size-5 text-gray-600 dark:text-gray-400" />
                    <p className="font-semibold">Processed</p>
                  </div>
                  <p className="mt-2 text-sm text-muted-foreground">
                    Your return has been fully processed. You should receive
                    confirmation via email soon.
                  </p>
                </div>
              )}

              {(returnRecord.status === "pending" ||
                returnRecord.status === "reviewed") && (
                <div className="rounded-xl bg-yellow-50 p-4 dark:bg-yellow-900/20">
                  <div className="flex items-center gap-2">
                    <Package className="size-5 text-yellow-600 dark:text-yellow-400" />
                    <p className="font-semibold text-yellow-600 dark:text-yellow-400">
                      Under Review
                    </p>
                  </div>
                  <p className="mt-2 text-sm text-muted-foreground">
                    We&apos;re reviewing your request. You&apos;ll be notified once a
                    decision is made.
                  </p>
                </div>
              )}

              <Separator />

              <Link href={`/orders/${returnRecord.order_id}`}>
                <Button variant="outline" className="w-full rounded-full">
                  View Order
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </main>
  )
}
