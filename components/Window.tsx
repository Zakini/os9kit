import { HTMLAttributes, MouseEventHandler, PropsWithChildren, useEffect, useState } from 'react'
import { DraggableCore as Draggable } from 'react-draggable'
import { usePrevious } from '../utils'

type Vector2D = {
  x: number
  y: number
}

type Size2D = {
  width: number
  height: number
}

type ButtonProps = HTMLAttributes<HTMLButtonElement> & {
  type: 'close' | 'collapse'
}

type TitleBarProps = HTMLAttributes<HTMLDivElement> & {
  title: string
  collapsed: boolean
  onClose: MouseEventHandler<HTMLButtonElement>
  onCollapse: MouseEventHandler<HTMLButtonElement>
}

type BodyProps = PropsWithChildren<HTMLAttributes<HTMLDivElement>> & {
  collapsed: boolean
}

type GhostProps = HTMLAttributes<HTMLDivElement> & {
  position: Vector2D
}

type WindowProps = PropsWithChildren<Pick<TitleBarProps, 'title' | 'onClose'>> & {
  position: Vector2D
  size: Size2D
  onMove: (position: Vector2D) => unknown
}

const Button = ({ type, className, ...props }: ButtonProps) => {
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

const TitleBar = ({ title, collapsed, onClose, onCollapse, className, ...props }: TitleBarProps) => {
  const layout = `flex justify-between items-center space-x-[5px] ${collapsed ? 'h-[22px]' : 'h-[20px]'} p-[4px] pb-[5px]`
  const font = 'text-[9px]'
  const bg = 'bg-[rgb(204,204,204)]'
  const border = `border border-r-2 ${collapsed ? 'border-b-2' : 'border-b-0'} border-[rgb(45,45,51)] border-r-[rgb(19,19,19)]`

  return (
    // TODO border gradient
    <div className={`${layout} ${font} ${bg} ${border} ${className ?? ''}`} {...props}>
      <Button type='close' className='flex-none' onClick={onClose} />
      <Grill className='flex-1' />
      <span className='flex-none cursor-default'>{title}</span>
      <Grill className='flex-1' />
      <Button type='collapse' className='flex-none' onClick={onCollapse} />
    </div>
  )
}

const Body = ({ className, collapsed, children, ...props }: BodyProps) => (
  <div
    className={`${collapsed ? 'hidden' : ''} border-2 border-l border-t-0 border-l-[rgb(45,45,51)] border-[rgb(19,19,19)] ${className ?? ''}`}
    {...props}
  >
    {/* TODO border gradient 217 -> 140, left to right, top to bottom */}
    <div className='h-full border-4 border-t-0 border-[rgb(204,204,204)]'>
      <div className='h-full border border-[rgb(51,51,51)] border-r-[rgb(64,64,64)] border-b-[rgb(59,59,59)]'>
        <div className='no-drag h-full overflow-hidden'>
          {children}
        </div>
      </div>
    </div>
  </div>
)

const Ghost = ({ position, className, style, ...props }: GhostProps) => (
  <div
    // TODO border with 1px wide black and white stripes
    className={`border-2 border-black border-dotted ${className ?? ''}`}
    style={{ transform: `translate(${position.x}px, ${position.y}px)`, ...style }}
    {...props}
  />
)

const Window = ({ title, position, size: { width, height }, onMove, onClose, children }: WindowProps) => {
  const [collapsed, setCollapsed] = useState(false)
  const [dragging, setDragging] = useState(false)
  const previousDragging = usePrevious(dragging)
  const [pendingOffset, setPendingOffset] = useState({ x: 0, y: 0 })

  useEffect(() => {
    if (dragging || !previousDragging) return

    onMove({ x: position.x + pendingOffset.x, y: position.y + pendingOffset.y })
    setPendingOffset({ x: 0, y: 0 })
  }, [dragging, previousDragging, position, pendingOffset, onMove])

  return (
    // TODO unfocused style
    // TODO make resizeable
    <Draggable
      cancel='.no-drag'
      onStart={() => setDragging(true)}
      onDrag={(e, { deltaX, deltaY }) => setPendingOffset(({ x, y }) => ({ x: x + deltaX, y: y + deltaY }))}
      onStop={() => setDragging(false)}
    >
      <div
        className='relative flex flex-col'
        style={{
          width: `${width}px`,
          height: collapsed ? 'inherit' : `${height}px`,
          transform: `translate(${position.x}px, ${position.y}px)`
        }}
      >
        <TitleBar
          className='flex-none'
          title={title}
          collapsed={collapsed}
          onClose={onClose}
          onCollapse={() => setCollapsed(c => !c)}
        />
        <Body className='flex-1 min-h-0' collapsed={collapsed}>
          {children}
        </Body>
        {dragging
          ? <Ghost className='absolute top-0 h-full w-full' position={pendingOffset} />
          : null}
      </div>
    </Draggable>
  )
}

export default Window
