import React, { MutableRefObject, useEffect, useId, useMemo, useRef } from "react";
import { ColumnDefinition, FilterType, Tabulator, TabulatorFull } from "tabulator-tables";
import DataTable from "../DataTable";
import { InjectComponent } from "../../utility/react/injectComponent";
import { removeAllRanges } from "../DataTable/helpers/removeAllRanges";

export interface TabulatorFilter {
    field: string;
    type: FilterType;
    value: any;
}

export interface FiltersTableProps {
    filters: TabulatorFilter[],
    fieldOptions: string[],
    containerStyle?: React.CSSProperties;
    tableStyle?: React.CSSProperties;
    handleTableIsReady?: ((table: Tabulator) => void)
    onFiltersChange?: (filters: TabulatorFilter[]) => void;
}

export default function FiltersTable(props: FiltersTableProps) {
    const tableRef = useRef<TabulatorFull | null>(null) as MutableRefObject<TabulatorFull | null>;

    const addRowId = useId().replace(/:/g, "filters-table-add-row");

    const columns: ColumnDefinition[] = useMemo(() => {

        const cols: ColumnDefinition[] = [
            {
                title: "Field",
                field: "field",
                minWidth: 150,
                editor: "list",
                editorParams: {
                    values: props.fieldOptions
                }
            },
            {
                title: "Type",
                field: "type",
                minWidth: 150,
                editor: "list",
                editorParams: {
                    values: ["=", "!=", ">", "<", ">=", "<=", "in", "not in", "like", "not like"]
                }
            },
            {
                title: "Value",
                field: "value",
                minWidth: 150,
                editor: "input"
            }
        ]

        return cols;
    }, []);



    return (
        <DataTable
            tableStyle={props.tableStyle}
            containerStyle={props.containerStyle}
            data={props.filters}
            columns={columns}
            movableRows={false}
            canRemoveRows={true}
            handleTableIsReady={(table) => {
                tableRef.current = table;
                props.handleTableIsReady?.(table);
            }}
            useFiltersTable={false}
        />
    )
}