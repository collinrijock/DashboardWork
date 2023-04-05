import dynamic from "next/dynamic";
import React, { FC } from "react";

export type IconProps = {
    icon: `fa-${string}`;
    className: string;
    title?: string;
    style?: object;
};

const FaIcon = dynamic(() => import("./FaIcon"), {
    ssr: false,
});

const Icon: FC<IconProps> = (props) => {
    return <FaIcon {...props} />;
};

export default Icon;