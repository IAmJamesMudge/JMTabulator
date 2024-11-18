import { createRoot, Root } from "react-dom/client";

const map = new Map<Element, Root>();

setInterval(() => {
    map.forEach((root, element) => {
        if (element.parentElement === null) {
            root.unmount();
            map.delete(element);
            if (process.env.VERBOSE_LOGS === "true") {
                console.log("Unmounted and cleaned up root for element:", element);
            }
        }
    });
}, 500);

/**
 * Injects a React component into a DOM element
 * @param selector The selector or element to inject the component into
 * @param node The React node to inject
 * @param documentOverride An optional document override when using a string selector
 * @returns A function to unmount the component
 */
export const InjectComponent = (selector: string | HTMLElement, node: React.ReactNode, documentOverride?: Document) => {
    const document = documentOverride || window.document;
    const element = typeof selector === "string" ? document.querySelector(selector) : selector;

    if (!element) throw new Error("Element not found: " + selector.toString());

    let root = map.get(element);

    if (!root) {
        root = createRoot(element);
        map.set(element, root);
    }

    root.render(node);

    return () => {
        root?.unmount();
        map.delete(element);
    };
};
