import React, { useEffect, useLayoutEffect, useRef, useMemo, useState, MutableRefObject, useId } from "react";
import { createRoot, Root } from "react-dom/client";
import { TabulatorFull, ColumnDefinition, Options, CellComponent, Tabulator } from 'tabulator-tables';
import { onRowMoved, onRowMoving } from "./DataTableEventHandlers/onRow";

import "tabulator-tables/dist/css/tabulator.min.css";
import "tabulator-tables/dist/css/tabulator_simple.min.css";
import "./DataTable.css";
import { buildColumnsFromPivotedData, groupData, pivot, PivotConfiguration } from "../../utility/arquero/pivotOperations";

import jsPDF from 'jspdf';
import { applyPlugin, Cell } from 'jspdf-autotable';
import { useHotkeys } from "react-hotkeys-hook";
import ReactDOM from "react-dom";
import { onCellDblClick, onCellContext, onCellMouseDown, onCellMouseUp } from "./DataTableEventHandlers/onCell";
import { onDataTreeRowCollapsed, onDataTreeRowExpanded } from "./DataTableEventHandlers/onDataTree";
import { onRangeChanged, onRangeRemoved } from "./DataTableEventHandlers/onRange";
import { InjectComponent } from "../../utility/react/injectComponent";
import { FiltersTableModal } from "../FilterTable/Modal";
import { TabulatorFilter } from "../FilterTable/FiltersTable";
import cloneDeep from 'lodash/cloneDeep';
import { removeAllRanges } from "./helpers/removeAllRanges";
import { injectAddRowButton } from "./helpers/injectAddRowButton";
import { useAddOrRemoveRowColumn } from "./helpers/hooks/useRemoveRowColumn";

applyPlugin(jsPDF);

TabulatorFull.extendModule("filter", "filters", {
  in: function (filterValue: string | string[], dataValue: string, rowData: any, filterParams: any) {
    //console.log("Filter hit: ", filterValue, dataValue, rowData, filterParams);
    // Convert the string value into an array if needed
    if (typeof filterValue === "string") {
      filterValue = filterValue.split(",");
      if (filterValue.includes("")) {
        filterValue.push(undefined!);
        filterValue.push(null!);
      }
    }

    // Perform the 'in' comparison
    return filterValue.includes(dataValue);
  },
  get "not in"() {
    return (filterValue: string | string[], dataValue: string, rowData: any, filterParams: any) => {
      //@ts-ignore
      return !this.in(filterValue, dataValue, rowData, filterParams);
    }
  }
})

export interface DataTableProps<T> {
  data: T[];
  autoColumns?: boolean;
  columns?: ColumnDefinition[] | undefined;
  movableRows?: boolean;
  pivot?: PivotConfiguration<T>;
  layout?: Options["layout"];
  containerClassName?: string;
  containerStyle?: React.CSSProperties;
  tableStyle?: React.CSSProperties;
  canAddRows?: boolean;
  canRemoveRows?: boolean;
  newRowDefaultValues?: Partial<T>;
  footerElement?: React.ReactNode;
  handleTableIsReady?: (table: Tabulator) => void;
  useFiltersTable?: boolean;
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

const DataTable = (function DataTable<T>(props: DataTableProps<T>) {
  const [tableStateful, setTableStateful] = useState<TabulatorFull | null>(null);
  const tableRef = useRef<TabulatorFull | null>(null);
  const selectedCell = useRef<CellComponent | null>(null);

  const [filters, setFilters] = useState<TabulatorFilter[]>([]);
  const [filtersVisible, setFiltersVisible] = useState(false);

  const uniqueId = useId();
  const id = `table-${uniqueId.replace(/:/g, "")}`;

  useAddOrRemoveRowColumn(tableStateful, props.canRemoveRows ?? false, props.canAddRows ?? false);

  const mutableData = useMemo(() => {

    return cloneDeep(props.data);
  }, [props.data]);

  useHotkeys("enter", () => {
    console.log(selectedCell.current?.edit(true));
  }, []);

  const addRowColumnId = useId().replace(/:/g, "add-row-column");

  const handleInjectingReactComponents = () => {
    if (props.canAddRows) {
      injectAddRowButton(tableRef.current!, addRowColumnId);
    }
  }

  const tabulatorOptions: Options = useMemo(() => {

    const options: Options = {
      height: props.containerStyle?.height,
      autoColumns: props.autoColumns,
      layout: props.layout ?? "fitDataFill",
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
          InjectComponent(container, <InputComponent />);

          return container;
        },
      },
      //@ts-ignore
      dependencies: {
        jspdf: jsPDF,
      },
    }

    if (props.footerElement) {
      const container = document.createElement("div");

      setTimeout(() => {
        console.log("Should render into: ", container);
        InjectComponent(container, props.footerElement);

        setTimeout(() => {
          tableRef.current?.redraw();
        }, 100);
      }, 0);

      options.footerElement = container;
    }

    if (options.movableRows) {
      options.rowHeader = { headerSort: false, resizable: false, minWidth: 30, width: 30, rowHandle: true, formatter: "handle", frozen: false };
    }

    return options;
  }, [props.pivot, props.movableRows])

