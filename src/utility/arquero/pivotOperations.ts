import * as aq from 'arquero';
import { PivotOptions } from 'arquero/dist/types/table/types';
import { ColumnDefinition } from 'tabulator-tables';

export interface PivotConfiguration<T> {
    groupBy: (keyof T & string)[];
    splitBy: (keyof T & string)[];
    computeOn: {
        title?: string;
        key: (keyof T & string);
        function: "sum" | "average" | "count" | "min" | "max" | "median" | "product";
    }[];
}

export const pivot = <T,>(data: T[], config: PivotConfiguration<T>) => {

    const { groupBy, splitBy, computeOn } = config;
    const computeEntry = computeOn?.map((c) => ({ [c.title ?? c.key]: aq.op[c.function](c.key) as any })) ?? [];
    const dt = aq.from(data);

    const options: PivotOptions = {
        keySeparator: "$",
        valueSeparator: "@"
    }

    let newData = dt
        .groupby(groupBy)
        //.pivot(splitBy, [{ amount: aq.op.sum("amount") }], options);
        .pivot(splitBy, computeEntry, options);


    //generate summaries by pivoting on the same data but excluding one column at a time
    for (var x = 1; x < groupBy.length; x++) {
        const summaryData = dt
            .groupby(groupBy.slice(0, -x)) // Group by all but the last column (e.g., 'age')
            //.pivot(splitBy, [{ amount: aq.op.sum("amount"), average: aq.op.average("amount") }], options);
            .pivot(splitBy, computeEntry, options);

        // Combine the pivoted data and summary data
        newData = newData.concat(summaryData);
    }



    const finalData = newData.orderby(groupBy);



    const objects = finalData.objects();

    // Establish the tree hierarchy for collapsing rows over a key (Name)
    objects.forEach((obj: any) => {
        for (var x = 0; x < groupBy.length; x++) {
            const key = groupBy[x];
            //console.log("Checking object key: ", obj, key);
            if (obj[key] !== undefined) {
                obj["Name"] = obj[key];
                //console.log("Setting name: ", key);
            }
        }
    });

    //console.log("Objects: ", objects);

    return objects;
};




export const createHierarchalDataFromPivotedData = (pivotedData: any[], groupingFields: string[]): any[] => {
    // Base case: if no grouping fields left, return data as is
    if (groupingFields.length === 0) {
        return pivotedData;
    }

    const field = groupingFields[0];
    const restFields = groupingFields.slice(1);

    const groups = new Map<string, any[]>();
    const itemsWithoutField: any[] = [];

    for (const item of pivotedData) {
        if (item.hasOwnProperty(field)) {
            const key = item[field];
            if (!groups.has(key)) {
                groups.set(key, []);
            }
            groups.get(key)!.push(item);
        } else {
            itemsWithoutField.push(item);
        }
    }

    const result: any[] = [];

    for (const [key, groupItems] of groups) {
        const groupObj: any = { [field]: key };

        // Aggregate data from items that don't have further grouping fields
        const itemsAtThisLevel = groupItems.filter(item =>
            restFields.every(f => !item.hasOwnProperty(f))
        );

        // Merge data from itemsAtThisLevel into groupObj
        for (const item of itemsAtThisLevel) {
            for (const k in item) {
                if (!groupingFields.includes(k) && k !== field) {
                    groupObj[k] = item[k];
                }
            }
        }

        // Exclude itemsAtThisLevel from groupItems before recursing
        const itemsToRecurse = groupItems.filter(item =>
            restFields.some(f => item.hasOwnProperty(f))
        );

        // Recurse to process the rest of the grouping fields
        const children = createHierarchalDataFromPivotedData(itemsToRecurse, restFields);

        if (children.length > 0) {
            groupObj['_children'] = children;
        }

        result.push(groupObj);
    }

    // Handle items without the current grouping field
    if (itemsWithoutField.length > 0) {
        // Merge these items into the result as they don't belong to any group
        for (const item of itemsWithoutField) {
            result.push(item);
        }
    }

    return result;
};



export const buildColumnsFromPivotedData = (pivotedData: any[], groupBy: string[]) => {
    if (!pivotedData.length) { return []; }

    const keys = Object.keys(pivotedData[0]!);

    const singleGroupKeys: string[] = [];
    const multiGroupKeys: string[] = [];

    // Separate keys into single-group and multi-group
    for (const key of keys) {
        const groups = key.split(/[$@]/g);
        if (groups.length === 1) {
            singleGroupKeys.push(key);
        } else {
            multiGroupKeys.push(key);
        }
    }

    // Build a tree representation of the groups for multi-group keys
    const buildTree = (keys: string[]) => {
        const tree: any = {};
        for (const key of keys) {
            const groups = key.split(/[$@]/g);
            let currentNode = tree;
            for (let i = 0; i < groups.length; i++) {
                const group = groups[i];
                if (!currentNode[group]) {
                    currentNode[group] = {};
                }
                currentNode = currentNode[group];
            }
            // At leaf node, store the original key
            currentNode._field = key;
        }
        return tree;
    };

    // Recursively build column definitions from the tree
    const buildColumns = (node: any): ColumnDefinition[] => {
        const columns: ColumnDefinition[] = [];
        for (const key in node) {
            if (key === '_field') {
                continue; // Skip the _field property
            }
            const childNode = node[key];
            const column: ColumnDefinition = { title: key };
            const childColumns = buildColumns(childNode);
            if (childColumns.length > 0) {
                column.columns = childColumns;
            } else if (childNode._field) {
                column.field = childNode._field;
            }
            columns.push(column);
        }
        return columns;
    };

    const tree = buildTree(multiGroupKeys);
    let columns = buildColumns(tree);

    if (multiGroupKeys.length === 0) {
        for (const key of singleGroupKeys) {
            const column: ColumnDefinition = { title: key, field: key };
            columns.push(column);
        }
    }

    columns = columns.filter(c => !groupBy.includes(c.title));


    columns.unshift({
        title: "Name",
        field: "Name",
        width: 200,
        responsive: 0,
        editable: false
    });

    return columns;
};



function getGroupIdentifier(row: any, groupedBy: string[], maxDepth: number = 1e99): string {
    return groupedBy.filter((k, i) => row[k] !== undefined && i <= maxDepth).map((key) => row[key]).join(" - ");
};
/**
 * Look at an index and see what the depth of that row is 
 */
function getDepth(dataset: any[], index: number, groupedBy: string[]): number {
    const row = dataset[index];
    let depth = 0;
    for (var x = 0; x < groupedBy.length; x++) {
        if (row[groupedBy[x]] !== undefined) {
            depth = x;
        }
    }
    return depth;
}
export function groupData(dataset: any[], groupedBy: string[]): any[] {
    const groups: any[] = [];
    const groupMap = new Map<string, any>();

    for (let x = 0; x < dataset.length; x++) {
        const row = dataset[x];
        const thisDepth = getDepth(dataset, x, groupedBy);
        const groupId = getGroupIdentifier(row, groupedBy);
        const newGroup = {
            ...row,
            isCollapsed: false,
            _children: undefined
        };

        groupMap.set(groupId, newGroup);

        if (thisDepth === 0) {
            groups.push(newGroup);
        } else {
            const parentGroupId = getGroupIdentifier(row, groupedBy, thisDepth - 1);
            const parentGroup = groupMap.get(parentGroupId);

            if (!parentGroup._children) {
                parentGroup._children = [];
            }
            parentGroup._children.push(newGroup);
        }
    }

    return groups;
}