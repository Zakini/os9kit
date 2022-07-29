import { HTMLAttributes } from 'react'
import { Vector2D } from './types'

type GhostProps = HTMLAttributes<HTMLDivElement> & {
  type: 'move' | 'resize'
  position?: Vector2D
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

export default Ghost
