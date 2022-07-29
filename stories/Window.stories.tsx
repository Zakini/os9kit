import { useArgs } from '@storybook/client-api'
import { ComponentMeta, ComponentStory } from '@storybook/react'
import Window from '../components/Window'

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

const Template: ComponentStory<typeof Window> = (args) => {
  const [_, updateArgs] = useArgs()

  return (
    <Window
      {...args}
      onMove={position => updateArgs({ position })}
      onResize={size => updateArgs({ size })}
      onClose={() => alert('Window should close')}
      onFocus={() => updateArgs({ focused: true })}
      onBlur={() => updateArgs({ focused: false })}
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
