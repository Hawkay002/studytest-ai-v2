import {
  createContext,
  useContext,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from "react"
import {
  CheckCircle2,
  ExternalLink,
  Eye,
  EyeOff,
  KeyRound,
  Loader2,
  XCircle,
} from "lucide-react"
import { toast } from "sonner"

import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useApiKey } from "@/context/ApiKeyContext"

interface ApiKeyModalContextValue {
  open: () => void
  isOpen: boolean
}

const ApiKeyModalContext = createContext<ApiKeyModalContextValue | undefined>(
  undefined,
)

export function ApiKeyModalProvider({ children }: { children: ReactNode }) {
  const [isOpen, setIsOpen] = useState(false)
  const value = useMemo(
    () => ({ open: () => setIsOpen(true), isOpen }),
    [isOpen],
  )
  return (
    <ApiKeyModalContext.Provider value={value}>
      {children}
      <ApiKeyModal open={isOpen} onOpenChange={setIsOpen} />
    </ApiKeyModalContext.Provider>
  )
}

export function useApiKeyModal() {
  const ctx = useContext(ApiKeyModalContext)
  if (!ctx)
    throw new Error("useApiKeyModal must be used within an ApiKeyModalProvider")
  return ctx
}

function ApiKeyModal({
  open,
  onOpenChange,
}: {
  open: boolean
  onOpenChange: (open: boolean) => void
}) {
  const { apiKey, setApiKey, clearApiKey, isKeySet, isValidating, isValid } =
    useApiKey()
  const [draft, setDraft] = useState(apiKey)
  const [show, setShow] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)

  // Keep the draft in sync when opening.
  const handleOpenChange = (next: boolean) => {
    if (next) setDraft(apiKey)
    onOpenChange(next)
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="max-w-md">
        <div className="flex flex-col items-center text-center">
          <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-primary/10 text-primary">
            <KeyRound className="h-6 w-6" />
          </div>
        </div>
        <DialogHeader className="items-center text-center">
          <DialogTitle>Your Google AI Studio Key</DialogTitle>
          <DialogDescription>
            Never stored on any server. Lives in your browser only.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-2">
          <Label htmlFor="api-key">API Key</Label>
          <div className="relative">
            <Input
              id="api-key"
              ref={inputRef}
              type={show ? "text" : "password"}
              autoComplete="off"
              spellCheck={false}
              placeholder="AIza..."
              value={draft}
              onChange={(e) => setDraft(e.target.value)}
              className="pr-10"
            />
            <button
              type="button"
              onClick={() => setShow((s) => !s)}
              className="absolute right-2 top-1/2 -translate-y-1/2 rounded p-1 text-muted-foreground hover:text-foreground"
              aria-label={show ? "Hide key" : "Show key"}
            >
              {show ? (
                <EyeOff className="h-4 w-4" />
              ) : (
                <Eye className="h-4 w-4" />
              )}
            </button>
          </div>
        </div>

        <a
          href="https://aistudio.google.com/app/apikey"
          target="_blank"
          rel="noreferrer"
          className="inline-flex items-center gap-1 text-sm text-primary hover:underline"
        >
          Get a free key at aistudio.google.com
          <ExternalLink className="h-3.5 w-3.5" />
        </a>

        <TestStatus
          isValidating={isValidating}
          isValid={isValid}
          isKeySet={isKeySet}
        />

        <Button
          className="w-full"
          disabled={!draft.trim() || isValidating}
          onClick={async () => {
            setApiKey(draft.trim())
            toast.success("API key saved", {
              description: "You're ready to generate tests.",
            })
            handleOpenChange(false)
          }}
        >
          Save Key
        </Button>

        {isKeySet && (
          <Button
            variant="ghost"
            size="sm"
            className="text-muted-foreground"
            onClick={() => {
              clearApiKey()
              setDraft("")
              toast.info("API key cleared")
            }}
          >
            Clear saved key
          </Button>
        )}
      </DialogContent>
    </Dialog>
  )
}

function TestStatus({
  isValidating,
  isValid,
  isKeySet,
}: {
  isValidating: boolean
  isValid: boolean | null
  isKeySet: boolean
}) {
  const { validate } = useApiKey()
  if (isValidating) {
    return (
      <div className="flex items-center gap-2 rounded-md bg-muted/50 px-3 py-2 text-sm text-muted-foreground">
        <Loader2 className="h-4 w-4 animate-spin text-primary" />
        Testing connection...
      </div>
    )
  }
  if (isValid === true) {
    return (
      <div className="flex items-center gap-2 rounded-md bg-green-500/10 px-3 py-2 text-sm text-green-600 dark:text-green-500">
        <CheckCircle2 className="h-4 w-4" />
        Key is valid.
      </div>
    )
  }
  if (isValid === false) {
    return (
      <div className="flex items-center gap-2 rounded-md bg-destructive/10 px-3 py-2 text-sm text-destructive">
        <XCircle className="h-4 w-4" />
        Invalid key.
      </div>
    )
  }
  return (
    <Button
      type="button"
      variant="outline"
      className="w-full"
      disabled={!isKeySet}
      onClick={validate}
    >
      Test connection
    </Button>
  )
}
