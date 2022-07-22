import { ButtonHTMLAttributes } from 'react'
import './index.css'

export type Props = ButtonHTMLAttributes<HTMLButtonElement> & {
  primary?: boolean
  backgroundColor?: string | null
  size?: 'small' | 'medium' | 'large'
  label: string
}

/**
 * Primary UI component for user interaction
 */
export const Button = ({ primary = false, backgroundColor = null, size = 'medium', label, ...props }: Props) => {
  const mode = primary ? 'storybook-button--primary' : 'storybook-button--secondary'
  return (
    <button
      type="button"
      className={['storybook-button', `storybook-button--${size}`, mode].join(' ')}
      style={backgroundColor ? { backgroundColor } : {}}
      {...props}
    >
      {label}
    </button>
  )
}
