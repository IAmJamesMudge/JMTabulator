import type { Meta, StoryObj } from '@storybook/react';
import { fn } from '@storybook/test';

import DataTable from './DataTable';
import { generateTestData } from '../../utility/generateFakeData';
import React from 'react';

// More on how to set up stories at: https://storybook.js.org/docs/writing-stories#default-export
const meta = {
  title: 'Example/DataTable',
  component: DataTable,
  parameters: {
    // Optional parameter to center the component in the Canvas. More info: https://storybook.js.org/docs/configure/story-layout
    layout: 'centered',
  },
  // This component will have an automatically generated Autodocs entry: https://storybook.js.org/docs/writing-docs/autodocs
  tags: ['autodocs'],
  // https://storybook.js.org/docs/api/argtypes
  argTypes: {
    data: {
      table: {
        disable: true
      }
    },
    //@ts-ignore
    itemCount: {
      control: { type: 'number', min: 1 },
      description: 'Number of test items to generate',
      defaultValue: 10,
    },
    seed: {
      control: { type: 'number', min: 0 },
      description: 'Seed for test data generation',
      defaultValue: 100,
    },
    enablePivot: {
      control: { type: 'boolean' },
      description: 'Enable pivot table',
      defaultValue: false
    }
  },
  // https://storybook.js.org/docs/essentials/actions#action-args
  args: { 
    data: generateTestData(100, 123)
  },
} satisfies Meta<typeof DataTable>;

export default meta;
type Story = StoryObj<typeof meta>;

// More on writing stories with args: https://storybook.js.org/docs/writing-stories/args
export const Basic: Story = {
  args: {
    movableRows: true,
    pivot: {
      groupBy: ["category", "subcategory", "payment_method"] as any,
      splitBy: ["region", "gender", "orderStatus"] as any,
    }
  },
  render: function Render(args, context) {
    
    const data= generateTestData((args as any).itemCount, (args as any).seed);

    console.log("Generated test data: ", data);

    const finalArgs = {...args, data};
    if (!(finalArgs as any).enablePivot) {
      delete finalArgs.pivot;
    }

    return <DataTable {...finalArgs} />;
  }
};
