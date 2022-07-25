import { HTMLAttributes, MouseEventHandler, PropsWithChildren, useCallback, useEffect, useLayoutEffect, useRef, useState } from 'react'
import { DraggableCore as Draggable } from 'react-draggable'
import { clamp, usePrevious } from '../utils'

type Vector2D = {
  x: number
  y: number
}

type Size2D = {
  width: number
  height: number
}

type Axis = 'horizontal' | 'vertical'

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
  onClose: MouseEventHandler<HTMLButtonElement>
  onCollapse: MouseEventHandler<HTMLButtonElement>
}

type ScrollBarThumbProps = {
  axis: Axis
  // We don't know the size of the content on first render, so this needs to be nullable
  spaceShown: number | null
  totalSpace: number | null
  position: number
}

type ScrollBarButtonProps = HTMLAttributes<HTMLButtonElement> & {
  direction: Direction
  active: boolean
}

type ScrollBarProps = Omit<HTMLAttributes<HTMLDivElement>, 'onScroll'> & ScrollBarThumbProps & {
  onScroll: (axis: Axis, amount: number) => void
}

type FrameProps = PropsWithChildren<HTMLAttributes<HTMLDivElement>> & {
  collapsed: boolean
}

type BodyProps = FrameProps & {
  resizable: boolean
}

type GhostProps = HTMLAttributes<HTMLDivElement> & {
  position: Vector2D
}

