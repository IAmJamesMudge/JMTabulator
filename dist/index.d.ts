import React from 'react';

interface ButtonProps {
    label: string;
    backgroundColor: string;
    onClick: () => void;
    size: "small" | "large";
}
declare const Button: (props: ButtonProps) => React.JSX.Element;

export { Button };
