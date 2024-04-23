"use client";
// import styles from "../../styles/modules/devices-list.module.scss";
import styles from "@/styles/modules/devices-list.module.scss";
import { DevicesItemType } from "@/utils/utils";
import { Dialog, Divider, Empty } from "antd-mobile";
import { observer } from "mobx-react-lite";
import { useEffect, useState } from "react";
import { GLOBAL_STATE } from "../../state";
import DevicesItem from "./devices-item";

type Props = {
    [key: string]: any;
};

export type DevicesItemTypeDisplayItem = {
    name: string;
    displayId: string | number;
};

// export interface DevicesItemType {
//     // 名称
//     name: string;
//     // 设备ip
//     ip: string | number;
//     // 设备adb启动端口
//     port: string | number;
//     // 屏幕target列表
//     displayList: DevicesItemTypeDisplayItem[];
//     displayId: string | number;
//     vin: string;
// }

export type DevicesList = DevicesItemType[];

function DevicesList(props: Props) {
    const list: DevicesList = GLOBAL_STATE.carList;
    // console.log(list.length, list);
    // list?.length && setItem(DEVICES_LIST, list);

    const [curCar, setCurCar] = useState<DevicesItemType>();
    const [visible, setVisible] = useState(false);
    // const [list, setList] = useState<DevicesItemType[]>([]);

    const remove = (vin: string) => {
        Dialog.confirm({
            content: "是否删除该设备？",
            onConfirm: async () => {
                GLOBAL_STATE.removeCarItem(vin);
            },
        });
    };
    useEffect(() => {
        console.log("设备列表", list);
    }, [list]);

    return (
        <section className={`container overflow-hidden flex flex-col`}>
            <div className="fs-xl bold text-align-center pt-xl pb-xl">掌握</div>
            <div className="divider"></div>
            <div
                className={`flex-auto overflow-y-auto p-m ${styles["devices-list-wrapper"]}`}
            >
                <div className="fs-l">设备列表</div>
                {(() => {
                    if (list.length === 0) {
                        return (
                            <div>
                                <Empty description="暂无车辆"></Empty>
                            </div>
                        );
                    }

                    const reverseList = [...list].reverse();
                    const firstItem = (
                        <div key={reverseList[0].vin}>
                            <div className={`${styles["fs-l-subTitle"]}`}>
                                最近连接设备
                            </div>
                            <DevicesItem
                                key={reverseList[0].vin}
                                item={reverseList[0]}
                                editCar={(car) => {
                                    setVisible(true);
                                    setCurCar(car);
                                }}
                                remove={remove}
                            ></DevicesItem>
                            <Divider />
                        </div>
                    );

                    const oldItems = reverseList.slice(1).map((item) => {
                        return (
                            <div
                                key={item.vin}
                                className={`${styles["fs-l-oldItem"]}`}
                            >
                                <DevicesItem
                                    key={item.vin}
                                    item={item}
                                    editCar={(car) => {
                                        setVisible(true);
                                        setCurCar(car);
                                    }}
                                    remove={remove}
                                ></DevicesItem>
                            </div>
                        );
                    });

                    const oldItemsWrap = (
                        <div>
                            <div className={`${styles["fs-l-subTitle"]}`}>
                                过往连接设备
                            </div>
                            {oldItems}
                        </div>
                    );

                    return [firstItem, oldItemsWrap];
                })()}

                {/* <div className="fs-l">添加新设备</div> */}
                {/* <Scan /> */}
            </div>
            {/* <UpdateCarNamePop
                visible={visible}
                car={curCar!}
                onClose={() => setVisible(false)}
            ></UpdateCarNamePop> */}
        </section>
    );
}

export default observer(DevicesList);
