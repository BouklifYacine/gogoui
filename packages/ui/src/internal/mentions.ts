// The text side of MentionInput, after Arc UI (https://uiarc.dev, MIT):
// where mentions sit in the text, how they follow an edit, and when an @
// opens the list.

/** A person who can be mentioned. */
export type MentionPerson = {
  id: string
  name: string
  /** One short line under the name, such as a role. */
  description?: string
  /** A photo's address; the initials show without one. */
  avatarSrc?: string
}

/** A mention inside the text: `start` and `end` are offsets around « @label ». */
export type Mention = {
  id: string
  label: string
  start: number
  end: number
}

/** What a MentionInput holds: its plain text and where its mentions are. */
export type MentionValue = {
  text: string
  mentions: Mention[]
}

/** An @ being typed: where it is, and the words after it. */
export type MentionTrigger = { start: number; query: string }

export const emptyMentionValue: MentionValue = { text: '', mentions: [] }

export const mentionText = (label: string) => `@${label}`

/**
 * The text ready to store, each mention written `<@id>` (or as `format`
 * says), so a rename never breaks it.
 */
export function serializeMentions(
  value: MentionValue,
  format: (mention: Mention) => string = (mention) => `<@${mention.id}>`,
): string {
  let out = ''
  let at = 0
  for (const mention of [...value.mentions].sort((a, b) => a.start - b.start)) {
    out += value.text.slice(at, mention.start) + format(mention)
    at = mention.end
  }
  return out + value.text.slice(at)
}

/**
 * Moves the mentions along with an edit and drops any the edit touched.
 * `hint` is the caret before the edit: it settles repeated letters.
 */
export function reconcileMentions(
  previous: MentionValue,
  text: string,
  hint: number,
): Mention[] {
  const before = previous.text
  let prefix = 0
  const maxPrefix = Math.min(before.length, text.length, Math.max(0, hint))
  while (prefix < maxPrefix && before[prefix] === text[prefix]) {
    prefix++
  }
  let suffix = 0
  while (
    suffix < before.length - prefix &&
    suffix < text.length - prefix &&
    before[before.length - 1 - suffix] === text[text.length - 1 - suffix]
  ) {
    suffix++
  }
  const oldEnd = before.length - suffix
  const delta = text.length - before.length
  return previous.mentions
    .flatMap((mention) => {
      if (mention.end <= prefix) {
        return [mention]
      }
      if (mention.start >= oldEnd) {
        return [
          {
            ...mention,
            start: mention.start + delta,
            end: mention.end + delta,
          },
        ]
      }
      return []
    })
    .filter(
      (mention) =>
        text.slice(mention.start, mention.end) === mentionText(mention.label),
    )
}

/** The @ the caret is typing after, if any: at a word's start, on the same line. */
export function findMentionTrigger(
  text: string,
  caret: number,
  mentions: Mention[],
): MentionTrigger | null {
  for (let index = caret - 1; index >= 0 && index >= caret - 48; index--) {
    const char = text[index]
    if (char === '\n') {
      return null
    }
    if (char !== '@') {
      continue
    }
    const previous = text[index - 1]
    if (index > 0 && previous !== undefined && !/[\s([{"']/.test(previous)) {
      return null
    }
    if (
      mentions.some((mention) => index >= mention.start && index < mention.end)
    ) {
      return null
    }
    const query = text.slice(index + 1, caret)
    // A first name and a last name at most.
    return /^[^\s@]*( [^\s@]*)?$/.test(query) ? { start: index, query } : null
  }
  return null
}

/** How well a person matches what was typed: 0 is no match. */
export function rankMention(person: MentionPerson, query: string): number {
  const name = person.name.toLowerCase()
  if (!query) {
    return 1
  }
  if (name.startsWith(query)) {
    return 4
  }
  if (name.split(/[\s\-_.]+/).some((word) => word.startsWith(query))) {
    return 3
  }
  if (name.includes(query)) {
    return 2
  }
  return (person.description ?? '').toLowerCase().includes(query) ? 1 : 0
}
