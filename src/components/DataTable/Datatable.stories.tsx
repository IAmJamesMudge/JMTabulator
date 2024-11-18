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
  //tags: ['autodocs'],
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
    }
  },
  // https://storybook.js.org/docs/essentials/actions#action-args
  args: { 
    data: [],
    //@ts-ignore
    itemCount: 100,
    seed: 123
  },
} satisfies Meta<typeof DataTable>;

export default meta;
type Story = StoryObj<typeof meta>;


// More on writing stories with args: https://storybook.js.org/docs/writing-stories/args
export const Basic: Story = {
  args: {
    movableRows: false,
    autoColumns: true
  },
  render: function Render(args, context) {
    
    const data= generateTestData((args as any).itemCount, (args as any).seed);

    return <DataTable {...args} data={data} />;
  }
};


export const Basic_Movable_Rows: Story = {
  args: {
    movableRows: true,
  },
  render: function Render(args, context) {
    
    const data= generateTestData((args as any).itemCount, (args as any).seed);

    const finalArgs = {...args, data};
    delete finalArgs.pivot;

    return <DataTable {...finalArgs} />;
  }
};

export const Pivot: Story = {
  args: {
    movableRows: false,
    pivot: {
      groupBy: ["category", "subcategory", "payment_method"] as any,
      splitBy: ["region", "gender", "orderStatus"] as any,
      computeOn: [{function: "sum", key: "amount"}] as any
    },
    //@ts-ignore
    itemCount: 1000
  },
  argTypes: {
    movableRows: {
      table: {
        disable: true
      }
    },
  },
  
  render: function Render(args, context) {
    
    const data= generateTestData((args as any).itemCount, (args as any).seed);

    const finalArgs = {...args, data};

    return <DataTable {...finalArgs} />;
  }
};
