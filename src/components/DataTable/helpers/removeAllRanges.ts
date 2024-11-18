import { TabulatorFull } from "tabulator-tables";

export const removeAllRanges = (table: TabulatorFull) => {
    table.getRanges().forEach((range) => {
        range.remove();
    });
};