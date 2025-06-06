import colors from 'colors'
import { LogRecord } from '../api/models/entities/logs'

const stepTag = (step: string) => colors.bold(colors.cyan(step))
const timestampTag = (timestamp: string) => colors.gray(timestamp)
const traceIdTag = (traceId: string) => colors.gray(traceId)
const versionTag = (version: string) => colors.gray(`[${version}]`)

const levelTags: Record<string, string> = {
  error: colors.red('[ERROR]'),
  info: colors.blue('[INFO]'),
  warn: colors.yellow('[WARN]'),
  debug: colors.gray('[DEBUG]'),
  trace: colors.gray('[TRACE]'),
}

const numericTag = (value: string) => colors.green(value)
const stringTag = (value: string) => colors.cyan(value)
const booleanTag = (value: string) => colors.blue(value)

const arrayBrackets = ['[', ']'].map((s) => colors.gray(s))
const objectBrackets = ['{', '}'].map((s) => colors.gray(s))

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const prettyPrintObject = (obj: Record<string, any>, depth = 0, parentIsLast = false, prefix = ''): string => {
  const tab = prefix + (depth === 0 ? '' : parentIsLast ? '│ ' : '│ ')

  if (depth > 2) {
    return `${tab} └ ${colors.gray('[...]')}`
  }

  const entries = Object.entries(obj)

  return entries
    .map(([key, value], index) => {
      const isLast = index === entries.length - 1
      const isObject = typeof value === 'object' && value !== null
      const prefix = isLast && !isObject ? '└' : '├'

      if (isObject) {
        const subObject = prettyPrintObject(value, depth + 1, isLast, tab)
        const [start, end] = Array.isArray(value) ? arrayBrackets : objectBrackets

        return `${tab}${prefix} ${key}: ${start}\n${subObject}\n${tab}${isLast ? '└' : '│'} ${end}`
      }

      let printedValue = value

      if (typeof value === 'number') {
        printedValue = numericTag(String(value))
      } else if (typeof value === 'boolean') {
        printedValue = booleanTag(String(value))
      } else if (typeof value === 'string') {
        printedValue = stringTag(value)
      }

      return `${tab}${prefix} ${key}: ${printedValue}`
    })
    .join('\n')
}

export const prettyPrint = (json: LogRecord, excludeDetails = false): void => {
  const { step, version, traceId } = json.meta
  const { level, msg, timestamp: time, values } = json
  const levelTag = levelTags[level]
  const timestamp = timestampTag(`[${new Date(time).toLocaleString()}]`)
  const objectHasKeys = Object.keys(values).length > 0

  console.log(`${timestamp} ${versionTag(version)} ${traceIdTag(traceId)} ${levelTag} ${stepTag(step)} ${msg}`)

  if (objectHasKeys && !excludeDetails) {
    console.log(prettyPrintObject(values))
  }
}
