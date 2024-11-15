import React, { useEffect, useLayoutEffect, useRef, forwardRef, useImperativeHandle, useMemo } from "react";
import { TabulatorFull, ColumnDefinition, Options } from 'tabulator-tables';
import { handleRowMoved, handleRowMoving } from "./DataTableEventHandlers/onRow";

import "tabulator-tables/dist/css/tabulator.min.css";
import "tabulator-tables/dist/css/tabulator_bulma.min.css";
import "./DataTable.css";
import { buildColumnsFromPivotedData, createHierarchalDataFromPivotedData, groupData, pivot } from "../../utility/arquero/pivotOperations";

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

    // Expose the tableRef to the parent component
    useImperativeHandle(ref, () => tableRef.current, [tableRef.current]);


    useLayoutEffect(() => {
        const tabulatorOptions: Options = {
            
            height: "600px",
            autoColumns: (!props.columns) && !props.pivot,
            layout: "fitData",
            reactiveData: true,
            movableRows: props.movableRows && !props.pivot,
            resizableRows:true,
            resizableRowGuide:true,
            resizableColumnGuide:true,
            columnDefaults:{
                resizable:true,
            },
        };
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


        tableRef.current = table;
        return () => {
            table.destroy();
        };
    }, [props.columns, props.movableRows]);

    useEffect(() => {
        if (tableRef.current) {

            if (!props.pivot) {
                tableRef.current.setData(props.data);
            } else {
                const newData = pivot(props.data, props.pivot.groupBy, props.pivot.splitBy);

                //console.log("new data: ", newData);
                const columns = buildColumnsFromPivotedData(newData, props.pivot.groupBy);
                columns.splice(columns.length-1,1);

                console.log("new data after columns: ", newData);
                const hierarchalData = groupData(newData, props.pivot.groupBy);
                //console.log("new data after hierarchy: ", newData);

                //console.log("Columns", columns);
                //console.log("Hierarchal Data:", hierarchalData);

                tableRef.current.clearData();
                tableRef.current.setColumns(columns);
                tableRef.current.setData(hierarchalData);

                tableRef.current.redraw(true);
            }
        }
    }, [props.data]);

    return (
        <>
            <div style={{ width: "100%" }} id="tabulator-table" />
        </>
    );
});

export default DataTable;
