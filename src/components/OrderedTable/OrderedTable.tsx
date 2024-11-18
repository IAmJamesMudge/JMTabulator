import React, { useEffect, useId, useMemo, useRef, useState } from "react";
import DataTable from "../DataTable";
import { ColumnDefinition, TabulatorFull } from "tabulator-tables";
import { removeAllRanges } from "../DataTable/helpers/removeAllRanges";
import { InjectComponent } from "../../utility/react/injectComponent";

export interface OrderedTableProps<T> {
    data: T[];
    onSave?: (data: T[]) => void;
    onCancel?: () => void;
    columns: ColumnDefinition[];
    containerStyle?: React.CSSProperties;
    tableStyle?: React.CSSProperties;
    showOrder?: boolean;
    canAddRows?: boolean;
}

export default function OrderedTable<T,>(props: OrderedTableProps<T>) {
    const tableRef = useRef<TabulatorFull | null>(null);
    const [dirty, setDirty] = useState(false);

    const handleCancel = () => {
        tableRef.current?.setData(props.data);
        props.onCancel?.();
        setDirty(false);
    }

    const handleSave = () => {
        props.onSave?.(tableRef.current?.getData("active") ?? []);
        setDirty(false);
    }

    useEffect(() => {
        console.log("OrderedTable render", props.data);
    },[props.data])

    const columns = useMemo(() => {
        const cols = [...props.columns];

        if (props.showOrder) {
            cols.unshift({
                title: "#",
                field: "order",
                formatter: "rownum",
                width: 40,
                maxWidth: 40,
                minWidth: 40,
                resizable: false,
                headerSort: false,
                frozen: true,
            });
        }

        return cols;
    },[props.columns, props.showOrder]);

    return (
        <DataTable
            containerClassName={dirty ? "dirty" : ""}
            containerStyle={props.containerStyle}
            tableStyle={props.tableStyle}
            data={props.data}
            canAddRows={true}
            canRemoveRows={true}
            movableRows={true}
            columns={columns}
            footerElement={(
                <div style={{display: "flex", justifyContent: "space-between"}}>
                    <button onClick={handleCancel}>Cancel</button>
                    <button onClick={handleSave}>Save</button>
                </div>
            )}
            handleTableIsReady={(table) => { 
                tableRef.current = table;

                table.on("rowDeleted", () => setDirty(true));
                table.on("rowMoved", () => setDirty(true));
                table.on("rowAdded", () => setDirty(true));
                table.on("cellEdited", () => setDirty(true));
            }}
        />
    )
}