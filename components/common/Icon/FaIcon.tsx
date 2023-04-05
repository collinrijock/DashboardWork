import React, { FC } from "react";
import { IconProps } from ".";

const Icon: FC<IconProps> = ({ icon, className, ...other }) => {
    return (
        <i className={`fak ${icon} ${className}`} aria-hidden="true" {...other}></i>
    );
};

export default Icon;