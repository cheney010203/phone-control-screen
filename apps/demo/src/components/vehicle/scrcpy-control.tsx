import styles from "@/styles/modules/scrcpy-control.module.scss";
import {
    exitFullscreen,
    isFullscreenEnabled,
    openFullscreen,
} from "@/utils/fullscreen";
import { AndroidKeyCode, AndroidKeyEventAction } from "@yume-chan/scrcpy";
import { Dialog, Toast } from "antd-mobile";
import { useEffect, useRef, useState } from "react";
import {
    GoChevronLeft,
    GoFold,
    GoKebabHorizontal,
    GoLock,
    GoScreenFull,
    GoUnlink,
    GoUnlock,
} from "react-icons/go";
import { usePageJump } from "../../hooks";
import { GLOBAL_STATE } from "../../state";
import eventsbus from "../../utils/eventsbus";
import { STATE } from "../scrcpy";
import DisplayList from "./display-list";

type Props = {
    [key: string]: any;
};

export default function ScrcpyControl(props: Props) {
    const [collapse, setCollapse] = useState(false);
    const [active, setActive] = useState(true);
    const [showList, setShowList] = useState(false);
    const [lock, setLock] = useState(false);
    const [canFullScreen, setCanFullScreen] = useState(false);
    const [stateFullscreen, setStateFullscreen] = useState(false);
    const [stateHelp, setStateHelp] = useState(false);
    const timer = useRef<any>(null);
    const lockTip = useRef<any>(null);
    const startPosition = useRef({
        x: 0,
        y: 0,
        top: 0,
        left: 0,
    });
    const jump = usePageJump();
    const ref = useRef<HTMLElement>(null);
    function handlerTouchMove(e: TouchEvent) {
        e.stopPropagation();
        const { x, y, top: topVh, left: leftVw } = startPosition.current;
        const left = (leftVw * window.innerWidth) / 100;
        const top = (topVh * window.innerHeight) / 100;
        const touch = e.changedTouches?.[0];
        if (touch) {
            const { clientX, clientY } = touch;
            const height = ref.current!.offsetHeight;
            const width = ref.current!.offsetWidth;
            let ct = clientY - y + top,
                cl = clientX - x + left;
            if (ct < 0) {
                ct = 0;
            } else if (ct > window.innerHeight - height) {
                ct = window.innerHeight - height;
            }
            if (cl < 0) {
                cl = 0;
            } else if (cl > window.innerWidth - width) {
                cl = window.innerWidth - width;
            }
            const vw = (cl / window.innerWidth) * 100;
            const vh = (ct / window.innerHeight) * 100;

            ref.current!.style.top = vh + "vh";
            ref.current!.style.left = vw + "vw";
        }
    }

    function handlerTouchEnd() {
        document.removeEventListener("touchmove", handlerTouchMove);
        document.removeEventListener("touchend", handlerTouchMove);
        ActiveTrigger();
    }

    function handlerTouchStart(e: any) {
        setActive(true);
        const touch = e.changedTouches?.[0];
        if (touch) {
            const { clientX, clientY } = touch;
            const styles = ref.current?.style;
            startPosition.current = {
                x: clientX,
                y: clientY,
                top: parseInt(styles?.top as string) || 0,
                left: parseInt(styles?.left as string) || 0,
            };
        }
        document.addEventListener("touchmove", handlerTouchMove);
        document.addEventListener("touchend", handlerTouchEnd);
    }

    const lockHandle = () => {
        let bool = !lock;
        setLock(bool);
        GLOBAL_STATE.setLock(bool);
        eventsbus.emit("lock", [bool]);

        if (bool) {
            lockTip.current = Toast.show({
                content: (
                    <div
                        onClick={() => {
                            lockHandle();
                        }}
                    >
                        <div>当前处于锁屏模式</div>
                        <div>可双指放大缩小屏幕</div>
                        <div>可单指拖拽移动屏幕</div>
                        <div>
                            点击
                            <GoUnlock style={{ verticalAlign: "middle" }} />
                            回到控屏模式
                        </div>
                    </div>
                ),
                position: "bottom",
                duration: 0,
            });
        } else {
            lockTip.current?.close();
        }
    };

    const recoverSize = () => {
        eventsbus.emit("sizeChange");
    };

    const ActiveTrigger = () => {
        clearTimeout(timer.current);
        timer.current = setTimeout(() => {
            setActive(false);
        }, 5000);
    };

    /**
     * 返回键
     */
    const back = {
        pointerDown: () => {
            STATE.client!.controlMessageWriter!.backOrScreenOn(
                AndroidKeyEventAction.Down,
            );
        },
        pointerUp: () => {
            STATE.client!.controlMessageWriter!.backOrScreenOn(
                AndroidKeyEventAction.Up,
            );
        },
    };

    /**
     * home键
     */
    const home = {
        pointerDown: () => {
            STATE.client!.controlMessageWriter!.injectKeyCode({
                action: AndroidKeyEventAction.Down,
                keyCode: AndroidKeyCode.AndroidHome,
                repeat: 0,
                metaState: 0,
            });
        },
        pointerUp() {
            STATE.client!.controlMessageWriter!.injectKeyCode({
                action: AndroidKeyEventAction.Up,
                keyCode: AndroidKeyCode.AndroidHome,
                repeat: 0,
                metaState: 0,
            });
        },
    };

    /**
     * 多任务按键
     */
    const multiPor = {
        pointerDown() {
            STATE.client!.controlMessageWriter!.injectKeyCode({
                action: AndroidKeyEventAction.Down,
                keyCode: AndroidKeyCode.AndroidAppSwitch,
                repeat: 0,
                metaState: 0,
            });
        },
        pointerUp() {
            STATE.client!.controlMessageWriter!.injectKeyCode({
                action: AndroidKeyEventAction.Up,
                keyCode: AndroidKeyCode.AndroidAppSwitch,
                repeat: 0,
                metaState: 0,
            });
        },
    };

    /**
     * 断开连接
     */
    const dispose = () => {
        Dialog.confirm({
            content: "确认要与对方断开连接吗？",
            onConfirm: () => {
                jump.goDevices();
            },
        });
    };

    const toFullscreen = () => {
        if (!canFullScreen) {
            Toast.show({
                content: "iOS暂不支持页面全屏",
                afterClose: () => {
                    console.log("after");
                },
            });
            return;
        }

        stateFullscreen ? exitFullscreen() : openFullscreen();
        setStateFullscreen(!stateFullscreen);
    };

    useEffect(() => {
        ActiveTrigger();
        return () => {
            clearTimeout(timer.current);
        };
    }, []);

    useEffect(() => {
        function resize() {
            ref.current!.style.left = "0";
            ref.current!.style.top = "0";
        }
        window.addEventListener("resize", resize);
        return () => {
            window.removeEventListener("resize", resize);
        };
    }, []);

    useEffect(() => {
        setCanFullScreen(isFullscreenEnabled());
    }, []);

    useEffect(() => {
        if (!collapse && ref.current) {
            const leftVw = ref.current.style.left;
            const left = parseFloat(leftVw) * window.innerWidth;
            // console.log(ref.current.clientWidth);
            // if (window.innerWidth < left + ref.current.clientWidth) {
            //     ref.current.style.left =
            //         ((window.innerWidth - ref.current.clientWidth) /
            //             window.innerWidth) *
            //             100 +
            //         "vw";
            // }
        }
    }, [collapse]);

    return (
        <>
            <section
                className={`${styles["control-pane"]} ${
                    active ? styles["active"] : ""
                } ${showList ? styles["control-fixed"] : ""}`}
                ref={ref}
                // onClick={() => setActive(!active)}
                onPointerUp={ActiveTrigger}
                onTouchStart={handlerTouchStart}
            >
                <div className={styles["control-section-row"]}>
                    <div className={styles["control-item"]}>
                        <div
                            className={`flex-core ${styles["control-item-btn"]}`}
                            onClick={() => {
                                setCollapse(!collapse);
                            }}
                        >
                            <GoKebabHorizontal />
                        </div>
                    </div>
                    {!collapse && (
                        <>
                            <div className={styles["control-item"]}>
                                <div
                                    className={`flex-core ${styles["control-item-btn"]}`}
                                    onPointerDown={back.pointerDown}
                                    onPointerUp={back.pointerUp}
                                >
                                    <GoChevronLeft />
                                </div>
                            </div>
                            {/* <div className={styles["control-item"]}>
                            <div
                                className={`flex-core ${styles["control-item-btn"]}`}
                                onPointerDown={multiPor.pointerDown}
                                onPointerUp={multiPor.pointerUp}
                            >
                                <GoCopy />
                            </div>
                        </div> */}
                            {
                                <div
                                    className={styles["control-item"]}
                                    onClick={toFullscreen}
                                >
                                    <div
                                        className={`flex-core ${styles["control-item-btn"]}`}
                                    >
                                        <GoScreenFull />
                                    </div>
                                </div>
                            }
                            <div
                                className={styles["control-item"]}
                                onClick={lockHandle}
                            >
                                <div
                                    className={`flex-core ${styles["control-item-btn"]}`}
                                >
                                    {!lock ? <GoLock /> : <GoUnlock />}
                                </div>
                            </div>
                            <div className={styles["control-item"]}>
                                <div
                                    className={`flex-core ${styles["control-item-btn"]}`}
                                    onClick={recoverSize}
                                >
                                    <GoFold></GoFold>
                                </div>
                            </div>
                            <div
                                className={styles["control-item"]}
                                onClick={async () => {
                                    STATE.fullScreenContainer!.focus();

                                    // TODO: Auto repeat when holding
                                    await STATE.client?.controlMessageWriter!.injectKeyCode(
                                        {
                                            action: AndroidKeyEventAction.Down,
                                            keyCode: AndroidKeyCode.VolumeUp,
                                            repeat: 0,
                                            metaState: 0,
                                        },
                                    );
                                    await STATE.client?.controlMessageWriter!.injectKeyCode(
                                        {
                                            action: AndroidKeyEventAction.Up,
                                            keyCode: AndroidKeyCode.VolumeUp,
                                            repeat: 0,
                                            metaState: 0,
                                        },
                                    );
                                }}
                            >
                                +
                            </div>
                            <div
                                className={styles["control-item"]}
                                onClick={async () => {
                                    STATE.fullScreenContainer!.focus();

                                    await STATE.client?.controlMessageWriter!.injectKeyCode(
                                        {
                                            action: AndroidKeyEventAction.Down,
                                            keyCode: AndroidKeyCode.VolumeDown,
                                            repeat: 0,
                                            metaState: 0,
                                        },
                                    );
                                    await STATE.client?.controlMessageWriter!.injectKeyCode(
                                        {
                                            action: AndroidKeyEventAction.Up,
                                            keyCode: AndroidKeyCode.VolumeDown,
                                            repeat: 0,
                                            metaState: 0,
                                        },
                                    );
                                }}
                            >
                                -
                            </div>
                            <div className={styles["control-item"]}>
                                <div
                                    onClick={dispose}
                                    className={`flex-core ${styles["control-item-btn"]}`}
                                >
                                    <GoUnlink />
                                </div>
                            </div>
                        </>
                    )}
                </div>

                {!collapse && (
                    <div
                        className={`${styles["control-section-row"]} ${styles["control-section-help-row"]}`}
                    >
                        <div
                            className={styles["control-item"]}
                            onClick={() => {
                                setCollapse(!collapse);
                            }}
                        >
                            收起
                        </div>
                        <div
                            className={styles["control-item"]}
                            onPointerDown={back.pointerDown}
                            onPointerUp={back.pointerUp}
                        >
                            返回
                        </div>
                        <div
                            className={styles["control-item"]}
                            onClick={toFullscreen}
                        >
                            全屏
                        </div>
                        <div
                            className={styles["control-item"]}
                            onClick={lockHandle}
                        >
                            锁屏
                        </div>
                        <div
                            className={styles["control-item"]}
                            onClick={recoverSize}
                        >
                            复位
                        </div>
                        <div
                            className={styles["control-item"]}
                            onClick={async () => {
                                STATE.fullScreenContainer!.focus();

                                // TODO: Auto repeat when holding
                                await STATE.client?.controlMessageWriter!.injectKeyCode(
                                    {
                                        action: AndroidKeyEventAction.Down,
                                        keyCode: AndroidKeyCode.VolumeUp,
                                        repeat: 0,
                                        metaState: 0,
                                    },
                                );
                                await STATE.client?.controlMessageWriter!.injectKeyCode(
                                    {
                                        action: AndroidKeyEventAction.Up,
                                        keyCode: AndroidKeyCode.VolumeUp,
                                        repeat: 0,
                                        metaState: 0,
                                    },
                                );
                            }}
                        >
                            音+
                        </div>
                        <div
                            className={styles["control-item"]}
                            onClick={async () => {
                                STATE.fullScreenContainer!.focus();

                                await STATE.client?.controlMessageWriter!.injectKeyCode(
                                    {
                                        action: AndroidKeyEventAction.Down,
                                        keyCode: AndroidKeyCode.VolumeDown,
                                        repeat: 0,
                                        metaState: 0,
                                    },
                                );
                                await STATE.client?.controlMessageWriter!.injectKeyCode(
                                    {
                                        action: AndroidKeyEventAction.Up,
                                        keyCode: AndroidKeyCode.VolumeDown,
                                        repeat: 0,
                                        metaState: 0,
                                    },
                                );
                            }}
                        >
                            音-
                        </div>
                        <div
                            className={styles["control-item"]}
                            onClick={dispose}
                        >
                            断开
                        </div>
                    </div>
                )}
            </section>
            {showList && (
                <DisplayList
                    onClose={() => {
                        setShowList(false);
                    }}
                ></DisplayList>
            )}
        </>
    );
}