  const handleTableBuilt = () => {

    if (tableRef.current) {
      tableRef.current.clearData();

      if (!props.pivot) {
        console.log("Setting data directly");
        tableRef.current.blockRedraw();
        tableRef.current.setData(mutableData);
        const cols = props.columns ?? (props.data.length > 0 ? Object.keys(props.data[0]!).map((key) => ({
          title: key.charAt(0).toUpperCase() + key.slice(1), // Capitalize title
          field: key,
        })) : []);
        tableRef.current.setColumns(cols);
        tableRef.current.restoreRedraw();
      } else {

        let pivotableData = mutableData;
        if (filters.length > 0) {
          console.log("Applying filter before pivot: ", filters);
          tableRef.current.setData(mutableData);
          tableRef.current.setFilter(filters);
          pivotableData = tableRef.current.getData("active");
        }

        const newData = pivot(pivotableData, props.pivot);

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

      props.handleTableIsReady?.(tableRef.current);
      //handleInjectingReactComponents();

      tableRef.current.redraw(true);

      setTableStateful(tableRef.current);
    } else {
      setTableStateful(null);
    }
  }

  const applyTableListeners = () => {
    const table = tableRef.current as TabulatorFull;
    table.on("rowMoving", onRowMoving);
    table.on("rowMoved", onRowMoved);
    table.on("cellDblClick", onCellDblClick);
    table.on("cellContext", onCellContext);
    table.on("cellMouseDown", onCellMouseDown);
    table.on("cellMouseUp", onCellMouseUp);
    table.on("rangeChanged", (range) => onRangeChanged(range, selectedCell));
    table.on("rangeRemoved", onRangeRemoved);
    table.on("dataTreeRowCollapsed", onDataTreeRowCollapsed);
    table.on("dataTreeRowExpanded", onDataTreeRowExpanded);
  }

  useLayoutEffect(() => {

    if (props.columns) {
      tabulatorOptions.columns = props.columns;
    }
    if (props.pivot) {
      tabulatorOptions.dataTree = true;
      tabulatorOptions.dataTreeStartExpanded = true;
    }
    const table = new TabulatorFull(`#${id}`, tabulatorOptions);


    const localHandleTableBuilt = () => {
      tableRef.current = table;
      applyTableListeners();
      handleTableBuilt();
    }

    table.on("tableBuilt", localHandleTableBuilt);

    return () => {
      table.off("tableBuilt", localHandleTableBuilt);
      tableRef.current?.destroy();
      tableRef.current = null;
    };
  }, [tabulatorOptions]);

  useEffect(() => {
    handleTableBuilt();
  }, [tabulatorOptions, mutableData, filters]);

  const fieldOptions = useMemo(() => {

    if (mutableData.length === 0) { return []; }

    const fields = new Set<string>();
    for (const field in mutableData[0]) {
      fields.add(field);
    }

    return Array.from(fields);
  }, [mutableData]);

  const containerStyle: React.CSSProperties = useMemo(() => {
    return {
      display: "flex",
      flexDirection: "column",
      flex: 1,
      height: "100%",
      width: "100%",
      ...props.containerStyle
    }
  }, [props.containerStyle]);

  const tableStyle: React.CSSProperties = useMemo(() => {
    return {
      display: "flex",
      flexDirection: "column",
      height: "100%",
      width: "100%",
      ...props.tableStyle
    }
  }, [props.tableStyle]);

  return (
    <>
      <div className={props.containerClassName ?? ""} style={containerStyle}>
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            flex: 1,
            height: "100%",
            width: "100%"
          }}
        >
          {
            props.useFiltersTable && (
              <div>
                <button onClick={() => {
                  setFiltersVisible(true);
                }}>
                  Filters
                </button>
                <FiltersTableModal
                  visible={filtersVisible}
                  onClose={() => setFiltersVisible(false)}
                  onFiltersChange={(filters) => {
                    setFilters(filters);
                    tableRef.current?.setFilter(filters);
                  }}
                  fieldOptions={fieldOptions}
                  filters={filters}
                  tableStyle={{
                    height: "450px",
                  }}
                />
              </div>
            )
          }
          <div style={tableStyle} id={id} /> {/* this is where the table gets rendered */}
        </div>
      </div>
    </>
  );
});

export default DataTable;
