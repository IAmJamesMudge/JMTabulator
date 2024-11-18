import { CellComponent } from "tabulator-tables";

export const onCellDblClick = (e: UIEvent, cell: CellComponent) => {
  const columnDef = cell.getColumn().getDefinition() as any;
  if (!columnDef.doNotAllowEditing) {
    cell.edit(true);
  }
};


export const onCellContext = (e: UIEvent, cell: CellComponent) => {
    
};

let lastCellMouseDown: CellComponent | null = null;
// we must handle cell mouse down and up ourselves because
// tabulator has a bug with cell click not firing
export const onCellMouseDown = (e: UIEvent, cell: CellComponent) => {
  lastCellMouseDown = cell;
  window.addEventListener("mouseup", onWindowMouseUp);
};

export const onCellMouseUp = (e: UIEvent, cell: CellComponent) => {
  if (lastCellMouseDown === cell) {
    handleCellClick(e, cell);
  }
};

const handleCellClick = (e: UIEvent, cell: CellComponent) => {
  console.log("CELL CLICK DETECTED");
  cell.getColumn().getDefinition().cellClick?.(e, cell);
};

const onWindowMouseUp = () => {
  lastCellMouseDown = null;
  window.removeEventListener("mouseup", onWindowMouseUp);
};