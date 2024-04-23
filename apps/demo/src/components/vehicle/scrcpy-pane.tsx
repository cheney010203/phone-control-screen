import {
    AndroidMotionEventAction,
    AndroidMotionEventButton,
    ScrcpyPointerId,
} from "@yume-chan/scrcpy";
import { Modal } from "antd-mobile";
import {
    KeyboardEvent,
    MouseEvent,
    PointerEvent,
    TouchEvent,
    useEffect,
    useRef,
    useState,
} from "react";
import eventsbus from "../../utils/eventsbus";
import { STATE } from "../scrcpy";
import ScrcpyLoading from "./scrcpy-loading";

type Props = {
    [key: string]: any;
};

type PointerEventList =
    | "handlePointerDown"
    | "handlePointerMove"
    | "handlePointerUp"
    | "handleContextMenu"
    | "handlePointerLeave";

type PointerEventType = Record<PointerEventList, (e: any) => void>;

// 定义日期格式化函数
function formatDate(): string {
    const date = new Date();
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const dateStr = String(date.getDate()).padStart(2, "0");
    const hours = String(date.getHours()).padStart(2, "0");
    const minutes = String(date.getMinutes()).padStart(2, "0");
    const seconds = String(date.getSeconds()).padStart(2, "0");

    return `${year}-${month}-${dateStr} ${hours}:${minutes}:${seconds}`;
}

