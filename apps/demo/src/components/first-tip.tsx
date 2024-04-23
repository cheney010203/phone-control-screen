"use client";
import styles from "@/styles/modules/first-tip.module.scss";
import { getItem, setItem } from "@/utils/localStorage";
import { Button, Mask } from "antd-mobile";
import { useState } from "react";
const androidFlagge = getItem("androidFlag");
const initTip = getItem("initTip");
if (!initTip) {
    setItem("initTip", true);
}

const tipNum = 5;
function setDisplay(idx: number): string[] {
    let displayArr: string[] = new Array(tipNum).fill("none");
    // 首先，确保idx在有效范围内
    idx = Math.max(0, Math.min(idx, displayArr.length - 1));

    // 使用Array.fill方法将displayArr中所有元素设置为'none'
    displayArr.fill("none");

    // 将指定位置的元素设置为'block'
    displayArr[idx] = "block";

    // 输出或返回修改后的displayArr
    return displayArr;
}

const TipOnce = ({
    display,
    nextDisplay,
    preDisplay,
    preBtnStyle = {},
    tipBtnStyle = {},
    left = "88px",
    top = "8px",
    imgSrc = "/quanping@2x.png",
    text = "点击此按钮开启全屏",
    btnText = "下一条",
    preBtnText = "上一条",
    noPre = false,

    tipTextStyle = {
        // left: "50%",
        // transform: "translateX(-50%)",
    },
    tipTextBoxStyle = {},
}: any) => {
    return (
        <div
            className={styles["icon-pos"]}
            style={{
                left,
                top,
                display,
            }}
        >
            {/* 全屏 */}
            <div className={styles["icon-wrap"]}>
                <div className={styles["icon-inner-wrap"]}>
                    <img className={styles["icon"]} src={imgSrc} alt="" />
                </div>
            </div>
            <div
                className={styles["tip-text-box"]}
                style={{
                    display: "flex",
                    ...tipTextBoxStyle,
                }}
            >
                <div style={tipTextStyle} className={styles["tip-text"]}>
                    {text}
                </div>
                <div className={styles["tip-btn"]} style={tipBtnStyle}>
                    <Button
                        className={`${styles["tip-antdm-btn"]} ${styles["tip-antdm-pre-btn"]}`}
                        size="mini"
                        fill="outline"
                        shape="rounded"
                        onClick={preDisplay}
                        style={preBtnStyle}
                    >
                        {preBtnText}
                    </Button>
                    <Button
                        className={styles["tip-antdm-btn"]}
                        size="mini"
                        fill="outline"
                        shape="rounded"
                        onClick={nextDisplay}
                    >
                        {btnText}
                    </Button>
                </div>
            </div>
        </div>
    );
};

export default function FirstTip() {
    const [stateIdx, setStateIdx] = useState(0);
    const [stateMask, setStateMask] = useState(true);
    const [stateFirstTip, setStateFirstTip] = useState(true);

    const displayArr = setDisplay(stateIdx);

    const nextDisplay = () => {
        if (stateIdx >= tipNum - 1) {
            setStateMask(false);
            return;
        }
        setStateIdx(stateIdx + 1);
    };

    const preDisplay = () => {
        if (stateIdx >= 1) {
            setStateIdx(stateIdx - 1);
        }
    };

    // useEffect(() => {

    //     setStateFirstTip(initTip);
    // }, []);

    if (initTip) {
        return null;
    }

    const TipOnceArr = [
        {
            left: "calc(50% - 124px)",
            top: "calc(64px)",
            imgSrc: "/shouqi@2x.png",
            text: (
                <>
                    <div>点此可收起工具栏</div>
                    <div>注：按住工具栏任意位置拖动，避免画面遮挡</div>
                </>
            ),
            noPre: true,
            tipBtnStyle: {
                "justify-content": "left",
            },
            tipTextBoxStyle: {
                transform: "translateX(0)",
                "margin-left": 0,
            },
            preBtnStyle: {
                display: "none",
            },
        },
        // {
        //     left: "calc(50% - 88px)",
        //     top: "calc(64px)",
        //     imgSrc: "/fanhui@2x.png",
        //     text: "点此返回上一级",
        // },
        {
            left: "calc(50% - 75px)",
            top: "calc(64px)",
            imgSrc: "/quanping@2x.png",
            text: androidFlagge ? "点此进入全屏" : "iOS设备暂不支持此功能",
        },
        {
            left: "calc(50% - 28px)",
            top: "calc(64px)",
            imgSrc: "/caozuo-no@2x.png",
            text: (
                <div style={{ width: "206px" }}>
                    <div>点此进入锁屏模式，可双指缩放、单指拖动画面</div>
                    <div>注：再次点击可解除锁屏模式</div>
                </div>
            ),
        },
        {
            left: "calc(50% + 20px)",
            top: "calc(64px)",
            imgSrc: "/chongzhi@2x.png",
            text: "点此实现画面缩放、移位后一键复位",
            tipTextBoxStyle: {
                minWidth: "200px",
            },
        },
        {
            left: "calc(50% + 68px)",
            top: "calc(64px)",
            imgSrc: "/duankai@2x.png",
            text: "点此断开连接",
            btnText: "关闭",
            tipTextBoxStyle: {
                whiteSpace: "nowrap",
            },
        },
    ].map((tipItem, idx) => {
        /* <TipOnce
                    {...{
                        display: displayArr[0],
                        nextDisplay,
                        left: "8px",
                        top: "8px",
                        imgSrc: "/shouqi@2x.png",
                        text: (
                            <>
                                <div>
                                    点击此按钮可折叠或展开工具栏，此工具栏可拖动
                                </div>
                            </>
                        ),
                        tipTextStyle: {
                            left: 0,
                            transform: "translateX(0)",
                        },
                    }}
                />
 */
        return (
            <TipOnce
                {...{
                    display: displayArr[idx],
                    nextDisplay,
                    preDisplay,
                    ...tipItem,
                }}
            />
        );
    });

    return (
        <div
            style={{
                background: "#000",
                width: "100vw",
                height: "100vh",
                display: stateMask ? "block" : "none",
                position: "absolute",
                left: 0,
                right: 0,
                zIndex: 99,
            }}
        >
            <img
                style={{
                    width: 240,
                    position: "absolute",
                    // left: 16,
                    // top: 16,
                    left: "50%",
                    top: "100px",
                    marginLeft: "-120px",
                    marginTop: "-31px",
                }}
                src="/tiptoolphoto.png"
                alt=""
            />
            <Mask visible={stateMask}>{TipOnceArr}</Mask>
        </div>
    );
}
