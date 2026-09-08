import { useCallback, useEffect, useRef, useState } from 'react'
import { minutesToTime, timeToMinutes } from '../../../core/time/index.js'
import { cn } from './classNames.js'

export type ClockTimeInputClassNames = {
  root?: string
  hour?: string
  minute?: string
  separator?: string
  label?: string
}

export type ClockTimeInputProps = {
  value: string
  onChange: (value: string) => void
  defaultTime?: string
  minuteStep?: number
  minMinutes?: number
  maxMinutes?: number
  disabled?: boolean
  required?: boolean
  labeled?: boolean
  className?: string
  classNames?: ClockTimeInputClassNames
}

const FALLBACK_TIME = '10:00'

function clampMinutes(minutes: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, minutes))
}

function parseOrFallback(time: string | undefined, fallback: string): number {
  if (!time || !/^\d{1,2}:\d{2}$/.test(time)) return timeToMinutes(fallback)
  return timeToMinutes(time)
}

export function ClockTimeInput({
  value,
  onChange,
  defaultTime,
  minuteStep = 5,
  minMinutes = 6 * 60,
  maxMinutes = 22 * 60 + 55,
  disabled = false,
  required = false,
  labeled = false,
  className = '',
  classNames,
}: ClockTimeInputProps) {
  const baseTime = value || defaultTime || FALLBACK_TIME
  const total = clampMinutes(parseOrFallback(baseTime, FALLBACK_TIME), minMinutes, maxMinutes)
  const hours = Math.floor(total / 60)
  const minutes = total % 60

  const commit = (nextMinutes: number) => {
    onChange(minutesToTime(clampMinutes(nextMinutes, minMinutes, maxMinutes)))
  }

  const [localHours, setLocalHours] = useState<string>(String(hours))
  const [localMinutes, setLocalMinutes] = useState<string>(String(minutes).padStart(2, '0'))
  const hourFocused = useRef(false)
  const minuteFocused = useRef(false)

  useEffect(() => {
    if (!hourFocused.current) setLocalHours(String(hours))
  }, [hours])
  useEffect(() => {
    if (!minuteFocused.current) setLocalMinutes(String(minutes).padStart(2, '0'))
  }, [minutes])

  const commitHours = useCallback(() => {
    const raw = parseInt(localHours, 10)
    if (!Number.isFinite(raw) || Number.isNaN(raw)) {
      setLocalHours(String(hours))
      return
    }
    commit(Math.trunc(raw) * 60 + minutes)
  }, [localHours, hours, minutes])

  const commitMinutes = useCallback(() => {
    const raw = parseInt(localMinutes, 10)
    if (!Number.isFinite(raw) || Number.isNaN(raw)) {
      setLocalMinutes(String(minutes).padStart(2, '0'))
      return
    }
    let m = Math.trunc(raw)
    m = Math.round(m / minuteStep) * minuteStep
    if (m >= 60) m = 60 - minuteStep
    if (m < 0) m = 0
    setLocalMinutes(String(m).padStart(2, '0'))
    commit(hours * 60 + m)
  }, [localMinutes, hours, minutes, minuteStep])

  const hourInput = (
    <input
      type="number"
      inputMode="numeric"
      data-agenda-clock-hour=""
      min={Math.floor(minMinutes / 60)}
      max={Math.floor(maxMinutes / 60)}
      step={1}
      value={localHours}
      disabled={disabled}
      aria-label="Horas"
      className={cn(classNames?.hour)}
      onFocus={() => {
        hourFocused.current = true
      }}
      onChange={(e) => setLocalHours(e.target.value)}
      onBlur={() => {
        hourFocused.current = false
        commitHours()
      }}
      onKeyDown={(e) => {
        if (e.key === 'Enter') {
          commitHours()
          ;(e.target as HTMLInputElement).blur()
        }
        if (e.key === 'ArrowUp' || e.key === 'ArrowDown') {
          e.preventDefault()
          const delta = e.key === 'ArrowUp' ? 1 : -1
          const cur = parseInt(localHours, 10)
          const next = Number.isNaN(cur) ? hours + delta : cur + delta
          setLocalHours(String(next))
          commit(Math.trunc(next) * 60 + minutes)
        }
      }}
    />
  )

  const minuteInput = (
    <input
      type="number"
      inputMode="numeric"
      data-agenda-clock-minute=""
      min={0}
      max={60 - minuteStep}
      step={minuteStep}
      value={localMinutes}
      disabled={disabled}
      aria-label="Minutos"
      className={cn(classNames?.minute)}
      onFocus={() => {
        minuteFocused.current = true
      }}
      onChange={(e) => setLocalMinutes(e.target.value)}
      onBlur={() => {
        minuteFocused.current = false
        commitMinutes()
      }}
      onKeyDown={(e) => {
        if (e.key === 'Enter') {
          commitMinutes()
          ;(e.target as HTMLInputElement).blur()
        }
        if (e.key === 'ArrowUp' || e.key === 'ArrowDown') {
          e.preventDefault()
          const delta = e.key === 'ArrowUp' ? minuteStep : -minuteStep
          const cur = parseInt(localMinutes, 10)
          let next = (Number.isNaN(cur) ? minutes : cur) + delta
          next = Math.round(next / minuteStep) * minuteStep
          if (next >= 60) next = 60 - minuteStep
          if (next < 0) next = 0
          setLocalMinutes(String(next).padStart(2, '0'))
          commit(hours * 60 + next)
        }
      }}
    />
  )

  return (
    <div
      data-agenda-clock-time=""
      className={cn(classNames?.root, className)}
      style={{ display: 'inline-flex', alignItems: 'flex-end', gap: 8 }}
    >
      {required && (
        <input
          tabIndex={-1}
          aria-hidden
          style={{ position: 'absolute', width: 0, height: 0, opacity: 0, pointerEvents: 'none' }}
          value={value}
          required
          disabled={disabled}
          onChange={() => {}}
        />
      )}
      {labeled ? (
        <>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            <span className={cn(classNames?.label)}>Horas</span>
            {hourInput}
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            <span className={cn(classNames?.label)}>Minutos</span>
            {minuteInput}
          </div>
        </>
      ) : (
        <>
          {hourInput}
          <span className={cn(classNames?.separator)} aria-hidden>
            :
          </span>
          {minuteInput}
        </>
      )}
    </div>
  )
}
