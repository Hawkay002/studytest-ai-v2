import { Timer } from "lucide-react"

import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

interface TimerConfigProps {
  enabled: boolean
  minutes: number
  onChange: (next: { enabled: boolean; minutes: number }) => void
}

const PRESETS = [15, 30, 45]

export function TimerConfig({
  enabled,
  minutes,
  onChange,
}: TimerConfigProps) {
  const isPreset = PRESETS.includes(minutes)

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <Label
          htmlFor="timer-enabled"
          className="flex items-center gap-1.5 text-sm"
        >
          <Timer className="h-3.5 w-3.5 text-muted-foreground" />
          Enable timer
        </Label>
        <Switch
          id="timer-enabled"
          checked={enabled}
          onCheckedChange={(checked) =>
            onChange({ enabled: checked, minutes })
          }
        />
      </div>

      {enabled && (
        <div className="flex flex-wrap items-center gap-2">
          {PRESETS.map((preset) => (
            <Button
              key={preset}
              type="button"
              variant="outline"
              size="sm"
              onClick={() => onChange({ enabled, minutes: preset })}
              className={cn(
                "h-8",
                isPreset &&
                  minutes === preset &&
                  "border-primary bg-primary/10 text-primary hover:bg-primary/10",
              )}
            >
              {preset} min
            </Button>
          ))}

          <div className="flex items-center gap-1.5">
            <span
              className={cn(
                "text-xs",
                !isPreset ? "text-primary" : "text-muted-foreground",
              )}
            >
              Custom:
            </span>
            <Input
              type="number"
              min={1}
              max={180}
              value={!isPreset ? minutes : ""}
              placeholder="30"
              onChange={(e) => {
                const n = Number(e.target.value)
                if (Number.isFinite(n) && n > 0) {
                  onChange({ enabled, minutes: Math.min(180, Math.round(n)) })
                }
              }}
              className="h-8 w-20"
            />
            <span className="text-xs text-muted-foreground">min</span>
          </div>
        </div>
      )}
    </div>
  )
}
