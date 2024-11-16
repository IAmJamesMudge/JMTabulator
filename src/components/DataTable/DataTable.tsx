import React, { useEffect, useLayoutEffect, useRef, forwardRef, useImperativeHandle, useMemo, useState } from "react";
import { createRoot } from "react-dom/client";
import { TabulatorFull, ColumnDefinition, Options, CellComponent } from 'tabulator-tables';
import { handleRowMoved, handleRowMoving } from "./DataTableEventHandlers/onRow";

import "tabulator-tables/dist/css/tabulator.min.css";
import "tabulator-tables/dist/css/tabulator_simple.min.css";
import "./DataTable.css";
import { buildColumnsFromPivotedData, groupData, pivot } from "../../utility/arquero/pivotOperations";

import jsPDF from 'jspdf';
import { applyPlugin } from 'jspdf-autotable';
import { useHotkeys } from "react-hotkeys-hook";
applyPlugin(jsPDF)

export interface DataTableProps<T> {
  data: T[];
  columns?: ColumnDefinition[] | undefined;
  movableRows?: boolean;
  pivot?: {
    groupBy: (keyof T & string)[];
    splitBy: (keyof T & string)[];
  }
}
/*
            columns: [
              {
                title: "Personal Info",
                columns: [
                  {
                    title: "Full Name",
                    columns: [
                      { title: "First Name", field: "firstName", width: 150 },
                      { title: "Last Name", field: "lastName", width: 150 },
                    ],
                  },
                  { title: "Age", field: "age", hozAlign: "left", formatter: "progress" },
                ],
              },
              {
                title: "Contact Info",
                columns: [
                  {
                    title: "Address",
                    columns: [
                      { title: "Street", field: "contact.address.street" },
                      { title: "City", field: "contact.address.city" },
                      { title: "Zip", field: "contact.address.zip" },
                    ],
                  },
                  { title: "Phone", field: "contact.phone" },
                ],
              },
              { title: "Favourite Color", field: "col" },
              { title: "Date Of Birth", field: "dob", sorter: "date", hozAlign: "center" },
            ],
*/

const DataTable = forwardRef(function DataTable<T>(props: DataTableProps<T>, ref: React.Ref<TabulatorFull | null>) {
  const tableRef = useRef<TabulatorFull | null>(null);
  const selectedCell = useRef<CellComponent | null>(null);

  // Expose the tableRef to the parent component
  useImperativeHandle(ref, () => tableRef.current, [tableRef.current]);

  useHotkeys("enter", () => {
    console.log(selectedCell.current?.edit(true));
  }, []);

  const tabulatorOptions: Options = useMemo(() => {

    return {
      height: "500px",
      autoColumns: (!props.columns) && !props.pivot,
      layout: "fitDataFill",
      reactiveData: true,
      movableRows: props.movableRows && !props.pivot,
      resizableRows: false,
      resizableRowGuide: true,
      resizableColumnGuide: true,
      selectableRange: 1, //allow only one range at a time
      selectableRangeColumns: false,
      selectableRangeRows: false,
      columnDefaults: {
        resizable: true,
        headerSort: false,
        minWidth: 120,
        editable: false,

        editor(cell, onRendered, success, cancel, editorParams) {

          const container = document.createElement("div");
          const root = createRoot(container);
          const InputComponent = () => {
            const [value, setValue] = useState(cell.getValue() as string ?? "");
            const inputRef = useRef<HTMLInputElement>(null);

            useEffect(() => {
              inputRef.current?.focus();
            }, []);

            return (
              <input
                ref={inputRef}
                style={{
                  width: "100%",
                  height: "100%",
                  boxSizing: "border-box",
                }}
                value={value}
                onChange={(e) => {
                  //success(e.target.value ?? "");
                  setValue(e.target.value ?? "");
                }}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    inputRef.current?.blur();
                  }
                }}
                onBlur={() => {
                  success(value);
                }}
              />
            )
          }
          root.render(<InputComponent />);
          return container;
          // const input = document.createElement("input");
          // input.style.width = "100%";
          // input.style.height = "100%";
          // input.style.boxSizing = "border-box";
          // input.value = cell.getValue() ?? "";
          // input.addEventListener("change", () => {
          //     success(input.value);
          // });
          // onRendered(() => {
          //   setTimeout(() => {
          //     input.focus();
          //   }, 100);
          // });
          // return input;
        },
      },
      //@ts-ignore
      dependencies: {
        jspdf: jsPDF,
      },
    }
  },[props.columns, props.pivot, props.movableRows])


  useLayoutEffect(() => {

    if (props.columns) {
      tabulatorOptions.columns = props.columns;
    }
    if (props.pivot) {
      tabulatorOptions.dataTree = true;
      tabulatorOptions.dataTreeStartExpanded = true;
    }
    const table = new TabulatorFull("#tabulator-table", tabulatorOptions);


    table.on("rowMoving", handleRowMoving);
    table.on("rowMoved", handleRowMoved);
    table.on("cellDblClick", (e, cell) => {
      if (!!props.pivot && cell.getColumn().getDefinition().field?.toLowerCase() === "name") {

      } else {
        cell.edit(true);
      }
    });

    table.on("rangeChanged", (range) => {
      const cells = range.getCells();
      if (cells.length === 1) {
        cells.forEach((cellArray: any) => {
          (cellArray as CellComponent[]).forEach((cell: CellComponent) => {
            selectedCell.current = cell;
          });
        });
      } else {
        selectedCell.current = null;
      }
    });

    table.on("rangeRemoved", (range) => {
      // there's a bug with ranges in tabulator when also using hierarchical data
      // so we need to manually remove the 'tabulator-range-selected' class
      range.getCells().forEach((cellArray: any) => {
        (cellArray as CellComponent[]).forEach((cell: CellComponent) => {
          const element = cell.getElement();
          element.classList.remove("tabulator-range-selected")
        });
      });
    });

    const handleTableBuilt = () => {
      tableRef.current = table;
    }

    table.on("tableBuilt", handleTableBuilt);
    return () => {
      table.off("tableBuilt", handleTableBuilt);
      tableRef.current?.destroy();
    };
  }, [tabulatorOptions]);

  useEffect(() => {
    if (tableRef.current) {
      tableRef.current.clearData();
      
      if (!props.pivot) {
        tableRef.current.setData(props.data);
      } else {
        const newData = pivot(props.data, props.pivot.groupBy, props.pivot.splitBy);

        //console.log("new data: ", newData);
        const columns = buildColumnsFromPivotedData(newData, props.pivot.groupBy);
        columns.splice(columns.length - 1, 1);

        console.log("new data after columns: ", newData);
        const hierarchalData = groupData(newData, props.pivot.groupBy);
        //console.log("new data after hierarchy: ", newData);

        //console.log("Columns", columns);
        //console.log("Hierarchal Data:", hierarchalData);

        tableRef.current.setColumns(columns);
        tableRef.current.setData(hierarchalData);
      }

      tableRef.current.redraw(true);
    }
  }, [tabulatorOptions, props.data]);

  return (
    <>
      <button onClick={() => {
        tableRef.current?.download("pdf", "data.pdf");
      }}>
        Test
      </button>
      <div style={{ width: "1200px" }} id="tabulator-table" />
    </>
  );
});

export default DataTable;
