import { faker } from '@faker-js/faker';

export type DataObject = {
    id: number;
    category: string;
    subcategory: string;
    amount: number;
    region: string;
    date: string;
    quantity: number;
    customer_id: number;
    age: number;
    gender: string;
    payment_method: string;
    discount: number;
    profit: number;
    cost: number;
    orderStatus: string;
    shippingMethod: string;
    feedbackScore: number;
};

const categories = [
    { name: 'Electronics', subcategories: ['Mobile Phones', 'Laptops', 'Tablets'] },
    { name: 'Clothing', subcategories: ['Shirts', 'Pants', 'Shoes'] },
    { name: 'Groceries', subcategories: ['Fruits', 'Vegetables', 'Meat'] }
];

const regions = ['USA', 'Europe', 'Asia', 'South America'];
const paymentMethods = ['Credit Card', 'Debit Card', 'PayPal', 'Bank Transfer', 'Cash'];
const genders = ['Male', 'Female', 'Non-binary', 'Prefer not to say'];
const orderStatuses = ['Completed', 'Pending', 'Cancelled', 'Returned'];
const shippingMethods = ['Standard', 'Express', 'Overnight'];

export function generateTestData(numRecords: number, seed?: number): DataObject[] {
    if (seed !== undefined) {
        faker.seed(seed);
    }
    const data: DataObject[] = [];

    for (let i = 0; i < numRecords; i++) {
        const categoryIndex = faker.number.int({ min: 0, max: categories.length - 1 });
        const category = categories[categoryIndex];
        const subcategory = faker.helpers.arrayElement(category.subcategories);
        const region = faker.helpers.arrayElement(regions);

        // Adjust amount based on category (for more realism)
        const amount = parseFloat(
            faker.finance.amount({
                min: category.name === 'Electronics' ? 1 : 5,
                max: category.name === 'Electronics' ? 1 : 5,
                dec: 2
            })
        );

        const quantity = faker.number.int({ min: 1, max: 10 });

        const customer_id = faker.number.int({ min: 1, max: 1000 });
        const age = faker.number.int({ min: 18, max: 33 });
        const gender = faker.helpers.arrayElement(genders);
        const payment_method = faker.helpers.arrayElement(paymentMethods);
        const discount = parseFloat(faker.finance.amount({ min: 0, max: 30, dec: 2 }));
        const order_status = faker.helpers.arrayElement(orderStatuses);
        const shipping_method = faker.helpers.arrayElement(shippingMethods);
        const feedback_score = faker.number.int({ min: 1, max: 5 });

        // Compute cost and profit
        const costPercentage = faker.number.int({ min: 50, max: 90 });
        const cost = parseFloat(((amount * costPercentage) / 100).toFixed(2));
        const profit = parseFloat((amount - cost).toFixed(2));

        data.push({
            id: i + 1,
            category: category.name,
            subcategory,
            amount,
            region,
            date: faker.date.between({ from: '2021-01-01', to: '2023-12-31' }).toISOString().split('T')[0],
            quantity,
            customer_id,
            age,
            gender,
            payment_method,
            discount,
            profit,
            cost,
            orderStatus: order_status,
            shippingMethod: shipping_method,
            feedbackScore: feedback_score,
        });
    }

    return data;
}
