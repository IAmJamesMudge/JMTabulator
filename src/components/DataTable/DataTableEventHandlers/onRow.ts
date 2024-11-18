
import { RowComponent } from 'tabulator-tables';
import { removeAllRanges } from '../helpers/removeAllRanges';

export const onRowMoving = (row: RowComponent) => {
    const table = row.getTable();
    removeAllRanges(table);
    table.addRange(row.getCells()[0], row.getCells()[0]);
};

export const onRowMoved = (row: RowComponent) => {
    const table = row.getTable();
    removeAllRanges(table);
    table.addRange(row.getCells()[0], row.getCells()[0]);
};