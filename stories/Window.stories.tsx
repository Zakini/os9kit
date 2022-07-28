import { useEffect } from '@storybook/addons'
import { ComponentMeta, ComponentStory } from '@storybook/react'
import { useState } from 'react'
import Window from '../components/Window'

export default {
  title: 'Window',
  args: {
    title: 'Example Window',
    position: { x: 0, y: 0 },
    size: { width: 200, height: 200 },
    resizable: false
  }
} as ComponentMeta<typeof Window>

const Template: ComponentStory<typeof Window> = ({ position: inputPosition, size: inputSize, ...args }) => {
  const [position, setPosition] = useState(inputPosition)
  const [size, setSize] = useState(inputSize)

  useEffect(() => {
    setPosition(inputPosition)
  }, [inputPosition])

  useEffect(() => {
    setSize(inputSize)
  }, [inputSize])

  return (
    <Window
      position={position}
      size={size}
      {...args}
      onMove={setPosition}
      onResize={setSize}
      onClose={() => alert('Window should close')}
    >
      <div
        className='bg-white'
        style={{
          height: 500,
          width: 500,
          // see: https://cssgradient.io/blog/gradient-patterns/#checkerboard
          backgroundImage: [
            'linear-gradient(45deg, #ccc 25%, transparent 25%)',
            'linear-gradient(-45deg, #ccc 25%, transparent 25%)',
            'linear-gradient(45deg, transparent 75%, #ccc 75%)',
            'linear-gradient(-45deg, transparent 75%, #ccc 75%)'
          ].join(', '),
          backgroundSize: '20px 20px',
          backgroundPosition: '0 0, 0 10px, 10px -10px, -10px 0px'
        }}
      />
    </Window>
  )
}

export const Basic = Template.bind({})

export const Resizable = Template.bind({})
Resizable.args = {
  resizable: true
}
