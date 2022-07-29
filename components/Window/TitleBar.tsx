import { HTMLAttributes, MouseEventHandler } from 'react'
import Grill from './Grill'

type TitleBarButtonDecalProps = {
  type: 'close' | 'collapse' | 'optimise'
}

type TitleBarButtonProps = HTMLAttributes<HTMLButtonElement> & {
  type: 'close' | 'collapse' | 'optimise'
}

export type TitleBarProps = HTMLAttributes<HTMLDivElement> & {
  title: string
  collapsed: boolean
  focused: boolean
  resizable: boolean
  onClose: MouseEventHandler<HTMLButtonElement>
  onCollapse: MouseEventHandler<HTMLButtonElement>
  onOptimise: MouseEventHandler<HTMLButtonElement>
}

const TitleBarButtonDecal = ({ type }: TitleBarButtonDecalProps) => {
  if (type === 'collapse') {
    return (
      <div className='absolute h-[3px] w-full top-1/2 -translate-y-1/2 border-y border-[rgb(78,78,78)]' />
    )
  }

  if (type === 'optimise') {
    return (
      <div className='absolute top-0 w-[6px] h-[6px] border-r border-b border-[rgb(74,74,74)]' />
    )
  }

  return null
}

const TitleBarButton = ({ type, className, ...props }: TitleBarButtonProps) => {
  const size = 'w-[11px] h-[11px]'
  const bg = 'bg-gradient-to-br from-[rgb(192,192,192)] to-[rgb(114,114,114)]'
  const border = 'border border-t-[rgb(68,68,68)] border-l-[rgb(68,68,68)] border-r-[rgb(74,74,74)] border-b-[rgb(74,74,74)]'

  return (
    <button
      className={`no-drag relative ${size} ${bg} ${border} ${className ?? ''}`}
      {...props}
    >
      <div className='m-[1px] h-[7px] bg-gradient-to-br from-[rgb(166,166,166)] to-[rgb(224,224,224)]' />
      <TitleBarButtonDecal type={type} />
    </button>
  )
}

const TitleBar = ({ title, collapsed, focused, resizable, onClose, onCollapse, onOptimise, className, ...props }: TitleBarProps) => {
  const layout = `flex ${focused ? 'justify-between' : 'justify-center'} items-center space-x-[5px] ${collapsed ? 'h-[22px]' : 'h-[20px]'} p-[4px] pb-[5px]`
  const font = `text-[9px] ${focused ? 'text-[rgb(25,25,25)]' : 'text-[rgb(132,132,132)]'}`
  const bg = focused ? 'bg-[rgb(204,204,204)]' : 'bg-[rgb(221,221,221)]'
  const border = `border border-r-2 ${collapsed ? 'border-b-2' : 'border-b-0'} ${focused ? 'border-[rgb(45,45,51)] border-r-[rgb(19,19,19)]' : 'border-[rgb(104,104,110)] border-r-[rgb(102,102,102)]'}`

  return (
    // TODO border gradient
    <div className={`${layout} ${font} ${bg} ${border} ${className ?? ''}`} {...props}>
      {focused
        ? <div className='flex-1 flex space-x-[5px]'>
            <TitleBarButton type='close' className='flex-none' onClick={onClose} />
            <Grill className='flex-1 h-[11px] border-t border-[rgb(231,231,231)]' />
          </div>
        : null}
      <span className='flex-none cursor-default'>{title}</span>
      {focused
        ? <div className='flex-1 flex space-x-[5px]'>
            <Grill className='flex-1 h-[11px] border-t border-[rgb(231,231,231)]' />
            {resizable ? <TitleBarButton type='optimise' className='flex-none' onClick={onOptimise} /> : null}
            <TitleBarButton type='collapse' className='flex-none' onClick={onCollapse} />
          </div>
        : null}
    </div>
  )
}

export default TitleBar
