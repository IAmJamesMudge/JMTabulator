import type { Meta, StoryObj } from '@storybook/react';
import { faker } from '@faker-js/faker';

import OrderedTable from './OrderedTable';
import React from 'react';

// More on how to set up stories at: https://storybook.js.org/docs/writing-stories#default-export
const meta = {
    title: 'Example/OrderedTable',
    component: OrderedTable,
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
} satisfies Meta<typeof OrderedTable>;

export default meta;
type Story = StoryObj<typeof meta>;

const generateRandomData = (numRows: number, seed: number) => {
    faker.seed(seed);
    return Array.from({ length: numRows }, (a, b) => ({
        name: faker.person.firstName(),
        age: faker.number.int({ min: 18, max: 80 }),
        city: faker.location.city()
    }));
};

const simpleData = generateRandomData(6, 123);

// More on writing stories with args: https://storybook.js.org/docs/writing-stories/args
export const Basic: Story = {
    args: {
        data: simpleData,
        columns: [
            { field: "name", title: "Name" },
            { field: "age", title: "Age" },
            { field: "city", title: "City" },
        ],
    },
    render: (args) => {

        const [data, setData] = React.useState(args.data);

        return (
            <OrderedTable
                canAddRows={args.canAddRows}
                containerStyle={args.containerStyle}
                tableStyle={args.tableStyle}
                onCancel={() => console.log("Cancelled")}
                data={data}
                columns={args.columns}
                showOrder={true}
                onSave={(data) => setData(data)}
            />
        )
    },
};
