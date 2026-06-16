const colors: Record<string, string> = {
  not_started: 'bg-stone-100 text-stone-600',
  currently_reading: 'bg-blue-100 text-blue-700',
  finished: 'bg-green-100 text-green-700',
  did_not_finish: 'bg-red-100 text-red-600',
  owned: 'bg-indigo-100 text-indigo-700',
  default: 'bg-stone-100 text-stone-600',
}

const labels: Record<string, string> = {
  not_started: 'Not Started',
  currently_reading: 'Reading',
  finished: 'Finished',
  did_not_finish: 'DNF',
}

export function Badge({ value, className = '' }: { value: string; className?: string }) {
  const color = colors[value] ?? colors.default
  const label = labels[value] ?? value
  return (
    <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${color} ${className}`}>
      {label}
    </span>
  )
}
