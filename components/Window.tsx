import { HTMLAttributes, MouseEventHandler, PropsWithChildren, useState } from 'react'
import Draggable from 'react-draggable'

type ButtonProps = {
  type: 'close' | 'collapse'
}

type TitleBarProps = {
  title: string
  collapsed: boolean
  onClose: MouseEventHandler<HTMLButtonElement>
  onCollapse: MouseEventHandler<HTMLButtonElement>
}

type BodyProps = {
  collapsed: boolean
}

type WindowProps = Pick<TitleBarProps, 'title' | 'onClose'>

const Button = ({ type, className, ...props }: ButtonProps & HTMLAttributes<HTMLButtonElement>) => {
  const size = 'w-[11px] h-[11px]'
  const bg = 'bg-gradient-to-br from-[rgb(192,192,192)] to-[rgb(114,114,114)]'
  const border = 'border border-t-[rgb(68,68,68)] border-l-[rgb(68,68,68)] border-r-[rgb(74,74,74)] border-b-[rgb(74,74,74)]'

  return (
    <button
      className={`no-drag relative ${size} ${bg} ${border} ${className ?? ''}`}
      {...props}
    >
      <div className='m-[1px] h-[7px] bg-gradient-to-br from-[rgb(166,166,166)] to-[rgb(224,224,224)]' />
      {type === 'collapse'
        ? <div className='absolute h-[3px] w-full top-1/2 -translate-y-1/2 border-y border-[rgb(78,78,78)]' />
        : null}
    </button>
  )
}

const Grill = ({ className, style, ...props }: HTMLAttributes<HTMLDivElement>) => (
  <div className={`h-[11px] border-t border-[rgb(231,231,231)] ${className}`} style={{
    ...style,
    backgroundImage: 'repeating-linear-gradient(to bottom, rgb(153,153,153), rgb(221,221,221) 2px)'
  }} {...props} />
)

const TitleBar = ({ title, collapsed, onClose, onCollapse }: TitleBarProps) => {
  const layout = `flex justify-between items-center space-x-[5px] ${collapsed ? 'h-[22px]' : 'h-[20px]'} p-[4px] pb-[5px]`
  const font = 'text-[9px]'
  const bg = 'bg-[rgb(204,204,204)]'
  const border = `border border-r-2 ${collapsed ? 'border-b-2' : 'border-b-0'} border-[rgb(45,45,51)] border-r-[rgb(19,19,19)]`

  return (
    // TODO border gradient
    <div className={`${layout} ${font} ${bg} ${border}`}>
      <Button type='close' className='flex-none' onClick={onClose} />
      <Grill className='flex-1' />
      <span className='flex-none cursor-default'>{title}</span>
      <Grill className='flex-1' />
      <Button type='collapse' className='flex-none' onClick={onCollapse} />
    </div>
  )
}

const Body = ({ className, collapsed, children, ...props }: PropsWithChildren<BodyProps> & HTMLAttributes<HTMLDivElement>) => (
  <div
    className={`${collapsed ? 'hidden' : ''} border-2 border-l border-t-0 border-l-[rgb(45,45,51)] border-[rgb(19,19,19)] ${className ?? ''}`}
    {...props}
  >
    {/* TODO border gradient 217 -> 140, left to right, top to bottom */}
    <div className='h-full border-4 border-t-0 border-[rgb(204,204,204)]'>
      <div className='h-full border border-[rgb(51,51,51)] border-r-[rgb(64,64,64)] border-b-[rgb(59,59,59)]'>
        <div className='no-drag h-full'>
          {children}
        </div>
      </div>
    </div>
  </div>
)

const Window = ({ title, onClose, children }: PropsWithChildren<WindowProps>) => {
  const [collapsed, setCollapsed] = useState(false)

  return (
    // TODO dashed copy of outer border when dragging
    // TODO make resizeable
    <Draggable cancel='.no-drag'>
      <div style={{ width: '200px', height: '200px' }}>
        <TitleBar
          title={title}
          collapsed={collapsed}
          onClose={onClose}
          onCollapse={() => setCollapsed(c => !c)}
        />
        <Body className='h-full' collapsed={collapsed}>
          {children}
        </Body>
      </div>
    </Draggable>
  )
}

export default Window
