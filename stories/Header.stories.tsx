import { ComponentMeta, ComponentStory } from '@storybook/react';
import React from 'react';

import { Header, Props as HeaderProps } from '../components/Header';

export default {
  title: 'Example/Header',
  component: Header,
  parameters: {
    // More on Story layout: https://storybook.js.org/docs/react/configure/story-layout
    layout: 'fullscreen',
  },
} as ComponentMeta<typeof Header>;

const Template = (args: HeaderProps) => <Header {...args} />;

export const LoggedIn: ComponentStory<typeof Header> = Template.bind({});
LoggedIn.args = {
  user: {
    name: 'Jane Doe',
  },
};

export const LoggedOut: ComponentStory<typeof Header> = Template.bind({});
LoggedOut.args = {};
