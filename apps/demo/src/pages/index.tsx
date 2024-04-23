"use client";
import dynamic from "next/dynamic";
import Head from "next/head";

type Props = {
    [key: string]: any;
};

/* const DevicesList = dynamic(
    () => import("../components/vehicle/devices-list"),
    {
        ssr: false,
    },
); */

const DevicesList0131 = dynamic(
    () => import("../components/vehicle/devices-list-0131"),
    {
        ssr: false,
    },
);

export default function index(props: Props) {
    return (
        <>
            <Head>
                <title>设备列表</title>
                <meta
                    name="viewport"
                    content="width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no"
                />
            </Head>
            <DevicesList0131></DevicesList0131>
        </>
    );
}
