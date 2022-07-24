import { useEffect } from '@storybook/addons'
import { ComponentMeta, ComponentStory } from '@storybook/react'
import { useState } from 'react'
import Window from '../components/Window'

export default {
  title: 'Window',
  args: {
    title: 'Example Window',
    position: { x: 0, y: 0 },
    size: { width: 200, height: 200 }
  }
} as ComponentMeta<typeof Window>

const Template: ComponentStory<typeof Window> = ({ position: inputPosition, ...args }) => {
  const [position, setPosition] = useState(inputPosition)

  useEffect(() => {
    setPosition(inputPosition)
  }, [inputPosition])

  return (
    <Window
      position={position}
      {...args}
      onMove={setPosition}
      onClose={() => alert('Window should close')}
    />
  )
}

export const Default = Template.bind({})
