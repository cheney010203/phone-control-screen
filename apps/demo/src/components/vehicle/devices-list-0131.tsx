"use client";
import { GLOBAL_STATE } from "@/state";
import styles from "@/styles/modules/list.module.scss";
import { DevicesItemType, vehicleMap } from "@/utils/utils";
import { Dialog, Empty } from "antd-mobile";
import { DeleteOutline } from "antd-mobile-icons";
import { observer } from "mobx-react-lite";
import Head from "next/head";
import Router from "next/router";

type Props = {
    [key: string]: any;
};

export type DevicesItemTypeDisplayItem = {
    name: string;
    displayId: string | number;
};

export type DevicesList = DevicesItemType[];

function index(props: Props) {
    const list: DevicesList = GLOBAL_STATE.carList;

    const remove = (vin: string) => {
        Dialog.confirm({
            content: "是否删除该设备？",
            onConfirm: async () => {
                GLOBAL_STATE.removeCarItem(vin);
            },
        });
    };

    return (
        <>
            {/* <FirstTip /> */}
            {/* <ScrcpyControl /> */}
            <Head>
                <title>设备列表</title>
            </Head>
            <div className={styles["container"]}>
                {/* <div className={styles["qrscanning"]}>
                    <img src="./saoyisao@2x.png" alt="" />
                    扫描车端二维码,新增设备
                </div> */}

                <div key={"list"} className={styles["device-list"]}>
                    <div className={styles["device-list-head"]}>设备列表</div>
                    {(() => {
                        if (list.length === 0) {
                            return (
                                <div
                                    key={"no-item"}
                                    className={styles["no-item"]}
                                >
                                    <div
                                        className={
                                            styles["device-list-sub-head"]
                                        }
                                    >
                                        其他设备
                                    </div>
                                    <div className={styles["device-item"]}>
                                        <div
                                            className={styles["no-item-inner"]}
                                        >
                                            <div
                                                className={
                                                    styles["no-item-icon"]
                                                }
                                            >
                                                <img
                                                    src="./touping@2x.png"
                                                    alt=""
                                                />
                                            </div>
                                            <div>1. 手机连接车载热点；</div>
                                            <div>
                                                2. 微信扫描车端灵镜掌控二维码；
                                            </div>
                                            <div>
                                                3. 连接成功，开启镜像操控。
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            );
                        }

                        const reverseList = [...list].reverse();
                        const firstItemData = reverseList[0];
                        const firstItem = (
                            <div
                                key={firstItemData.vin}
                                className={styles["latest-item"]}
                            >
                                <div className={styles["device-list-sub-head"]}>
                                    最近使用
                                </div>
                                <div className={styles["device-item"]}>
                                    <div className={styles["device-item-info"]}>
                                        <div>
                                            <img
                                                className={
                                                    styles["device-item-logo"]
                                                }
                                                src="/lingke-logo.png"
                                                alt=""
                                            />
                                            {
                                                vehicleMap[
                                                    firstItemData.vehicleType
                                                ]
                                            }
                                        </div>
                                        <div>vin码:{firstItemData.vin}</div>
                                    </div>
                                    <div
                                        className={
                                            styles["device-item-control"]
                                        }
                                    >
                                        <div
                                            className={
                                                styles[
                                                    "device-item-control-del"
                                                ]
                                            }
                                            onClick={() => {
                                                remove(firstItemData.vin);
                                            }}
                                        >
                                            <DeleteOutline />
                                        </div>
                                        <div
                                            className={
                                                styles[
                                                    "device-item-control-enter"
                                                ]
                                            }
                                            onClick={() => {
                                                const {
                                                    ip,
                                                    vin,
                                                    displayId,
                                                    para,
                                                    vehicleType,
                                                } = reverseList[0];
                                                GLOBAL_STATE.setCurrentCar(
                                                    reverseList[0],
                                                );
                                                if (para) {
                                                    Router.replace(
                                                        `/demo?para=${para}`,
                                                    );
                                                } else {
                                                    Router.replace(
                                                        `/demo?ip=${ip}&vin=${vin}&displayId=${displayId}&vehicleType=${vehicleType}`,
                                                    );
                                                }
                                            }}
                                        >
                                            进入控屏
                                        </div>
                                    </div>
                                </div>
                            </div>
                        );

                        const oldItems = reverseList.slice(1).map((item) => {
                            return (
                                <div
                                    key={item.vin}
                                    className={styles["device-item"]}
                                >
                                    <div className={styles["device-item-info"]}>
                                        <div>
                                            <img
                                                className={
                                                    styles["device-item-logo"]
                                                }
                                                src="/lingke-logo.png"
                                                alt=""
                                            />
                                            {vehicleMap[item.vehicleType]}
                                        </div>
                                        <div>vin码:{item.vin}</div>
                                    </div>
                                    <div
                                        className={
                                            styles["device-item-control"]
                                        }
                                    >
                                        <div
                                            className={
                                                styles[
                                                    "device-item-control-del"
                                                ]
                                            }
                                            onClick={() => {
                                                remove(item.vin);
                                            }}
                                        >
                                            <DeleteOutline />
                                        </div>
                                        <div
                                            className={
                                                styles[
                                                    "device-item-control-enter"
                                                ]
                                            }
                                            onClick={() => {
                                                const {
                                                    ip,
                                                    vin,
                                                    displayId,
                                                    para,
                                                    vehicleType,
                                                } = item;
                                                GLOBAL_STATE.setCurrentCar(
                                                    item,
                                                );
                                                if (para) {
                                                    Router.replace(
                                                        `/demo?para=${para}`,
                                                    );
                                                } else {
                                                    Router.replace(
                                                        `/demo?ip=${ip}&vin=${vin}&displayId=${displayId}&vehicleType=${vehicleType}`,
                                                    );
                                                }
                                            }}
                                        >
                                            进入控屏
                                        </div>
                                    </div>
                                </div>
                            );
                        });

                        const oldItemList = (
                            <div
                                key="old-items"
                                className={styles["latest-item"]}
                            >
                                <div className={styles["device-list-sub-head"]}>
                                    历史设备
                                </div>
                                {(() => {
                                    if (oldItems.length === 0) {
                                        return (
                                            <div key="no-item">
                                                <Empty description="暂无车辆"></Empty>
                                            </div>
                                        );
                                    }
                                    return oldItems;
                                })()}
                            </div>
                        );

                        return [firstItem, oldItemList];
                    })()}
                </div>
            </div>
        </>
    );
}

export default observer(index);
