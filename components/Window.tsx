import { forwardRef, HTMLAttributes, MouseEventHandler, PropsWithChildren, useCallback, useEffect, useLayoutEffect, useRef, useState } from 'react'
import { DraggableCore as Draggable } from 'react-draggable'
import { Resizable } from 'react-resizable'
import { clamp, usePrevious } from '../utils'
import 'react-resizable/css/styles.css'

type Vector2D = {
  x: number
  y: number
}

type Size2D = {
  width: number
  height: number
}

type Axis = 'x' | 'y'

type Direction = 'up' | 'down' | 'left' | 'right'

type TitleBarButtonProps = HTMLAttributes<HTMLButtonElement> & {
  type: 'close' | 'collapse'
}

type GrillProps = HTMLAttributes<HTMLDivElement> & {
  spacing?: number
  colourA?: string
  colourB?: string
}

type TitleBarProps = HTMLAttributes<HTMLDivElement> & {
  title: string
  collapsed: boolean
  focused: boolean
  onClose: MouseEventHandler<HTMLButtonElement>
  onCollapse: MouseEventHandler<HTMLButtonElement>
}

type ScrollBarTrackProps = {
  scrollable: boolean
  focused: boolean
}

type ScrollBarThumbProps = {
  axis: Axis
  // We don't know the size of the content on first render, so this needs to be nullable
  spaceShown: number | null
  totalSpace: number | null
  position: number
  onDrag: (amount: number) => void
}

type ScrollBarButtonProps = HTMLAttributes<HTMLButtonElement> & {
  direction: Direction
  active: boolean
}

type ScrollBarProps = Omit<HTMLAttributes<HTMLDivElement>, 'onScroll'>
  & Omit<ScrollBarThumbProps, 'onDrag'>
  & {
    focused: boolean
    onScroll: (axis: Axis, amount: number) => void
  }

type FrameProps = PropsWithChildren<HTMLAttributes<HTMLDivElement>> & {
  collapsed: boolean
  focused: boolean
}

type BodyProps = FrameProps & {
  resizable: boolean
  focused: boolean
}

type GhostProps = HTMLAttributes<HTMLDivElement> & {
  type: 'move' | 'resize'
  position?: Vector2D
}

type WindowProps = PropsWithChildren<Pick<TitleBarProps, 'title' | 'onClose'>> & {
  position: Vector2D
  size: Size2D
  resizable: boolean
  focused: boolean
  onMove: (position: Vector2D) => void
  onResize: (size: Size2D) => void
  onFocus: () => void
  onBlur: () => void
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
      {type === 'collapse'
        ? <div className='absolute h-[3px] w-full top-1/2 -translate-y-1/2 border-y border-[rgb(78,78,78)]' />
        : null}
    </button>
  )
}

const Grill = ({ spacing = 2, colourA = 'rgb(153,153,153)', colourB = 'rgb(221,221,221)', style, ...props }: GrillProps) => (
  <div style={{
    ...style,
    backgroundImage: `repeating-linear-gradient(to bottom, ${colourA}, ${colourB} ${spacing}px)`
  }} {...props} />
)

const TitleBar = ({ title, collapsed, focused, onClose, onCollapse, className, ...props }: TitleBarProps) => {
  const layout = `flex ${focused ? 'justify-between' : 'justify-center'} items-center space-x-[5px] ${collapsed ? 'h-[22px]' : 'h-[20px]'} p-[4px] pb-[5px]`
  const font = `text-[9px] ${focused ? 'text-[rgb(25,25,25)]' : 'text-[rgb(132,132,132)]'}`
  const bg = focused ? 'bg-[rgb(204,204,204)]' : 'bg-[rgb(221,221,221)]'
  const border = `border border-r-2 ${collapsed ? 'border-b-2' : 'border-b-0'} ${focused ? 'border-[rgb(45,45,51)] border-r-[rgb(19,19,19)]' : 'border-[rgb(104,104,110)] border-r-[rgb(102,102,102)]'}`

  return (
    // TODO border gradient
    <div className={`${layout} ${font} ${bg} ${border} ${className ?? ''}`} {...props}>
      {focused
        ? <>
            <TitleBarButton type='close' className='flex-none' onClick={onClose} />
            <Grill className='flex-1 h-[11px] border-t border-[rgb(231,231,231)]' />
          </>
        : null}
      <span className='flex-none cursor-default'>{title}</span>
      {focused
        ? <>
            <Grill className='flex-1 h-[11px] border-t border-[rgb(231,231,231)]' />
            {/* TODO add shrink button when window is resizable */}
            <TitleBarButton type='collapse' className='flex-none' onClick={onCollapse} />
          </>
        : null}
    </div>
  )
}

