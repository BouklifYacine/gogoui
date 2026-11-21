import { Field, FieldDescription, FieldLabel } from './field.tsx'
import { Skeleton, SkeletonText } from './skeleton.tsx'

type FieldSkeletonProps = {
  /** The real label's text: the grey bar takes its length. */
  label: string
  description?: string
  control?: 'input' | 'textarea' | 'switch'
  /** The lines a textarea shows. */
  rows?: number
}

/**
 * A form field while it loads.
 *
 * **Use it for** a form whose values come from the server.
 *
 * **Key props**: `label`, `description`, `control` (input, textarea,
 * switch), `rows`.
 *
 * @summary A form field while it loads.
 */
function FieldSkeleton({
  label,
  description,
  control = 'input',
  rows = 2,
}: FieldSkeletonProps) {
  if (control === 'switch') {
    return (
      <Field>
        <div className="flex min-h-11 items-start justify-between gap-4">
          <div className="flex flex-col items-start gap-0.5">
            <SkeletonText>{label}</SkeletonText>
            {description && (
              <FieldDescription>
                <SkeletonText>{description}</SkeletonText>
              </FieldDescription>
            )}
          </div>
          <Skeleton className="mt-0.5 h-6 w-10 shrink-0 rounded-full" />
        </div>
      </Field>
    )
  }
  return (
    <Field>
      <FieldLabel>
        <SkeletonText>{label}</SkeletonText>
      </FieldLabel>
      {control === 'textarea' ? (
        <Skeleton
          className="rounded-lg"
          style={{ height: `${Math.max(64, rows * 20 + 16)}px` }}
        />
      ) : (
        <Skeleton className="h-9 rounded-lg max-md:h-11" />
      )}
      {description && (
        <FieldDescription>
          <SkeletonText>{description}</SkeletonText>
        </FieldDescription>
      )}
    </Field>
  )
}

export { FieldSkeleton }
export type { FieldSkeletonProps }
