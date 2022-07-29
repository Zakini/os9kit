import { HTMLAttributes } from 'react'

type GrillProps = HTMLAttributes<HTMLDivElement> & {
  spacing?: number
  colourA?: string
  colourB?: string
}

const Grill = ({ spacing = 2, colourA = 'rgb(153,153,153)', colourB = 'rgb(221,221,221)', style, ...props }: GrillProps) => (
  <div style={{
    ...style,
    backgroundImage: `repeating-linear-gradient(to bottom, ${colourA}, ${colourB} ${spacing}px)`
  }} {...props} />
)

export default Grill
