import React from "react";
import ReactDomServer from "react-dom/server";
import { useEffect } from "react";
import { TabulatorFull } from "tabulator-tables";
import { InjectComponent } from "../../../../utility/react/injectComponent";
import { removeAllRanges } from "../removeAllRanges";



export const useAddOrRemoveRowColumn = (table: TabulatorFull | null, canRemoveRows: boolean, canAddRows: boolean) => {
    const timeout = React.useRef<number | null>(null);
    
    useEffect(() => {

        if (timeout.current !== null) {
            window.clearTimeout(timeout.current);
        }
        timeout.current = window.setTimeout(() => {
            if (!table) { return; }
    
            if (canRemoveRows) {
                table.addColumn({
    
                    field: "",
                    formatter: (cell, formatterParams, onRendered) => {
                      const container = document.createElement("div");
            
                      InjectComponent(container, (
                        <button
                          onClick={() => {
                            removeAllRanges(cell.getTable());
                            cell.getRow().delete();
                          }}
                        >
                          X
                        </button>
                      ));
            
                      return container;
                    },
                    width: "30",
                    minWidth: 35,
                    maxWidth: 35,
                    editable: false,
                    //@ts-ignore
                    doNotAllowEditing: true,
            
                    titleFormatter: (cell, formatterParams, onRendered) => {
                        const container = document.createElement("div");
              
                        InjectComponent(container, (
                          <button
                            onClick={() => {
                              removeAllRanges(cell.getTable());
                              cell.getTable().addRow({}, true);
                            }}
                          >
                            +
                          </button>
                        ));
              
                        return container;
                      },
                    title: ``,
                }, false).then(() => {
                    console.log("Column should be added.");
                }).catch((err) => {
                    console.log("Error adding column: ", err);
                })
            } else {
                const col = table.getColumn("remove");
                if (col) {
                    col.delete();
                }
            }
        }, 100);
    },[table, canRemoveRows])

}