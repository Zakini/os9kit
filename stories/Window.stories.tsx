import { ComponentMeta, ComponentStory } from '@storybook/react'
import Window from '../components/Window'
import { useStatefulProp } from '../utils'

export default {
  title: 'Window',
  args: {
    title: 'Example Window',
    position: { x: 0, y: 0 },
    size: { width: 200, height: 200 },
    optimalSize: { width: 300, height: 150 },
    resizable: false,
    focused: true
  }
} as ComponentMeta<typeof Window>

const Template: ComponentStory<typeof Window> = ({ position: inputPosition, size: inputSize, focused: inputFocused, ...args }) => {
  const [position, setPosition] = useStatefulProp(inputPosition)
  const [size, setSize] = useStatefulProp(inputSize)
  const [focused, setFocused] = useStatefulProp(inputFocused)

  return (
    <Window
      position={position}
      size={size}
      focused={focused}
      {...args}
      onMove={setPosition}
      onResize={setSize}
      onClose={() => alert('Window should close')}
      onFocus={() => setFocused(true)}
      onBlur={() => setFocused(false)}
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

export const Unfocused = Template.bind({})
Unfocused.args = {
  focused: false
}
