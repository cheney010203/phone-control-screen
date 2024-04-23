"use client";
import { useEffect } from "react";
import vConsole from "vconsole";

type Props = {
    [key: string]: any;
};

export default function VConsole(props: Props) {
    useEffect(() => {
        new vConsole({});
    }, []);
    return <section></section>;
}
