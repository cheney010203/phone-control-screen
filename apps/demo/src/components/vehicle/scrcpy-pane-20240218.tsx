"use client";
import { getItem, setItem } from "@/utils/localStorage";
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

const MOUSE_EVENT_BUTTON_TO_ANDROID_BUTTON = [
    AndroidMotionEventButton.Primary,
    AndroidMotionEventButton.Tertiary,
    AndroidMotionEventButton.Secondary,
    AndroidMotionEventButton.Back,
    AndroidMotionEventButton.Forward,
];

let injectTouchDisable = false;
const androidFlag = getItem("androidFlag");
let touchRecord: any = {};

const getDevicePos = (e: PointerEvent) => {
    const { x, y } = STATE.clientPositionToDevicePosition(e.clientX, e.clientY);
    return {
        pointerX: Math.round(x),
        pointerY: Math.round(y),
    };
};

function injectTouch(
    action: AndroidMotionEventAction,
    e: PointerEvent<HTMLDivElement>,
) {
    if (!STATE.client) {
        return;
    }

    if (injectTouchDisable) {
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

    const { x, y } = STATE.clientPositionToDevicePosition(e.clientX, e.clientY);

    const messages = STATE.hoverHelper!.process({
        action,
        pointerId,
        screenWidth: STATE.client.screenWidth!,
        screenHeight: STATE.client.screenHeight!,
        pointerX: Math.round(x),
        pointerY: Math.round(y),
        pressure: e.pressure,
        actionButton: MOUSE_EVENT_BUTTON_TO_ANDROID_BUTTON[e.button],
        // `MouseEvent.buttons` has the same order as Android `MotionEvent`
        buttons: e.buttons,
    });
    for (const message of messages) {
        STATE.client.controlMessageWriter!.injectTouch(message);
    }
}

function handlePointerDown(e: PointerEvent<HTMLDivElement>) {
    if (!STATE.client) {
        return;
    }
    touchRecord = {
        moveArr: [],
    };
    touchRecord.hasPointerDown = true;
    touchRecord.downEvent = getDevicePos(e);

    STATE.fullScreenContainer!.focus();
    e.preventDefault();
    e.stopPropagation();

    e.currentTarget.setPointerCapture(e.pointerId);
    injectTouch(AndroidMotionEventAction.Down, e);
}

function handlePointerMove(e: PointerEvent<HTMLDivElement>) {
    if (!STATE.client) {
        return;
    }

    e.preventDefault();
    e.stopPropagation();

    touchRecord.hasPointerMove = true;
    touchRecord.moveArr.push(getDevicePos(e));

    // 优化华为手机点击时触发的down, move, up事件坐标一致问题
    if (touchRecord.moveArr.length === 1) {
        const { pointerX, pointerY } = touchRecord.downEvent;
        const { pointerX: upX, pointerY: upY } = getDevicePos(e);
        if (pointerX === upX && pointerY === upY) {
            return;
        }
    }

    injectTouch(
        e.buttons === 0
            ? AndroidMotionEventAction.HoverMove
            : AndroidMotionEventAction.Move,
        e,
    );
}

function handlePointerUp(e: PointerEvent<HTMLDivElement>) {
    if (!STATE.client) {
        return;
    }

    e.preventDefault();
    e.stopPropagation();
    injectTouch(AndroidMotionEventAction.Up, e);

    touchRecord.hasPointerUp = true;
    touchRecord.upEvent = getDevicePos(e);
    console.log("touchRecord", touchRecord);
}

function handlePointerLeave(e: PointerEvent<HTMLDivElement>) {
    if (!STATE.client) {
        return;
    }

    e.preventDefault();
    e.stopPropagation();
    // Because pointer capture on pointer down, this event only happens for hovering mouse and pen.
    // Release the injected pointer, otherwise it will stuck at the last position.
    // injectTouch(AndroidMotionEventAction.HoverExit, e);
    injectTouch(AndroidMotionEventAction.Up, e);
}

function handleContextMenu(e: MouseEvent<HTMLDivElement>) {
    e.preventDefault();
}

export default function ScrcpyPane(props: Props) {
    const [container, setContainer] = useState<HTMLDivElement | null>(null);
    const [scale, setScale] = useState(1);
    const [lock, setLock] = useState(false);
    const [tx, setTx] = useState(0);
    const [ty, setTy] = useState(0);
    const pointerPosition = useRef<any>(null);
    const translateSnapshot = useRef([0, 0]);
    let landscapeTip = useRef<any>(null);

    const scaleSnapshot = useRef({
        max: 3,
        min: 1,
        current: 0,
    });

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
                setItem("landscapeFlag", false);
                const androidTip = (
                    <>
                        <div>为提升体验，请按以下步骤开启横屏模式：</div>
                        <div>第一步：开启微信横屏</div>
                        <div>第二步：开启手机横屏</div>
                        <div>详情可见公众号“灵镜掌控”【常见问题】</div>
                    </>
                );

                const iosTipText = (
                    <div
                        style={{
                            display: "flex",
                            justifyContent: "center",
                        }}
                    >
                        {"为提升体验，请开启横屏模式使用"}
                    </div>
                );
                // 宽小于高状态
                if (
                    !landscapeTip.current &&
                    !!getItem("landscape-fist") == false
                ) {
                    landscapeTip.current = Modal.show({
                        content: androidFlag ? androidTip : iosTipText,
                        closeOnMaskClick: true,
                        actions: [
                            {
                                key: "close",
                                primary: true,
                                text: (
                                    <div style={{ fontSize: "12px" }}>关闭</div>
                                ),
                                onClick() {
                                    landscapeTip.current?.close();
                                },
                            },
                            {
                                key: "nomore",
                                text: (
                                    <div style={{ fontSize: "12px" }}>
                                        下次不再提醒
                                    </div>
                                ),
                                onClick() {
                                    setItem("landscape-fist", true);
                                    landscapeTip.current?.close();
                                },
                            },
                        ],
                    });
                }
            } else {
                // 宽大于高状态
                console.log("横屏状态", landscapeTip);
                setItem("landscapeFlag", true);
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
            injectTouchDisable = bool;
        });

        return () => {
            eventsbus.off("sizeChange");
            eventsbus.off("lock");
            container.removeEventListener("wheel", handleWheel);
        };
    }, [container]);

    useEffect(() => {
        let timer: any = null;
        document.addEventListener("visibilitychange", () => {
            if (document.hidden) {
                // console.log("页面被挂起");
                // STATE.stop();
                // location.replace("/");
                timer = setTimeout(() => {
                    location.replace("/");
                }, 60 * 1000);
            } else {
                if (timer) {
                    clearTimeout(timer);
                }
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
                    onPointerDown={handlePointerDown}
                    onPointerMove={handlePointerMove}
                    onPointerUp={handlePointerUp}
                    onPointerCancel={handlePointerUp}
                    // onPointerLeave={handlePointerLeave}
                    onContextMenu={handleContextMenu}
                />
            </div>
        </>
    );
}
