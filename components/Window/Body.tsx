import { HTMLAttributes, PropsWithChildren, useCallback, useEffect, useLayoutEffect, useState } from 'react'
import { useResizeDetector } from 'react-resize-detector'
import { clamp } from '../../utils'
import ScrollBar, { ScrollBarProps } from './ScrollBar'
import { Size2D, Vector2D } from './types'

type FrameProps = PropsWithChildren<HTMLAttributes<HTMLDivElement>> & {
  collapsed: boolean
  focused: boolean
}

type BodyProps = FrameProps & {
  resizable: boolean
  focused: boolean
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

const Body = ({ resizable, focused, children, ...props }: BodyProps) => {
  const gridTemplate = resizable ? '1fr 16px' : '1fr'
  const border = resizable ? 'border-l border-t' : 'border'
  const borderColour = focused ? 'border-[rgb(51,51,51)] border-r-[rgb(62,62,62)] border-b-[rgb(59,59,59)]' : 'border-[rgb(121,121,121)] border-l-[rgb(124,124,124)]'

  const [scrollPosition, setScrollPosition] = useState<Vector2D>({ x: 0, y: 0 })
  const [contentSize, setContentSize] = useState<Size2D|null>(null)
  const [displayedSize, setDisplayedSize] = useState<Size2D|null>(null)
  const { width: resizeWidth, height: resizeHeight, ref: contentRef } = useResizeDetector<HTMLDivElement>()

  useEffect(() => {
    setDisplayedSize(
      resizeWidth === undefined || resizeHeight === undefined
        ? null
        : { width: resizeWidth, height: resizeHeight }
    )

    if (contentRef.current) {
      setScrollPosition({ x: contentRef.current.scrollLeft, y: contentRef.current.scrollTop })
    }
  }, [resizeWidth, resizeHeight, contentRef])

  useLayoutEffect(() => {
    setContentSize(
      contentRef.current
        ? { width: contentRef.current.scrollWidth, height: contentRef.current.scrollHeight }
        : null
    )
  }, [contentRef])

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
  }, [contentRef, scrollPosition])

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

export default Body