const Frame = ({ className, collapsed, focused, children, ...props }: FrameProps) => {
  const border = `border-2 border-l border-t-0  ${focused ? 'border-l-[rgb(45,45,51)] border-[rgb(19,19,19)]' : 'border-l-[rgb(104,104,110)] border-[rgb(102,102,102)]'}`

  return (
    <div
      // TODO outer border should be a drop shadow
      className={`${collapsed ? 'hidden' : ''} ${border} ${className ?? ''}`}
      {...props}
    >
      {/* TODO border gradient 217 -> 140, left to right, top to bottom */}
      <div className={`h-full border-4 border-t-0 ${focused ? 'border-[rgb(204,204,204)]' : 'border-[rgb(221,221,221)]'}`}>
        {children}
      </div>
    </div>
  )
}

const ScrollBarTrack = ({ scrollable, focused }: ScrollBarTrackProps) => {
  return (
    <div
      className={`h-full ${scrollable && focused ? 'bg-[rgb(170,170,170)]' : 'bg-[rgb(238,238,238)]'}`}
      style={scrollable && focused ? { boxShadow: 'inset 1px 1px 2px rgb(106,106,106)' } : {}}
    />
  )
}

const ScrollBarThumb = ({ axis, spaceShown, totalSpace, position, onDrag }: ScrollBarThumbProps) => {
  const [dragging, setDragging] = useState(false)

  const displayFraction = spaceShown === null || totalSpace === null ? null : spaceShown / totalSpace
  const thumbSpanDirection = axis === 'x' ? 'h-full' : 'w-full'
  const thumbFillDirection = axis === 'x' ? 'width' : 'height'
  const thumbMoveDirection = axis === 'x' ? 'left' : 'top'
  const thumbBorderEnds = axis === 'x' ? 'border-x' : 'border-y'
  const thumbSize = displayFraction === null ? '0' : `calc(${displayFraction * 100}% + 2px)`

  const layout = `absolute top-0 flex place-content-center place-items-center ${thumbSpanDirection}`
  const background = dragging ? 'bg-[rgb(102,102,197)]' : 'bg-[rgb(153,153,255)]'
  const borders = `${thumbBorderEnds} ${dragging ? 'border-[rgb(21,21,33)]' : 'border-[rgb(28,28,40)]'}`

  return (
    <Draggable
      onStart={() => setDragging(true)}
      onDrag={(e, { [axis === 'x' ? 'deltaX' : 'deltaY']: amount }) => onDrag(amount)}
      onStop={() => setDragging(false)}
    >
      <div
        className={`${layout} ${background} ${borders}`}
        style={{
          [thumbFillDirection]: thumbSize,
          // bounds of thumb need to be 1px beyond ScrollBar limits to prevent double border
          [thumbMoveDirection]: `calc((100% - ${thumbSize} + 2px) * ${position} - 1px)`,
          boxShadow: `${axis === 'x' ? '1px 0' : '0 1px'} 2px rgb(106,106,106)`
        }}
      >
        <Grill
          className={`h-[8px] w-[8px] ${axis === 'x' ? '-rotate-90' : ''}`}
          colourA={dragging ? 'rgb(115,115,207)' : 'rgb(166,166,229)'}
          colourB={dragging ? 'rgb(38,38,123)' : 'rgb(89,89,179)'}
        />
      </div>
    </Draggable>
  )
}

