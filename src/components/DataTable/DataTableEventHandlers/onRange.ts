import { RangeComponent, CellComponent } from "tabulator-tables";

export const onRangeChanged = (range: RangeComponent, selectedCell: { current: CellComponent | null }) => {
    const cells = range.getCells();
    if (cells.length === 1) {
        cells.forEach((cellArray: any) => {
            (cellArray as CellComponent[]).forEach((cell: CellComponent) => {
                selectedCell.current = cell;
                const element = cell.getElement();
                element.classList.add("tabulator-range-selected");
                element.classList.add("tabulator-range-only-cell-selected");
            });
        });
    } else {
        selectedCell.current = null;
    }
};

export const onRangeRemoved = (range: RangeComponent) => {
    range.getCells().forEach((cellArray: any) => {
        (cellArray as any[]).forEach((cell) => {
            cell.getElement().classList.remove("tabulator-range-selected");
        });
    });
};