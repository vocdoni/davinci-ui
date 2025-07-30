import * as React from 'react'
import { cn } from '~lib/utils'
import { Switch } from './switch'

export interface LabeledSwitchProps {
  checked?: boolean
  onCheckedChange?: (checked: boolean) => void
  disabled?: boolean
  leftLabel?: string
  rightLabel?: string
  className?: string
  id?: string
}

const LabeledSwitch = React.forwardRef<HTMLButtonElement, LabeledSwitchProps>(
  ({ checked = false, onCheckedChange, disabled = false, leftLabel, rightLabel, className, id }, ref) => {
    return (
      <div className={cn('flex items-center gap-3', className)}>
        {leftLabel && (
          <span className={cn('text-sm text-davinci-black-alt', checked && 'text-davinci-black-alt/60')}>
            {leftLabel}
          </span>
        )}
        <Switch
          ref={ref}
          id={id}
          checked={checked}
          onCheckedChange={onCheckedChange}
          disabled={disabled}
          className='data-[state=checked]:bg-davinci-black-alt data-[state=unchecked]:bg-davinci-callout-border'
        />
        {rightLabel && (
          <span className={cn('text-sm text-davinci-black-alt', !checked && 'text-davinci-black-alt/60')}>
            {rightLabel}
          </span>
        )}
      </div>
    )
  }
)

LabeledSwitch.displayName = 'LabeledSwitch'

export { LabeledSwitch }