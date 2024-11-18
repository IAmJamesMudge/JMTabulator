import { RowComponent } from "tabulator-tables";
import { removeAllRanges } from "../helpers/removeAllRanges";

export const onDataTreeRowCollapsed = (row: RowComponent) => {
    const table = row.getTable();
    removeAllRanges(table);
};

export const onDataTreeRowExpanded = (row: RowComponent) => {
    const table = row.getTable();
    removeAllRanges(table);
};