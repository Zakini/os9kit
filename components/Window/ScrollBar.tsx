import { HTMLAttributes, useEffect, useState } from 'react'
import { useLongPress } from 'use-long-press'
import { DraggableCore as Draggable } from 'react-draggable'
import { clamp } from '../../utils'
import Grill from './Grill'
import { Axis, Direction } from './types'

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
  onTrigger: () => void
}

export type ScrollBarProps = Omit<HTMLAttributes<HTMLDivElement>, 'onScroll'>
  & Omit<ScrollBarThumbProps, 'onDrag'>
  & {
    focused: boolean
    onScroll: (axis: Axis, amount: number) => void
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

const ScrollBarButton = ({ direction, active, onTrigger, className, ...props }: ScrollBarButtonProps) => {
  const [triggered, setTriggered] = useState(false)

  const makeHoldHandlers = useLongPress(() => setTriggered(true), {
    threshold: 150,
    onStart: onTrigger,
    onFinish: () => setTriggered(false)
  })

  useEffect(() => {
    if (!triggered) return

    const interval = setInterval(onTrigger, 50)

    return () => clearInterval(interval)
  }, [triggered, onTrigger])

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
      {...makeHoldHandlers()}
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
    : clamp(position / (totalSpace - spaceShown), 0, 1)

  const scrollButtonAmount = 15

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
              onTrigger={() => onScroll(axis, -scrollButtonAmount)}
            />
            <ScrollBarButton
              direction={axis === 'x' ? 'right' : 'down'}
              active={scrollable}
              className={`flex-none ${dividerSide} ${scrollable ? 'border-[rgb(56,56,56)]' : 'border-[rgb(161,161,161)]'}`}
              onTrigger={() => onScroll(axis, scrollButtonAmount)}
            />
          </div>
          : null}
      </div>
    </div>
  )
}

export default ScrollBar
