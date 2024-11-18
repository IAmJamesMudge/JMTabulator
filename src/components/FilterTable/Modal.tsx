import React from "react";
import FiltersTable, { FiltersTableProps } from "./FiltersTable";
import ReactDOM from "react-dom";
import { TabulatorFull } from "tabulator-tables";

export interface FiltersTableModalProps extends FiltersTableProps {
    visible: boolean;
    onClose: () => void;
}

export const FiltersTableModal = (props: FiltersTableModalProps) => {
    const tableRef = React.useRef<TabulatorFull | null>(null);
    
    const Component = (
        <div
            className="modal"
            style={{
                display: props.visible ? "grid" : "none",
                position: "fixed",
                width: "100vw",
                height: "100vh",
                left: 0,
                top: 0,
                overflow: "auto",
                flexDirection: "column",
                justifyContent: "center",
                alignItems: "center",
                backgroundColor: "rgba(0,0,0,0.4)"
            }}
            onWheel={(e) => e.stopPropagation()}
            onClick={(e) => e.stopPropagation()}
            onContextMenu={(e) => e.stopPropagation()}
        >
            <div style={{
                    display: "flex", 
                    flex: 1, 
                    flexDirection: "column", 
                    rowGap: "2em",
                    background: "white",
                    padding: "1em",
                    borderRadius: "10px",
                }}
            >
                <FiltersTable
                    fieldOptions={props.fieldOptions}
                    filters={props.filters}
                    containerStyle={props.containerStyle}
                    tableStyle={props.tableStyle}
                    handleTableIsReady={(table) => tableRef.current = table}
                />
                <div style={{display: "flex", flexDirection: "row", justifyContent: "space-between"}}>
                    <button onClick={() => {

                        tableRef.current?.setData(props.filters);
                        props.onClose();
                    }}>
                        Cancel
                    </button>
                    <button onClick={() => {
                        props.onFiltersChange?.(tableRef.current?.getData() as any);
                        props.onClose();
                    }}>
                        Accept
                    </button>
                </div>
            </div>
        </div>
    )

    return ReactDOM.createPortal(Component, document.body);
}