const ScrollBarButton = ({ direction, active, className, ...props }: ScrollBarButtonProps) => {
  // TODO more accurate arrows
  const arrows = {
    up: '▲',
    down: '▼',
    left: '◀',
    right: '▶'
  }

  const colour = active ? 'text-black bg-[rgb(221,221,221)]' : 'text-[rgb(136,136,136)] bg-[rgb(238,238,238)]'

  return (
    <button
      className={`h-[14px] w-[14px] text-[8px] ${colour} cursor-default ${className ?? ''}`}
      {...props}
    >
      {arrows[direction]}
    </button>
  )
}

const ScrollBar = ({ axis, spaceShown, totalSpace, position, focused, onScroll, className, ...props }: ScrollBarProps) => {
  const borderSides = axis === 'x' ? 'border-y' : 'border-x'
  const flexDirection = axis === 'x' ? 'flex-row' : 'flex-col'
  const dividerSide = axis === 'x' ? 'border-l' : 'border-t'

  const scrollable = spaceShown !== null && totalSpace !== null && spaceShown < totalSpace
  const thumbPosition = spaceShown === null || totalSpace === null
    ? 0
    : position / (totalSpace - spaceShown)

  const scrollButtonAmount = 25

  return (
    <div className={`${borderSides} ${focused ? 'border-[rgb(62,62,62)]' : 'border-[rgb(126,126,126)]'} ${className ?? ''}`} {...props}>
      <div className={`h-full flex ${flexDirection}`}>
        <div className='relative grow'>
          <ScrollBarTrack scrollable={scrollable} focused={focused} />
          {scrollable && focused
            ? <ScrollBarThumb
              position={thumbPosition}
              // HACK need to boost the scroll speed here to match how the mouse moves, why?
              onDrag={amount => onScroll(axis, amount * (totalSpace / spaceShown) * 1.21)}
              {...({ axis, spaceShown, totalSpace })}
            />
            : null}
        </div>
        {focused
          ? <div className={`z-10 flex-none flex ${flexDirection} ${dividerSide} ${scrollable ? 'border-[rgb(53,53,53)]' : 'border-[rgb(123,123,123)]'}`}>
            {/* TODO click and hold to keep scrolling */}
            <ScrollBarButton
              direction={axis === 'x' ? 'left' : 'up'}
              active={scrollable}
              className='flex-none'
              onClick={() => onScroll(axis, -scrollButtonAmount)}
            />
            <ScrollBarButton
              direction={axis === 'x' ? 'right' : 'down'}
              active={scrollable}
              className={`flex-none ${dividerSide} ${scrollable ? 'border-[rgb(56,56,56)]' : 'border-[rgb(161,161,161)]'}`}
              onClick={() => onScroll(axis, scrollButtonAmount)}
            />
          </div>
          : null}
      </div>
    </div>
  )
}

const DragHandle = forwardRef<HTMLDivElement, HTMLAttributes<HTMLDivElement>>(function DragHandle ({ className, ...props }, ref) {
  return (
    <div ref={ref} className={`h-[21px] w-[21px] border-b-2 border-r-2 border-[rgb(19,19,19)] ${className ?? ''}`} {...props}>
      <Grill spacing={3} className='h-[10px] w-[10px] -rotate-45 translate-x-[4px] translate-y-[4px] border-t border-[rgb(231,231,231)]' />
    </div>
  )
})

