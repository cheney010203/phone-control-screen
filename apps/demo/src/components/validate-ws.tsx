import { base64Decode } from "@/utils/utils";
import { useEffect, useRef } from "react";

interface Props {
    success: () => void;
    fail: (failText?: string) => void;
}

export default function ScrcpyLoading(
    props: Props = {
        success: () => {},
        fail: () => {},
    },
) {
    const testWsRef = useRef<WebSocket | null>(null);
    const hasWsErr = useRef(false);

    useEffect(() => {
        console.log("wsws", location.href);
        const urlObj: any = new URL(location.href);
        let search = Object.fromEntries(
            new URLSearchParams(urlObj.search).entries(),
        );
        const { para } = search;
        if (para) {
            const paraDeoceStr = decodeURIComponent(base64Decode(para));
            search = Object.fromEntries(
                new URLSearchParams(paraDeoceStr).entries(),
            );
        }
        const { ip } = search;
        if (!ip) {
            props.fail();
            // return;
        } else {
            const testWs = (testWsRef.current = new WebSocket(
                `ws://${ip}:15555`,
            ));
            const timer = setTimeout(() => {
                hasWsErr.current = true;
                props.fail();
                testWs.close();
            }, 2000);

            testWs.onopen = function (event) {
                console.log("WebSocket连接已建立");
                clearTimeout(timer);
                props.success();
                // testWs.close();
            };

            testWs.onerror = function (error) {
                if (hasWsErr.current) {
                    return;
                }
                console.log("WebSocket连接失败: " + error);
                clearTimeout(timer);
                props.fail();
                // testWs.close();
            };
        }

        return () => {
            testWsRef.current = null;
        };
    }, []);

    return <></>;
}