type WindowProps = PropsWithChildren<Pick<TitleBarProps, 'title' | 'onClose'>> & {
  position: Vector2D
  size: Size2D
  resizable: boolean
  onMove: (position: Vector2D) => unknown
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

const TitleBar = ({ title, collapsed, onClose, onCollapse, className, ...props }: TitleBarProps) => {
  const layout = `flex justify-between items-center space-x-[5px] ${collapsed ? 'h-[22px]' : 'h-[20px]'} p-[4px] pb-[5px]`
  const font = 'text-[9px]'
  const bg = 'bg-[rgb(204,204,204)]'
  const border = `border border-r-2 ${collapsed ? 'border-b-2' : 'border-b-0'} border-[rgb(45,45,51)] border-r-[rgb(19,19,19)]`

  return (
    // TODO border gradient
    <div className={`${layout} ${font} ${bg} ${border} ${className ?? ''}`} {...props}>
      <TitleBarButton type='close' className='flex-none' onClick={onClose} />
      <Grill className='flex-1 h-[11px] border-t border-[rgb(231,231,231)]' />
      <span className='flex-none cursor-default'>{title}</span>
      <Grill className='flex-1 h-[11px] border-t border-[rgb(231,231,231)]' />
      {/* TODO add shrink button when window is resizable */}
      <TitleBarButton type='collapse' className='flex-none' onClick={onCollapse} />
    </div>
  )
}

const Frame = ({ className, collapsed, children, ...props }: FrameProps) => (
  <div
    // TODO outer border should be a drop shadow
    className={`${collapsed ? 'hidden' : ''} border-2 border-l border-t-0 border-l-[rgb(45,45,51)] border-[rgb(19,19,19)] ${className ?? ''}`}
    {...props}
  >
    {/* TODO border gradient 217 -> 140, left to right, top to bottom */}
    <div className='h-full border-4 border-t-0 border-[rgb(204,204,204)]'>
      {children}
    </div>
  </div>
)

const ScrollBarThumb = ({ axis, spaceShown, totalSpace, position }: ScrollBarThumbProps) => {
  const displayFraction = spaceShown === null || totalSpace === null ? null : spaceShown / totalSpace
  const thumbSpanDirection = axis === 'horizontal' ? 'h-full' : 'w-full'
  const thumbFillDirection = axis === 'horizontal' ? 'width' : 'height'
  const thumbMoveDirection = axis === 'horizontal' ? 'left' : 'top'
  const thumbBorderEnds = axis === 'horizontal' ? 'border-x' : 'border-y'
  const thumbSize = displayFraction === null ? '0' : `calc(${displayFraction * 100}% + 2px)`

  return (
    <div
      className={`absolute flex place-content-center place-items-center top-0 bg-[rgb(153,153,255)] ${thumbSpanDirection} ${thumbBorderEnds} border-[rgb(28,28,40)]`}
      style={{
        [thumbFillDirection]: thumbSize,
        // TODO bounds of thumb need to be 1px beyond ScrollBar limits to prevent double border
        [thumbMoveDirection]: `calc((100% - ${thumbSize} + 2px) * ${position} - 1px)`,
        boxShadow: `${axis === 'horizontal' ? '1px 0' : '0 1px'} 2px rgb(106,106,106)`
      }}
    >
      <Grill className={`h-[8px] w-[8px] ${axis === 'horizontal' ? '-rotate-90' : ''}`} colourA='rgb(166,166,229)' colourB='rgb(89,89,179)' />
    </div>
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
      className={`h-[14px] w-[14px] text-[8px] ${colour} ${className ?? ''}`}
      {...props}
    >
      {arrows[direction]}
    </button>
  )
}

const ScrollBar = ({ axis, spaceShown, totalSpace, position, onScroll, className, ...props }: ScrollBarProps) => {
  const borderSides = axis === 'horizontal' ? 'border-y' : 'border-x'
  const flexDirection = axis === 'horizontal' ? 'flex-row' : 'flex-col'
  const dividerSide = axis === 'horizontal' ? 'border-l' : 'border-t'

  const scrollable = spaceShown !== null && totalSpace !== null && spaceShown < totalSpace
  const thumbPosition = spaceShown === null || totalSpace === null
    ? 0
    : position / (totalSpace - spaceShown)

  const scrollButtonAmount = 25

  return (
    <div className={`${borderSides} border-[rgb(62,62,62)] ${className ?? ''}`} {...props}>
      <div className={`h-full flex ${flexDirection}`}>
        <div className='relative grow'>
          {/* Track */}
          <div
            className={`h-full ${scrollable ? 'bg-[rgb(170,170,170)]' : 'bg-[rgb(238,238,238)]'}`}
            style={scrollable ? { boxShadow: 'inset 1px 1px 2px rgb(106,106,106)' } : {}}
          />
          {/* Thumb */}
          {scrollable
            ? <ScrollBarThumb position={thumbPosition} {...({ axis, spaceShown, totalSpace })} />
            : null}
        </div>
        <div className={`z-10 flex-none flex ${flexDirection} ${dividerSide} ${scrollable ? 'border-[rgb(53,53,53)]' : 'border-[rgb(123,123,123)]'}`}>
          <ScrollBarButton
            direction={axis === 'horizontal' ? 'left' : 'up'}
            active={scrollable}
            className='flex-none'
            onClick={() => onScroll(axis, -scrollButtonAmount)}
          />
          <ScrollBarButton
            direction={axis === 'horizontal' ? 'right' : 'down'}
            active={scrollable}
            className={`flex-none ${dividerSide} ${scrollable ? 'border-[rgb(56,56,56)]' : 'border-[rgb(161,161,161)]'}`}
            onClick={() => onScroll(axis, scrollButtonAmount)}
          />
        </div>
      </div>
    </div>
  )
}

const DragHandle = () => {
  return (
    <div className='border-l border-t border-[rgb(62,62,62)]'>
      <div className='absolute h-[21px] w-[21px] border-b-2 border-r-2 border-[rgb(19,19,19)] bg-[rgb(204,204,204)]'>
        <Grill spacing={3} className='h-[10px] w-[10px] -rotate-45 translate-x-[4px] translate-y-[4px] border-t border-[rgb(231,231,231)]' />
      </div>
    </div>
  )
}

const Body = ({ resizable, children, ...props }: BodyProps) => {
  const gridTemplate = resizable ? '1fr 16px' : '1fr'
  const border = resizable ? 'border-l border-t' : 'border'

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

    const axisDimension = ({ horizontal: 'x', vertical: 'y' } as const)[axis]
    const sizeDimension = ({ horizontal: 'width', vertical: 'height' } as const)[axis]

    setScrollPosition(scrollPosition => ({
      ...scrollPosition,
      [axisDimension]: clamp(scrollPosition[axisDimension] + amount, 0, contentSize[sizeDimension] - displayedSize[sizeDimension])
    }))
  }, [contentSize, displayedSize])

  useEffect(() => {
    if (!contentRef.current) return

    contentRef.current.scrollLeft = scrollPosition.x
    contentRef.current.scrollTop = scrollPosition.y
  }, [scrollPosition])

  return (
    <Frame {...props}>
      <div className={`no-drag h-full grid ${border} border-[rgb(51,51,51)] border-r-[rgb(62,62,62)] border-b-[rgb(59,59,59)]`} style={{ gridTemplateColumns: gridTemplate, gridTemplateRows: gridTemplate }}>
        <div ref={contentRef} className='overflow-hidden'>
          {children}
        </div>
        {resizable
          ? <>
            <ScrollBar
              axis='vertical'
              spaceShown={displayedSize?.height ?? null}
              totalSpace={contentSize?.height ?? null}
              position={scrollPosition.y}
              className='flex-none'
              onScroll={handleScroll}
            />
            <ScrollBar
              axis='horizontal'
              spaceShown={displayedSize?.width ?? null}
              totalSpace={contentSize?.width ?? null}
              position={scrollPosition.x}
              className='flex-none'
              onScroll={handleScroll}
            />
            <DragHandle />
          </>
          : null}
      </div>
    </Frame>
  )
}

const Ghost = ({ position, className, style, ...props }: GhostProps) => (
  <div
    // TODO border with 1px wide black and white stripes
    className={`border-2 border-black border-dotted ${className ?? ''}`}
    style={{ transform: `translate(${position.x}px, ${position.y}px)`, ...style }}
    {...props}
  />
)

const Window = ({ title, position, size: { width, height }, resizable, onMove, onClose, children }: WindowProps) => {
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
        <Body className='flex-1 min-h-0' resizable={resizable} collapsed={collapsed}>
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
