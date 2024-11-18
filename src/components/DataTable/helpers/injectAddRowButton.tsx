import React from "react";
import { TabulatorFull } from "tabulator-tables";
import { InjectComponent } from "../../../utility/react/injectComponent";

export const injectAddRowButton = (table: TabulatorFull, elementId: string) => {
        
    const btn = (
        <button
            onClick={() => table?.addRow({}, true)}
            style={{
                width: "30px",
                height: "30px",
                borderRadius: "50%",
                fontSize: "20px",
                lineHeight: "20px",
                padding: "0",
                margin: "0",
                border: "none",
                cursor: "pointer",
                backgroundColor: "green",
                color: "white",
                transform: "scale(0.75)"
            }}
        >
            +
        </button>
    )
    InjectComponent(`#${elementId}`, btn);
}