export default function ScrcpyPane(props: Props) {
    const [container, setContainer] = useState<HTMLDivElement | null>(null);
    const [scale, setScale] = useState(1);
    const [lock, setLock] = useState(false);
    const [tx, setTx] = useState(0);
    const [ty, setTy] = useState(0);
    const pointerPosition = useRef<any>(null);
    const translateSnapshot = useRef([0, 0]);
    const curPointerPos = useRef<any>({});
    let landscapeTip = useRef<any>(null);
    const pointerMap = useRef<{
        [inKeys: number | string]: {
            start: [number, number];
            latest: [number, number];
        };
    }>({});

    const scaleSnapshot = useRef({
        max: 3,
        min: 1,
        current: 0,
    });

    const MOUSE_EVENT_BUTTON_TO_ANDROID_BUTTON = [
        AndroidMotionEventButton.Primary,
        AndroidMotionEventButton.Tertiary,
        AndroidMotionEventButton.Secondary,
        AndroidMotionEventButton.Back,
        AndroidMotionEventButton.Forward,
    ];

    function injectTouch(
        action: AndroidMotionEventAction,
        e: PointerEvent<HTMLDivElement>,
    ) {
        if (!STATE.client) {
            return;
        }

        const { pointerType } = e;
        let pointerId: bigint;
        if (pointerType === "mouse") {
            // Android 13 has bug with mouse injection
            // https://github.com/Genymobile/scrcpy/issues/3708
            pointerId = ScrcpyPointerId.Finger;
        } else {
            pointerId = BigInt(e.pointerId);
        }

        const { x, y } = STATE.clientPositionToDevicePosition(
            e.clientX,
            e.clientY,
        );

        // const messages = STATE.hoverHelper!.process({
        //     action,
        //     pointerId,
        //     screenWidth: STATE.client.screenWidth!,
        //     screenHeight: STATE.client.screenHeight!,
        //     pointerX: x,
        //     pointerY: y,
        //     pressure: e.pressure,
        //     actionButton: MOUSE_EVENT_BUTTON_TO_ANDROID_BUTTON[e.button],
        //     // `MouseEvent.buttons` has the same order as Android `MotionEvent`
        //     buttons: e.buttons,
        // });

        // console.log("injectTouch origin msg", {
        //     action,
        //     pointerId,
        //     screenWidth: STATE.client.screenWidth!,
        //     screenHeight: STATE.client.screenHeight!,
        //     pointerX: x,
        //     pointerY: y,
        //     pressure: e.pressure,
        //     actionButton: MOUSE_EVENT_BUTTON_TO_ANDROID_BUTTON[e.button],
        //     // `MouseEvent.buttons` has the same order as Android `MotionEvent`
        //     buttons: e.buttons,
        // });

        // console.log("injectTouch messages", messages);
        // for (const message of messages) {
        //     STATE.client.controlMessageWriter!.injectTouch(message);
        // }

        // console.log("injectTouch", Date.now());

        STATE.client.controlMessageWriter!.injectTouch({
            action,
            pointerId,
            // timeStamp: BigInt(Date.now().toString().substr(0, 10)),
            screenWidth: STATE.client.screenWidth!,
            screenHeight: STATE.client.screenHeight!,
            pointerX: Math.round(x),
            pointerY: Math.round(y),
            pressure: e.pressure,
            actionButton: MOUSE_EVENT_BUTTON_TO_ANDROID_BUTTON[e.button],
            // `MouseEvent.buttons` has the same order as Android `MotionEvent`
            buttons: e.buttons,
        });
    }

    function handleWheel(e: WheelEvent) {
        if (!STATE.client) {
            return;
        }

        STATE.fullScreenContainer!.focus();
        e.preventDefault();
        e.stopPropagation();

        const { x, y } = STATE.clientPositionToDevicePosition(
            e.clientX,
            e.clientY,
        );
        STATE.client!.controlMessageWriter!.injectScroll({
            screenWidth: STATE.client!.screenWidth!,
            screenHeight: STATE.client!.screenHeight!,
            pointerX: x,
            pointerY: y,
            scrollX: -e.deltaX / 100,
            scrollY: -e.deltaY / 100,
            buttons: 0,
        });
    }

    async function handleKeyEvent(e: KeyboardEvent<HTMLDivElement>) {
        if (!STATE.client) {
            return;
        }

        e.preventDefault();
        e.stopPropagation();

        const { type, code } = e;
        STATE.keyboard![type === "keydown" ? "down" : "up"](code);
    }

    const handleContent: PointerEventType = {
        handleContextMenu(e: MouseEvent<HTMLDivElement>) {
            e.preventDefault();
        },
        handlePointerDown(e: PointerEvent<HTMLDivElement>) {
            if (!STATE.client) {
                return;
            }
            console.log("handlePointerDown", e);
            const timestamp = Date.now();
            // const { upPointerId } = curPointerPos.current;
            // if (
            //     curPointerPos.current.timestamp &&
            //     timestamp - curPointerPos.current.timestamp < 500
            // ) {
            //     outTime = true;
            // } else {
            //     outTime = false;
            // }
            if (curPointerPos.current.hasUpEvent === false) {
                curPointerPos.current.hasUpEvent = true;
                injectTouch(AndroidMotionEventAction.Up, e);
            }

            curPointerPos.current = null;
            curPointerPos.current = {};
            curPointerPos.current.curTime = formatDate();
            curPointerPos.current.timestamp = timestamp;
            curPointerPos.current.downPointerId = e.pointerId;
            curPointerPos.current.downClientY = e.clientY;
            curPointerPos.current.moveArr = [];
            curPointerPos.current.moveXYArr = [];
            curPointerPos.current.moveEventArr = [];
            curPointerPos.current.moveTimestampArr = [];
            curPointerPos.current.moveDistanceArr = [];
            curPointerPos.current.moveTimestampDistanceArr = [];
            curPointerPos.current.lastMoveEvent = null;
            curPointerPos.current.hasUpEvent = false;
            curPointerPos.current.hasDownEvent = true;

            STATE.fullScreenContainer!.focus();
            e.preventDefault();
            e.stopPropagation();

            e.currentTarget.setPointerCapture(e.pointerId);
            injectTouch(AndroidMotionEventAction.Down, e);
        },
        handlePointerMove(e: PointerEvent<HTMLDivElement>) {
            if (!STATE.client) {
                return;
            }
            // console.log("handlePointerMove", e.pageY);
            if (!curPointerPos.current.hasDownEvent) {
                curPointerPos.current.hasDownEvent = true;
                injectTouch(AndroidMotionEventAction.Down, e);
            }

            curPointerPos.current.lastMoveEvent = e;
            const curClientY: any = e.clientY;
            const curClientX = e.clientX;
            const curTime = Date.now();
            const { moveXYArr } = curPointerPos.current;
            /*  if (moveXYArr && moveXYArr.length > 0) {
                const [preClientX, preClientY] = moveXYArr.slice(-1)[0];
                if (
                    Math.abs(curClientX - preClientX) < 1 ||
                    Math.abs(curClientY - preClientY) < 1
                ) {
                    console.log("小于1像素触发");

                    return;
                }
            } */

            curPointerPos.current.moveArr?.push(curClientY);
            moveXYArr?.push([curClientX, curClientY]);
            curPointerPos.current.moveTimestampArr?.push(curTime);
            curPointerPos.current.moveEventArr?.push(e);

            const timeArrLen = curPointerPos.current.moveTimestampArr.length;
            const timedisLen =
                curPointerPos.current.moveTimestampDistanceArr.length;
            if (timedisLen == 0) {
                curPointerPos.current.moveTimestampDistanceArr.push(0);
            } else {
                curPointerPos.current.moveTimestampDistanceArr.push(
                    curTime -
                        curPointerPos.current.moveTimestampArr[timeArrLen - 2],
                );
            }

            const moveArrLen = curPointerPos.current.moveArr.length;
            const movedisArrLen = curPointerPos.current.moveDistanceArr.length;
            if (movedisArrLen == 0) {
                curPointerPos.current.moveDistanceArr.push(0);
            } else {
                curPointerPos.current.moveDistanceArr.push(
                    curClientY - curPointerPos.current.moveArr[moveArrLen - 2],
                );
            }

            e.preventDefault();
            e.stopPropagation();

            if (curPointerPos.current.moveEventArr.length >= 8) {
                // console.log(
                //     "8次批量",
                //     curPointerPos.current.moveEventArr,
                //     curTime,
                // );
                let idx = 1;
                while (curPointerPos.current.moveEventArr.length !== 0) {
                    if (idx % 2 == 0) {
                        idx = idx + 1;
                        curPointerPos.current.moveEventArr.shift();
                        continue;
                    }
                    console.log("idx", idx);
                    idx = idx + 1;
                    const moveEvent =
                        curPointerPos.current.moveEventArr.shift();
                    injectTouch(AndroidMotionEventAction.Move, moveEvent);
                }
            }

            // injectTouch(AndroidMotionEventAction.Move, e);

            // injectTouch(
            //     e.buttons === 0
            //         ? AndroidMotionEventAction.HoverMove
            //         : AndroidMotionEventAction.Move,
            //     e,
            // );
        },
        handlePointerLeave(e: PointerEvent<HTMLDivElement>) {
            if (!STATE.client) {
                return;
            }
            console.log("handlePointerLeave", e);
            curPointerPos.current.hasDownEvent = false;

            e.preventDefault();
            e.stopPropagation();
            // Because pointer capture on pointer down, this event only happens for hovering mouse and pen.
            // Release the injected pointer, otherwise it will stuck at the last pointerPosition.
            injectTouch(AndroidMotionEventAction.HoverExit, e);
            injectTouch(AndroidMotionEventAction.Up, e);
        },
        handlePointerUp(e: PointerEvent<HTMLDivElement>) {
            if (!STATE.client) {
                console.log("handlePointerUp !STATE.client");
                return;
            }

            if (curPointerPos.current.moveEventArr.length > 0) {
                let idx = 1;
                while (curPointerPos.current.moveEventArr.length !== 0) {
                    if (idx % 2 == 0) {
                        idx = idx + 1;
                        curPointerPos.current.moveEventArr.shift();
                        continue;
                    }
                    idx = idx + 1;
                    const moveEvent =
                        curPointerPos.current.moveEventArr.shift();
                    console.log("moveEvent", moveEvent);

                    injectTouch(AndroidMotionEventAction.Move, moveEvent);
                }
            }

            curPointerPos.current.hasUpEvent = true;
            curPointerPos.current.upTimestamp = Date.now();
            curPointerPos.current.upPointerId = e.pointerId;
            curPointerPos.current.hasDownEvent = false;
            curPointerPos.current.upClientY = [e.clientX, e.clientY];
            curPointerPos.current.yDistance =
                e.clientY - curPointerPos.current.downClientY;
            console.log("curPointerPos", curPointerPos.current);
            console.log("handlePointerUp", e);

            // injectTouch(AndroidMotionEventAction.Up, e);

            e.preventDefault();
            e.stopPropagation();

            injectTouch(AndroidMotionEventAction.Up, e);

            // const { lastMoveEvent } = curPointerPos.current;
            // if (lastMoveEvent) {
            //     // 通过增加缓冲move，减少滑动时的反弹现象。
            //     setTimeout(() => {
            //         injectTouch(AndroidMotionEventAction.Move, e);
            //     }, 5);

            //     setTimeout(() => {
            //         // handlePointerEvent(lastMoveEvent, "handlePointerMove");
            //         injectTouch(AndroidMotionEventAction.Up, e);
            //     }, 10);
            // } else {
            //     injectTouch(AndroidMotionEventAction.Up, e);
            // }
        },
    };

    function handlePointerEvent(
        e: PointerEvent<HTMLDivElement> | MouseEvent<HTMLDivElement>,
        key: keyof PointerEventType,
    ) {
        if (!lock) {
            handleContent[key]?.(e);
        }
    }

    const handlerTouchStart = (e: TouchEvent) => {
        e.stopPropagation();
        if (!lock) {
            return;
        }
        let r = [];
        for (let i = 0; i < e.touches.length; i++) {
            let item = e.touches[i];
            r.push({
                x: item.clientX,
                y: item.clientY,
            });
        }
        pointerPosition.current = r;
        scaleSnapshot.current.current = scale;
        translateSnapshot.current = [tx, ty];

        console.log("handlerTouchStart", e);
    };

    const handlerTouchMove = (e: TouchEvent) => {
        e.stopPropagation();
        if (!lock) {
            return;
        }
        const touches = e.touches;
        const len = touches.length;
        let cScale = 1;
        if (len > 1) {
            let oX =
                pointerPosition.current[1].x - pointerPosition.current[0].x;
            const oY =
                pointerPosition.current[1].y - pointerPosition.current[0].y;
            const nX = touches[1].clientX - touches[0].clientX;
            const nY = touches[1].clientY - touches[0].clientY;
            const oLen = Math.sqrt(Math.pow(oX, 2) + Math.pow(oY, 2));
            const nLen = Math.sqrt(Math.pow(nX, 2) + Math.pow(nY, 2));
            cScale = (nLen / oLen) * scaleSnapshot.current.current;

            if (cScale < scaleSnapshot.current.min) {
                cScale = scaleSnapshot.current.min;
            } else if (cScale > scaleSnapshot.current.max) {
                cScale = scaleSnapshot.current.max;
            }
            setScale(cScale);
        } else {
            const moveX = touches[0].clientX - pointerPosition.current[0].x;
            const moveY = touches[0].clientY - pointerPosition.current[0].y;
            setTx(moveX + translateSnapshot.current?.[0]);
            setTy(moveY + translateSnapshot.current?.[1]);
        }

        console.log("handlerTouchMove", e);
    };
    const handlerTouchEnd = (e: TouchEvent) => {
        if (e.touches.length > 0) {
            pointerPosition.current = new Array(e.touches.length)
                .fill(1)
                .map((a, i) => {
                    const item = e.touches[i];
                    return {
                        x: item.clientX,
                        y: item.clientY,
                    };
                });
        }
        // console.log("handlerTouchEnd", e);
    };
    // const dargHandle = {
    //     pointerDown(e: PointerEvent) {
    //         if (!lock) {
    //             return;
    //         }
    //         const map = pointerMap.current;
    //         map[e.pointerId] = {
    //             start: [e.clientX, e.clientY],
    //             latest: [e.clientX, e.clientY],
    //         };
    //         scaleSnapshot.current.current = scale;
    //     },
    //     pointerMove(e: PointerEvent) {
    //         if (!lock) {
    //             return;
    //         }
    //         const map = pointerMap.current;
    //         const keys: (keyof typeof map)[] = Object.keys(map);
    //         const item = map[e.pointerId];
    //         const curPos: [number, number] = [e.clientX, e.clientY];
    //         if (keys.length > 1) {
    //             let sec = map[keys[0]];
    //             if (e.pointerId === keys[0]) {
    //                 sec = map[keys[1]];
    //             }
    //             const oldPoint1 = item.latest;
    //             const oldPoint2 = sec.start;
    //             const newPoint1 = curPos;
    //             const newPoint2 = sec.latest;
    //             const oldLen = Math.sqrt(
    //                 Math.pow(oldPoint1![0] - oldPoint2![0], 2) +
    //                     Math.pow(oldPoint1![1] - oldPoint2![1], 2),
    //             );
    //             const newLen = Math.sqrt(
    //                 Math.pow(newPoint1![0] - newPoint2![0], 2) +
    //                     Math.pow(newPoint1![1] - newPoint2![1], 2),
    //             );
    //             scaleSnapshot.current.current =
    //                 (oldLen / newLen) * scaleSnapshot.current.current;
    //             setScale(scaleSnapshot.current.current);
    //             item.start = item.latest;
    //             item.latest = curPos;
    //         } else {
    //             const start = item.latest;
    //             const x = curPos[0] - start[0];
    //             const y = curPos[1] - start[1];
    //             console.log(x, y);
    //         }
    //     },
    //     pointerUp(e: PointerEvent) {
    //         console.log(e, pointerMap);
    //         pointerMap.current[e.pointerId] &&
    //             delete pointerMap.current[e.pointerId];
    //     },
    // };

    useEffect(() => {
        if (!container) {
            return;
        }

        STATE.setRendererContainer(container);
        container.addEventListener("wheel", handleWheel, {
            passive: false,
        });
        const container2 = STATE.fullScreenContainer as HTMLDivElement;

        function setSize() {
            if (!container) {
                return;
            }
            // const videoRatio = STATE.width / STATE.height;
            // const containerRatio =
            //     container2!.clientWidth / container2!.clientHeight;
            const stateWidth = STATE.width;
            const stateHeight = STATE.height;
            const width = container2!.clientWidth;
            const height = container2!.clientHeight;
            let scale1 = width / stateWidth;
            let scale2 = height / stateHeight;

            if (width < height) {
                // 竖屏状态
                if (!landscapeTip.current) {
                    landscapeTip.current = Modal.show({
                        content: (
                            <>
                                <div>请取消手机的方向锁定模式</div>
                                <div>
                                    如果是安卓微信扫一扫进入，请开启微信的横屏模式
                                </div>
                                <div>
                                    微信横屏模式开启方法：我-&gt;设置-&gt;通用-&gt;开启横屏模式
                                </div>
                            </>
                        ),
                        closeOnMaskClick: true,
                    });
                }
            } else {
                console.log("landscapeTip", landscapeTip);
                if (landscapeTip.current && landscapeTip.current.close) {
                    landscapeTip.current.close();
                }
            }

            const scale = Math.min(scale1, scale2);
            setScale(scale);
            setTx(0);
            setTy(0);
            scaleSnapshot.current.min = scale;

            console.log("屏幕参数setSize", {
                width,
                height,
                stateWidth,
                stateHeight,
            });
        }
        container2.addEventListener("resize", function () {
            setSize();
        });
        eventsbus.on("sizeChange", setSize);
        eventsbus.on("lock", (bool: boolean) => {
            setLock(bool);
        });

        return () => {
            eventsbus.off("sizeChange");
            eventsbus.off("lock");
            container.removeEventListener("wheel", handleWheel);
        };
    }, [container]);

    useEffect(() => {
        document.addEventListener("visibilitychange", () => {
            if (document.hidden) {
                // console.log("页面被挂起");
                // STATE.stop();
                location.replace("/");
            } else {
                console.log("页面呼出");
            }
        });
        return () => {
            STATE.stop();
        };
    }, []);
    return (
        <>
            {!STATE.running && <ScrcpyLoading></ScrcpyLoading>}
            <div
                ref={STATE.setFullScreenContainer}
                tabIndex={0}
                className="container flex-core overflow-hidden"
                style={{
                    background: "#000",
                }}
                onKeyDown={handleKeyEvent}
                onKeyUp={handleKeyEvent}
                onTouchStart={handlerTouchStart}
                onTouchMove={handlerTouchMove}
                onTouchEnd={handlerTouchEnd}
                // onPointerMove={dargHandle.pointerMove}
                // onPointerDown={dargHandle.pointerDown}
                // onPointerCancel={dargHandle.pointerUp}
            >
                <div
                    ref={setContainer}
                    style={{
                        display: "inline-block",
                        transform: `scale(${scale}) translate(${tx}px, ${ty}px)`,
                        transformOrigin: "center center",
                        touchAction: "none",
                    }}
                    onPointerDown={(e) => {
                        handlePointerEvent(e, "handlePointerDown");
                    }}
                    onPointerMove={(e) => {
                        handlePointerEvent(e, "handlePointerMove");
                    }}
                    onPointerUp={(e) => {
                        handlePointerEvent(e, "handlePointerUp");
                    }}
                    onPointerCancel={(e) => {
                        handlePointerEvent(e, "handlePointerUp");
                    }}
                    onPointerLeave={(e) => {
                        // handlePointerLeave(e);
                        // console.log(Date.now());
                        // 兼容ios，ios移动到屏幕边缘会丢失pointerUp事件。所以这里要手动触发handlePointerUp
                        // if (!curPointerPos.current.hasUpEvent) {
                        //     handlePointerEvent(e, "handlePointerUp");
                        // }
                        // console.log("pointerLeave");
                    }}
                    onContextMenu={(e) => {
                        handlePointerEvent(e, "handleContextMenu");
                    }}
                />
            </div>
        </>
    );
}