const Body = ({ resizable, focused, children, ...props }: BodyProps) => {
  const gridTemplate = resizable ? '1fr 16px' : '1fr'
  const border = resizable ? 'border-l border-t' : 'border'
  const borderColour = focused ? 'border-[rgb(51,51,51)] border-r-[rgb(62,62,62)] border-b-[rgb(59,59,59)]' : 'border-[rgb(121,121,121)] border-l-[rgb(124,124,124)]'

  const [scrollPosition, setScrollPosition] = useState<Vector2D>({ x: 0, y: 0 })
  const [contentSize, setContentSize] = useState<Size2D|null>(null)
  const [displayedSize, setDisplayedSize] = useState<Size2D|null>(null)
  const contentRef = useRef<HTMLDivElement>(null)

  useLayoutEffect(() => {
    setContentSize(
      contentRef.current
        ? { width: contentRef.current.scrollWidth, height: contentRef.current.scrollHeight }
        : null
    )
    setDisplayedSize(
      contentRef.current
        ? { width: contentRef.current.clientWidth, height: contentRef.current.clientHeight }
        : null
    )
  }, [])

  const handleScroll = useCallback<ScrollBarProps['onScroll']>((axis, amount) => {
    if (!contentSize || !displayedSize) return

    const sizeDimension = ({ x: 'width', y: 'height' } as const)[axis]

    setScrollPosition(scrollPosition => ({
      ...scrollPosition,
      [axis]: clamp(scrollPosition[axis] + amount, 0, contentSize[sizeDimension] - displayedSize[sizeDimension])
    }))
  }, [contentSize, displayedSize])

  useEffect(() => {
    if (!contentRef.current) return

    contentRef.current.scrollLeft = scrollPosition.x
    contentRef.current.scrollTop = scrollPosition.y
  }, [scrollPosition])

  return (
    <Frame focused={focused} {...props}>
      <div
        className={`no-drag h-full grid ${border} ${borderColour}`}
        style={{ gridTemplateColumns: gridTemplate, gridTemplateRows: gridTemplate }}
      >
        <div ref={contentRef} className='overflow-hidden'>
          {children}
        </div>
        {resizable
          ? <>
            <ScrollBar
              axis='y'
              spaceShown={displayedSize?.height ?? null}
              totalSpace={contentSize?.height ?? null}
              position={scrollPosition.y}
              className='flex-none'
              focused={focused}
              onScroll={handleScroll}
            />
            <ScrollBar
              axis='x'
              spaceShown={displayedSize?.width ?? null}
              totalSpace={contentSize?.width ?? null}
              position={scrollPosition.x}
              className='flex-none'
              focused={focused}
              onScroll={handleScroll}
            />
            <div className={`border-l border-t ${focused ? 'bg-[rgb(204,204,204)] border-[rgb(62,62,62)]' : 'bg-[rgb(221,221,221)] border-[rgb(121,121,121)]'}`} />
          </>
          : null}
      </div>
    </Frame>
  )
}

const Ghost = ({ type, position = { x: 0, y: 0 }, className, style, ...props }: GhostProps) => (
  <div
    // TODO border with 1px wide black and white stripes
    className={`z-10 absolute top-0 h-full w-full border border-black border-dotted ${type === 'resize' ? 'p-[5px] pt-[19px]' : ''} ${className ?? ''}`}
    style={{ transform: `translate(${position.x}px, ${position.y}px)`, ...style }}
    {...props}
  >
    {type === 'resize'
      ? (
        <div
          className='grid h-full w-full border-t border-l border-black border-dotted'
          style={{ gridTemplateColumns: 'auto 16px', gridTemplateRows: 'auto 16px' }}
        >
          <div className='col-start-2 h-full border-r border-black border-dotted' />
          <div className='row-start-2 h-full border-b border-black border-dotted' />
          <div className='col-start-2 row-start-2 h-full border-t border-l border-black border-dotted' />
        </div>
        )
      : null}
  </div>
)

const Window = ({ title, position, size, resizable, focused, onMove, onResize, onClose, onFocus, onBlur, children }: WindowProps) => {
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
    // TODO adjust scrollbar thumb size as window size changes
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
            onClose={onClose}
            onCollapse={() => setCollapsed(c => !c)}
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
