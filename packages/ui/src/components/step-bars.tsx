import { useGoGoUIMessages } from '../i18n/messages-context.ts'
import { cn } from '../lib/cn.ts'

type StepBarsProps = {
  steps: readonly string[]
  /** The current step, counted from 0. */
  current: number
  className?: string
}

/**
 * Where one is in a short flow, at the top of a dialog: one bar per step,
 * filled up to the current one, and the step's name under them.
 *
 * @summary Bars for the steps of a short flow.
 */
function StepBars({ steps, current, className }: StepBarsProps) {
  const { stepOf } = useGoGoUIMessages()
  const where = stepOf(current + 1, steps.length)
  return (
    <div data-slot="step-bars" className={cn('flex flex-col gap-2', className)}>
      <div aria-hidden="true" className="flex gap-1.5">
        {steps.map((step, index) => (
          <span
            key={step}
            className="h-1.5 flex-1 overflow-hidden rounded-full bg-tray"
          >
            <span
              className={cn(
                'block h-full origin-left rounded-full bg-primary transition-transform duration-300 ease-out motion-reduce:transition-none',
                index <= current ? 'scale-x-100' : 'scale-x-0',
              )}
            />
          </span>
        ))}
      </div>
      <p className="text-sm text-fg-muted">
        <span className="sr-only">{`${where} : `}</span>
        <span aria-hidden="true">{`${where} · `}</span>
        {steps[current]}
      </p>
    </div>
  )
}

export { StepBars }
export type { StepBarsProps }
