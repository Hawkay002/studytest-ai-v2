import { Link } from "wouter"
import { Home, Compass } from "lucide-react"

import { Button } from "@/components/ui/button"
import { PageTransition } from "@/components/layout/PageTransition"

export function NotFoundPage() {
  return (
    <PageTransition>
      <div className="container flex min-h-[60dvh] flex-col items-center justify-center gap-4 py-16 text-center">
        <div className="flex h-16 w-16 items-center justify-center rounded-full bg-muted text-muted-foreground">
          <Compass className="h-8 w-8" />
        </div>
        <div className="space-y-1">
          <h1 className="text-3xl font-bold">Page not found</h1>
          <p className="text-muted-foreground">
            The page you're looking for doesn't exist or has moved.
          </p>
        </div>
        <Button asChild className="gap-2">
          <Link href="/">
            <Home className="h-4 w-4" />
            Back to home
          </Link>
        </Button>
      </div>
    </PageTransition>
  )
}
