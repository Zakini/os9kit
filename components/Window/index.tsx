import { forwardRef, HTMLAttributes, PropsWithChildren, useEffect, useRef, useState } from 'react'
import { DraggableCore as Draggable } from 'react-draggable'
import { Resizable } from 'react-resizable'
import 'react-resizable/css/styles.css'
import { usePrevious } from '../../utils'
import Body from './Body'
import Ghost from './Ghost'
import Grill from './Grill'
import TitleBar, { TitleBarProps } from './TitleBar'
import { Size2D, Vector2D } from './types'

type WindowProps = PropsWithChildren<Pick<TitleBarProps, 'title' | 'onClose'>> & {
  position: Vector2D
  size: Size2D
  optimalSize: Size2D
  resizable: boolean
  focused: boolean
  onMove: (position: Vector2D) => void
  onResize: (size: Size2D) => void
  onFocus: () => void
  onBlur: () => void
}

const DragHandle = forwardRef<HTMLDivElement, HTMLAttributes<HTMLDivElement>>(function DragHandle ({ className, ...props }, ref) {
  return (
    <div ref={ref} className={`h-[21px] w-[21px] border-b-2 border-r-2 border-[rgb(19,19,19)] ${className ?? ''}`} {...props}>
      <Grill spacing={3} className='h-[10px] w-[10px] -rotate-45 translate-x-[4px] translate-y-[4px] border-t border-[rgb(231,231,231)]' />
    </div>
  )
})

const Window = ({ title, position, size, optimalSize, resizable, focused, onMove, onResize, onClose, onFocus, onBlur, children }: WindowProps) => {
  const [collapsed, setCollapsed] = useState(false)
  const [dragging, setDragging] = useState(false)
  const previousDragging = usePrevious(dragging)
  const [pendingOffset, setPendingOffset] = useState({ x: 0, y: 0 })
  const [resizing, setResizing] = useState(false)
  const previousResizing = usePrevious(resizing)
  const [pendingSize, setPendingSize] = useState(size)
  const ref = useRef<HTMLDivElement>(null)

  const { height, width } = size

  useEffect(() => {
    if (dragging || !previousDragging) return

    onMove({ x: position.x + pendingOffset.x, y: position.y + pendingOffset.y })
    setPendingOffset({ x: 0, y: 0 })
  }, [dragging, previousDragging, position, pendingOffset, onMove])

  useEffect(() => {
    setPendingSize(size)
  }, [size])

  useEffect(() => {
    if (resizing || !previousResizing) return

    onResize(pendingSize)
  }, [resizing, previousResizing, pendingSize, onResize])

  useEffect(() => {
    const handle: Parameters<typeof document.addEventListener>[1] = event => {
      if (!(event.target instanceof Node) || !ref.current?.contains(event.target)) {
        onBlur()
      }
    }

    document.addEventListener('mousedown', handle)
    return () => document.removeEventListener('mousedown', handle)
  }, [onBlur])

  return (
    <Draggable
      cancel='.no-drag'
      onStart={() => setDragging(true)}
      onDrag={(e, { deltaX, deltaY }) => setPendingOffset(({ x, y }) => ({ x: x + deltaX, y: y + deltaY }))}
      onStop={() => setDragging(false)}
    >
      <Resizable
        height={height}
        width={width}
        handle={(_, ref) => <DragHandle ref={ref} className='no-drag absolute right-0 bottom-0' />}
        resizeHandles={resizable && !collapsed && focused ? ['se'] : []}
        onResizeStart={() => setResizing(true)}
        onResize={(_, { size: newSize }) => setPendingSize(pendingSize => ({
          // subtract current size to get delta
          height: pendingSize.height + newSize.height - size.height,
          width: pendingSize.width + newSize.width - size.width
        }))}
        onResizeStop={() => setResizing(false)}
      >
        <div
          ref={ref}
          className='relative flex flex-col'
          style={{
            width: `${width}px`,
            height: collapsed ? 'inherit' : `${height}px`,
            transform: `translate(${position.x}px, ${position.y}px)`
          }}
          onMouseDownCapture={() => onFocus()}
        >
          <TitleBar
            className='flex-none'
            title={title}
            collapsed={collapsed}
            focused={focused}
            resizable={resizable}
            onClose={onClose}
            onCollapse={() => setCollapsed(c => !c)}
            onOptimise={() => onResize(optimalSize)}
          />
          <Body className='flex-1 min-h-0' resizable={resizable} collapsed={collapsed} focused={focused}>
            {children}
          </Body>
          {dragging
            ? <Ghost type='move' position={pendingOffset} />
            : null}
          {resizing
            ? <Ghost type='resize' style={{ width: `${pendingSize.width}px`, height: `${pendingSize.height}px` }} />
            : null}
        </div>
      </Resizable>
    </Draggable>
  )
}

export default Window
