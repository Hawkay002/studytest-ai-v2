import { Link } from "wouter"
import { BookOpen } from "lucide-react"

export function Footer() {
  return (
    <footer className="border-t bg-background">
      <div className="container flex flex-col items-center justify-between gap-4 py-8 sm:flex-row">
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <span className="flex h-7 w-7 items-center justify-center rounded-md bg-primary text-primary-foreground">
            <BookOpen className="h-4 w-4" />
          </span>
          <span>
            StudyTest AI &middot; Turn anything into an academic examination.
          </span>
        </div>
        <div className="flex items-center gap-4 text-sm text-muted-foreground">
          <Link href="/" className="hover:text-foreground">
            Home
          </Link>
          <Link href="/history" className="hover:text-foreground">
            History
          </Link>
          <a
            href="https://aistudio.google.com/app/apikey"
            target="_blank"
            rel="noreferrer"
            className="hover:text-foreground"
          >
            Get API key
          </a>
        </div>
      </div>
    </footer>
  )
}