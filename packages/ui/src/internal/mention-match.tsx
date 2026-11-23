/**
 * A name with the part typed after @ in full colour, the rest a step
 * quieter, after Arc UI (https://uiarc.dev, MIT).
 *
 * @summary Internal: the matched part of a MentionInput suggestion.
 */
export function MentionMatch({ text, query }: { text: string; query: string }) {
  const at = query ? text.toLowerCase().indexOf(query.toLowerCase()) : -1
  if (at < 0) {
    return <>{text}</>
  }
  return (
    <>
      {text.slice(0, at)}
      <mark className="bg-transparent text-fg">
        {text.slice(at, at + query.length)}
      </mark>
      {text.slice(at + query.length)}
    </>
  )
}
