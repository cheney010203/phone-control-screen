/* eslint-disable camelcase */
import "@/styles/globals.scss";
import { AppProps } from "next/app";
import dynamic from "next/dynamic";
import { useEffect } from "react";
import { useInitDialog } from "../hooks/tip-dialog";
import eventsbus from "../utils/eventsbus";
import { setItem } from "../utils/localStorage";

const DatafluxRum = dynamic(() => import("../components/datafluxRum"), {
    ssr: false,
});

function MyApp({ Component, pageProps }: AppProps) {
    const initDialog = useInitDialog();
    useEffect(() => {
        if (location.href.indexOf("vconsole") > -1) {
            import("vconsole").then(({ default: VConsole }) => {
                new VConsole();
            });
        }

        const androidFlag = /android/i.test(navigator.userAgent);
        if (androidFlag) {
            setItem("androidFlag", true);
        } else {
            setItem("androidFlag", false);
        }

        /* const initTip = getItem("initTip");
        if (!initTip) {
            setItem("initTip", true);
        } */

        const f = () => {
            eventsbus.emit("sizeChange");
        };
        window.addEventListener("error", function (e) {
            console.log(e);
        });
        window.addEventListener("unhandledrejection", function (e) {
            console.log(e.reason);
        });
        window.addEventListener("resize", f);

        return () => {
            window.removeEventListener("resize", f);
        };
    }, []);

    return (
        <div className="container">
            <DatafluxRum />
            <Component {...pageProps} />
        </div>
    );
}

export default MyApp;
