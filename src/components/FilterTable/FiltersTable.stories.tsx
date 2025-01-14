import type { Meta, StoryObj } from '@storybook/react';

import React from 'react';
import FiltersTable from './FiltersTable';

// More on how to set up stories at: https://storybook.js.org/docs/writing-stories#default-export
const meta = {
  title: 'Example/FiltersTable',
  component: FiltersTable,
  parameters: {
    // Optional parameter to center the component in the Canvas. More info: https://storybook.js.org/docs/configure/story-layout
    layout: 'centered',
  },
  // This component will have an automatically generated Autodocs entry: https://storybook.js.org/docs/writing-docs/autodocs
  //tags: ['autodocs'],
  // https://storybook.js.org/docs/api/argtypes
  argTypes: {

  },
  // https://storybook.js.org/docs/essentials/actions#action-args
  args: {
  },
} satisfies Meta<typeof FiltersTable>;

export default meta;
type Story = StoryObj<typeof meta>;

// More on writing stories with args: https://storybook.js.org/docs/writing-stories/args
export const Basic: Story = {
  args: {
    fieldOptions: ["field1", "field2", "field3"],
    filters: [
      { field: "field1", type: "=", value: "value1" },
      { field: "field2", type: "!=", value: "value2" },
      { field: "field3", type: ">", value: "value3" },
    ]
  },
};
