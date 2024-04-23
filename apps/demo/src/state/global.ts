import { Adb, AdbDaemonDevice, AdbPacketData } from "@yume-chan/adb";
import { action, makeAutoObservable, observable } from "mobx";
// import { DevicesItemType } from "../components/vehicle/devices-list";
import { DevicesItemType } from "@/utils/utils";
import { DEVICES_LIST } from "../constant";
import { getItem, setItem } from "../utils/localStorage";

export type PacketLogItemDirection = "in" | "out";

export interface PacketLogItem extends AdbPacketData {
    direction: PacketLogItemDirection;

    timestamp?: Date;
    commandString?: string;
    arg0String?: string;
    arg1String?: string;
    payloadString?: string;
}

export class GlobalState {
    device: AdbDaemonDevice | undefined = undefined;
    adb: Adb | undefined = undefined;

    errorDialogVisible = true;
    errorDialogMessage = "";

    logs: PacketLogItem[] = [];

    carList: DevicesItemType[] = getItem(DEVICES_LIST) || [];
    currentCar?: DevicesItemType;
    lock: boolean = false;

    constructor() {
        makeAutoObservable(this, {
            hideErrorDialog: action.bound,
            logs: observable.shallow,
            carList: observable,
            removeCarItem: action.bound,
        });
    }

    setDevice(device: AdbDaemonDevice | undefined, adb: Adb | undefined) {
        this.device = device;
        this.adb = adb;
    }

    showErrorDialog(message: Error | string) {
        this.errorDialogVisible = true;
        if (message instanceof Error) {
            this.errorDialogMessage = message.stack || message.message;
        } else {
            this.errorDialogMessage = message;
        }
    }

    /**
     * 设置当前车辆
     * @param car 当前车辆
     */
    setCurrentCar(car: DevicesItemType) {
        this.currentCar = car;
    }

    addCarListItem(car: DevicesItemType) {
        const existIdx = this.carList.findIndex((item) => item.vin === car.vin);
        const exist = this.carList.find((item) => item.vin === car.vin);
        if (exist) {
            // Object.assign(exist, car);
            this.carList.splice(existIdx, 1);
        }
        this.carList.push(car);
        // this.carList = carList;
        // setItem("devicesList", carList);
    }

    /**
     * 删除车辆
     * @param vin 车辆VIN
     */
    removeCarItem(vin: string) {
        let inx = this.carList.findIndex((item) => item.vin === vin);
        if (inx > -1) {
            this.carList.splice(inx, 1);
        }
        setItem(DEVICES_LIST, this.carList);
    }

    /**
     * 更改车辆名称
     * @param car 车辆
     */
    updateCarName(car: DevicesItemType, name: string) {
        const item = this.carList.find((item) => item.vin === car.vin);
        if (!item) {
            return;
        } else {
            item.name = name;
        }
    }

    /**
     * 打开错误弹窗
     */
    hideErrorDialog() {
        this.errorDialogVisible = false;
    }

    appendLog(direction: PacketLogItemDirection, packet: AdbPacketData) {
        this.logs.push({
            ...packet,
            direction,
            timestamp: new Date(),
            payload: packet.payload.slice(),
        } as PacketLogItem);
    }

    clearLog() {
        this.logs.length = 0;
    }

    setLock(lock: boolean) {
        this.lock = lock;
    }
}

export const GLOBAL_STATE = new GlobalState();
