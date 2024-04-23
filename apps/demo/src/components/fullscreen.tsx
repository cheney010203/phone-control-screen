"use client";
import {
    exitFullscreen,
    isFullscreenEnabled,
    openFullscreen,
} from "@/utils/fullscreen";
import { useEffect, useState } from "react";

export default function Test(props: any) {
    const [stateFullscreen, setStateFullscreen] = useState(false);
    const [canFullScreen, setCanFullScreen] = useState(false);

    useEffect(() => {
        setCanFullScreen(isFullscreenEnabled());
    }, []);

    if (!canFullScreen) {
        return null;
    }

    return (
        <button
            onClick={() => {
                stateFullscreen ? exitFullscreen() : openFullscreen();
                setStateFullscreen(!stateFullscreen);
            }}
        >
            {!stateFullscreen ? "进入全屏" : "退出全屏"}
        </button>
    );
}
