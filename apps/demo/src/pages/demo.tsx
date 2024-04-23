"use client";
/* eslint-disable react-hooks/rules-of-hooks */
import { useState } from "react";
// import DemoStart from "../components/demo-start";
import { Dialog } from "antd-mobile";
import dynamic from "next/dynamic";
import Head from "next/head";

const ValidateWS = dynamic(() => import("../components/validate-ws"), {
    ssr: false,
});

const DemoStart = dynamic(() => import("../components/demo-start"), {
    ssr: false,
});

const ScrcpyPane = dynamic(
    () => import("../components/vehicle/scrcpy-pane-20240218"),
    {
        ssr: false,
    },
);
const ScrcpyControl = dynamic(
    () => import("../components/vehicle/scrcpy-control-0130"),
    {
        ssr: false,
    },
);

const ScrcpyLoading = dynamic(
    () => import("../components/vehicle/scrcpy-loading"),
    {
        ssr: false,
    },
);

const FirstTip = dynamic(() => import("@/components/first-tip"), {
    ssr: false,
});

type Props = {
    [key: string]: any;
};

export default function demo(props: Props) {
    const [loaded, setLoaded] = useState(false);
    const [hasWs, setHasWs] = useState(false);

    return (
        <section className="container flex-body-column">
            <Head>
                <title>控屏中</title>
                <meta
                    name="viewport"
                    content="width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no"
                />
            </Head>
            {/* <ScrcpyHeader></ScrcpyHeader> */}
            <ValidateWS
                success={() => {
                    setHasWs(true);
                }}
                fail={(failText) => {
                    const title =
                        failText !== undefined
                            ? failText
                            : "当前设备与车辆不在同一网络，请检查后重试";

                    Dialog.alert({
                        title,
                        onConfirm() {
                            // todo: 微信js-sdk关闭页面
                            location.replace("/");
                        },
                    });
                }}
            />
            {(() => {
                if (hasWs) {
                    return (
                        <>
                            {loaded ? null : <ScrcpyLoading />}
                            {loaded ? <ScrcpyControl /> : null}
                            {loaded ? <FirstTip /> : null}
                            <DemoStart
                                connected={() => {
                                    setLoaded(true);
                                }}
                            ></DemoStart>
                            <div className="flex-auto relative overflow-hidden">
                                <ScrcpyPane></ScrcpyPane>
                            </div>
                        </>
                    );
                }
                return null;
            })()}
        </section>
    );
}
