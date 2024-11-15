import type { Meta, StoryObj } from '@storybook/react';
import { fn } from '@storybook/test';

import DataTable from './DataTable';
import { generateTestData } from '../../utility/generateFakeData';

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
};
