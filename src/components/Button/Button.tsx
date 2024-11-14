import React from "react";
import "./Button.css";

export interface ButtonProps{
    label: string;
    backgroundColor: string;
    onClick: () => void;
    size: "small" | "large";
}

const Button = ( props: ButtonProps) => {
    return <button className='btn' onClick={props.onClick} style={{backgroundColor: props.backgroundColor, transform: `scale(${props.size === "large" ? 1.2 : 1})`}}>{props.label}</button>
}

export default Button;