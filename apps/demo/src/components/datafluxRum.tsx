import { datafluxRum } from "@cloudcare/browser-rum";
import { useEffect } from "react";

export default function DemoStart() {
    useEffect(() => {
        const href = location.href;
        const env = href.indexOf(".geely.") > -1 ? "prod" : "common";
        datafluxRum.init({
            applicationId: "car_screen_control",
            datakitOrigin: "https://hz-rum.geely.com", // 协议（包括：//），域名（或IP地址）[和端口号],
            env,
            version: "1.0.0",
            service: "browser",
            sessionSampleRate: 100,
            sessionReplaySampleRate: 70,
            trackInteractions: true,
            traceType: "ddtrace", // 非必填，默认为ddtrace，目前支持 ddtrace、zipkin、skywalking_v3、jaeger、zipkin_single_header、w3c_traceparent 6种类型
        });
        datafluxRum.addRumGlobalContext("sink_project", "glan");
        // datafluxRum.startsessionReplayrecording();
    }, []);
    return <></>;
}
