// @ts-nocheck
"use client";

export function openFullscreen() {
    const element: any = document.documentElement;
    const reqFullscreen =
        element.webkitEnterFullscreen ||
        element.requestFullscreen ||
        element.mozRequestFullScreen ||
        element.webkitRequestFullScreen ||
        element.msRequestFullscreen;

    if (!reqFullscreen) {
        console.error("当前浏览器不支持部分全屏！");
        return;
    }

    reqFullscreen.call(element);
}

export function exitFullscreen() {
    const exitFullscreenFnc =
        document.webkitExitFullscreen ||
        document.exitFullScreen ||
        document.mozCancelFullScreen ||
        document.msExitFullscreen;

    if (exitFullscreenFnc) {
        exitFullscreenFnc.call(document);
    }
}

export function isFullscreenEnabled() {
    return (
        document.fullscreenEnabled ||
        document.mozFullScreenEnabled ||
        document.webkitFullscreenEnabled ||
        document.msFullscreenEnabled
    );
}

export function isFullScreen() {
    return !!(
        document.fullscreen ||
        document.mozFullScreen ||
        document.webkitIsFullScreen ||
        document.webkitFullScreen ||
        document.msFullScreen
    );
}
