import { ComponentMeta, ComponentStory } from '@storybook/react'
import Window from '../components/Window'

export default {
  title: 'Window',
  args: {
    title: 'Example Window',
    onClose: () => alert('Window closed')
  }
} as ComponentMeta<typeof Window>

const Template: ComponentStory<typeof Window> = (args) => <Window {...args} />

export const Default = Template.bind({})
