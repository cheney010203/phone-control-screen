"use client";

import { DEVICES_LIST } from "@/constant";
import { setItem } from "@/utils/localStorage";
import { datafluxRum } from "@cloudcare/browser-rum";
import {
    Adb,
    AdbDaemonTransport,
    AdbPacketData,
    AdbPacketInit,
} from "@yume-chan/adb";
import AdbDaemonWebSocketDevice from "@yume-chan/adb-daemon-ws";
import {
    Consumable,
    InspectStream,
    ReadableStream,
    WritableStream,
    pipeFrom,
} from "@yume-chan/stream-extra";
import { Dialog } from "antd-mobile";
import { useEffect, useState } from "react";
import { STATE } from "../components/scrcpy";
import { usePageJump } from "../hooks";
import { GLOBAL_STATE } from "../state";
import { getDeviceItem } from "../utils/utils";

type Props = {
    [key: string]: any;
    connected: () => void;
};

const credentialArr = [
    48, 130, 4, 189, 2, 1, 0, 48, 13, 6, 9, 42, 134, 72, 134, 247, 13, 1, 1, 1,
    5, 0, 4, 130, 4, 167, 48, 130, 4, 163, 2, 1, 0, 2, 130, 1, 1, 0, 151, 50,
    231, 61, 248, 73, 82, 181, 69, 231, 246, 72, 233, 45, 98, 47, 140, 178, 87,
    119, 231, 183, 235, 14, 237, 141, 239, 105, 240, 194, 85, 210, 146, 228,
    235, 94, 26, 211, 245, 35, 44, 56, 65, 195, 175, 177, 51, 73, 151, 193, 107,
    198, 122, 55, 171, 181, 20, 206, 80, 184, 45, 143, 238, 219, 80, 107, 254,
    124, 72, 195, 53, 124, 251, 28, 112, 226, 195, 116, 211, 249, 204, 177, 74,
    135, 215, 67, 140, 212, 129, 193, 210, 165, 30, 99, 158, 176, 47, 82, 184,
    231, 216, 162, 67, 52, 124, 94, 135, 52, 141, 70, 93, 134, 164, 50, 144,
    200, 102, 138, 28, 2, 49, 214, 135, 207, 145, 221, 154, 114, 113, 190, 215,
    136, 202, 2, 32, 239, 180, 201, 182, 233, 231, 114, 121, 123, 217, 121, 96,
    218, 224, 71, 124, 20, 96, 12, 14, 199, 1, 12, 93, 152, 255, 59, 155, 151,
    140, 192, 22, 140, 253, 144, 224, 145, 140, 74, 206, 85, 15, 46, 38, 3, 22,
    55, 78, 241, 66, 189, 196, 76, 87, 53, 101, 57, 137, 148, 3, 186, 226, 39,
    2, 117, 57, 99, 164, 10, 119, 251, 205, 132, 255, 158, 84, 184, 185, 63,
    251, 71, 48, 209, 82, 156, 152, 80, 246, 198, 229, 144, 194, 209, 126, 96,
    85, 155, 183, 214, 184, 250, 25, 100, 60, 38, 73, 235, 195, 6, 216, 25, 178,
    144, 166, 181, 232, 191, 216, 15, 175, 255, 2, 3, 1, 0, 1, 2, 130, 1, 0, 70,
    245, 111, 203, 8, 140, 56, 209, 180, 38, 33, 210, 164, 4, 85, 145, 37, 65,
    201, 133, 15, 109, 164, 86, 84, 44, 137, 144, 185, 154, 42, 182, 241, 147,
    151, 214, 137, 86, 178, 52, 56, 155, 138, 89, 177, 73, 195, 93, 37, 104,
    116, 17, 40, 232, 153, 160, 25, 76, 158, 91, 97, 158, 172, 37, 167, 63, 151,
    166, 114, 107, 146, 221, 189, 231, 226, 30, 186, 70, 72, 249, 114, 20, 62,
    123, 52, 14, 146, 184, 100, 209, 54, 239, 161, 44, 117, 156, 16, 9, 141,
    151, 217, 118, 133, 125, 203, 100, 125, 165, 175, 43, 183, 214, 233, 150,
    133, 150, 87, 113, 55, 165, 220, 7, 231, 163, 5, 188, 239, 175, 79, 24, 34,
    18, 115, 133, 106, 131, 113, 64, 166, 99, 44, 29, 95, 163, 91, 103, 88, 143,
    207, 139, 25, 175, 246, 117, 26, 113, 227, 90, 33, 65, 90, 225, 251, 80,
    167, 147, 219, 123, 26, 96, 197, 248, 179, 202, 48, 137, 213, 115, 91, 255,
    108, 139, 190, 36, 215, 81, 202, 112, 107, 82, 179, 88, 90, 181, 80, 86,
    233, 64, 6, 115, 251, 218, 33, 70, 142, 213, 142, 233, 2, 36, 176, 68, 156,
    172, 139, 1, 169, 10, 210, 52, 220, 108, 48, 67, 45, 52, 169, 48, 121, 47,
    221, 114, 156, 75, 128, 130, 99, 2, 29, 231, 43, 130, 59, 156, 18, 133, 110,
    19, 214, 74, 116, 138, 98, 241, 55, 121, 2, 129, 129, 0, 210, 90, 24, 188,
    226, 82, 166, 179, 244, 200, 243, 34, 8, 45, 193, 150, 2, 18, 16, 138, 242,
    45, 59, 97, 241, 184, 139, 62, 255, 160, 29, 207, 133, 242, 240, 137, 90,
    147, 180, 224, 189, 115, 105, 97, 52, 118, 65, 220, 35, 12, 149, 98, 231,
    214, 143, 77, 64, 78, 23, 83, 199, 34, 246, 233, 16, 160, 36, 118, 168, 38,
    182, 201, 167, 146, 164, 95, 64, 187, 77, 109, 118, 20, 59, 169, 75, 154,
    229, 168, 15, 255, 224, 218, 116, 40, 33, 122, 126, 115, 226, 158, 99, 25,
    102, 150, 175, 251, 129, 110, 134, 138, 105, 44, 116, 180, 8, 92, 161, 54,
    66, 24, 153, 81, 112, 107, 155, 125, 251, 29, 2, 129, 129, 0, 184, 2, 156,
    179, 9, 210, 9, 26, 170, 179, 239, 112, 31, 167, 43, 34, 226, 92, 9, 50, 82,
    189, 139, 185, 7, 183, 71, 28, 201, 80, 181, 234, 106, 144, 193, 52, 241,
    31, 88, 196, 106, 8, 69, 130, 233, 140, 29, 214, 183, 196, 127, 144, 146, 8,
    16, 250, 192, 77, 98, 185, 172, 128, 224, 43, 29, 244, 231, 97, 62, 186,
    180, 245, 192, 177, 60, 99, 211, 109, 246, 226, 196, 92, 223, 186, 16, 159,
    77, 107, 91, 87, 248, 208, 164, 190, 242, 90, 33, 225, 128, 152, 212, 181,
    145, 243, 233, 106, 195, 43, 109, 66, 53, 29, 24, 102, 108, 3, 242, 104,
    140, 140, 176, 232, 229, 48, 224, 10, 208, 203, 2, 129, 128, 113, 165, 9,
    126, 106, 203, 250, 146, 120, 234, 100, 40, 251, 192, 52, 185, 101, 174,
    250, 207, 6, 158, 23, 90, 8, 45, 10, 213, 227, 103, 79, 19, 194, 43, 137,
    118, 187, 191, 215, 86, 32, 36, 141, 71, 93, 255, 145, 255, 107, 212, 45,
    149, 60, 233, 247, 139, 229, 245, 10, 183, 81, 123, 251, 103, 217, 122, 155,
    152, 155, 170, 38, 208, 245, 190, 205, 29, 69, 44, 172, 93, 58, 17, 30, 86,
    141, 169, 70, 240, 48, 140, 174, 159, 119, 104, 3, 6, 89, 241, 35, 251, 44,
    81, 25, 210, 201, 139, 24, 215, 108, 202, 180, 157, 183, 3, 89, 13, 42, 111,
    212, 239, 211, 77, 99, 110, 79, 152, 149, 165, 2, 129, 128, 125, 190, 131,
    56, 178, 0, 78, 234, 99, 54, 156, 236, 1, 37, 106, 139, 231, 37, 191, 191,
    28, 221, 156, 138, 175, 228, 37, 251, 92, 243, 3, 173, 146, 111, 35, 40,
    187, 145, 145, 70, 127, 178, 241, 85, 121, 165, 159, 138, 104, 128, 38, 48,
    52, 42, 192, 247, 169, 203, 248, 40, 43, 226, 209, 205, 133, 38, 35, 171,
    199, 131, 45, 64, 55, 18, 166, 211, 12, 219, 187, 119, 209, 122, 42, 4, 235,
    113, 1, 37, 217, 0, 239, 238, 28, 118, 196, 4, 165, 220, 132, 213, 107, 158,
    60, 131, 242, 193, 91, 103, 228, 188, 246, 176, 208, 72, 197, 141, 152, 236,
    171, 7, 69, 169, 145, 93, 105, 236, 218, 43, 2, 129, 129, 0, 202, 196, 199,
    66, 134, 252, 89, 190, 168, 251, 196, 168, 112, 184, 189, 180, 227, 21, 181,
    138, 63, 75, 121, 212, 213, 150, 255, 93, 6, 21, 150, 249, 1, 200, 49, 57,
    189, 14, 209, 145, 29, 190, 193, 12, 142, 248, 128, 156, 39, 164, 122, 96,
    65, 106, 34, 180, 100, 14, 26, 22, 185, 124, 61, 9, 65, 79, 83, 39, 189, 26,
    10, 223, 95, 165, 31, 39, 180, 116, 208, 227, 117, 13, 26, 170, 130, 127,
    213, 24, 167, 6, 127, 81, 4, 74, 123, 222, 81, 178, 184, 3, 218, 151, 147,
    83, 245, 192, 114, 174, 5, 146, 135, 17, 229, 113, 1, 241, 61, 137, 46, 74,
    48, 199, 1, 234, 176, 187, 212, 14,
];

const CredentialStore = {
    generateKey() {
        return {
            buffer: new Uint8Array(credentialArr),
            name: `asdasd@localhost`,
        };
    },
    *iterateKeys() {
        yield {
            buffer: new Uint8Array(credentialArr),
            name: `asdasd@localhost`,
        };
    },
};

export default function DemoStart(props: Props) {
    const [transport, setTransport] = useState<AdbDaemonWebSocketDevice>();

    const { goDevices } = usePageJump();

    // const router = useRouter();
    const getDevices = (ws: string) => {
        const device = new AdbDaemonWebSocketDevice(ws as string);
        setTransport(device);
    };

    const connect = async () => {
        if (!transport) {
            return;
        }
        let readable: ReadableStream<AdbPacketData>;
        let writable: WritableStream<Consumable<AdbPacketInit>>;
        try {
            const streams = await transport.connect();
            // Use `InspectStream`s to intercept and log packets
            readable = streams.readable.pipeThrough(
                new InspectStream((packet) => {
                    GLOBAL_STATE.appendLog("in", packet);
                }),
            );

            writable = pipeFrom(
                streams.writable,
                new InspectStream((packet: Consumable<AdbPacketInit>) => {
                    GLOBAL_STATE.appendLog("out", packet.value);
                }),
            );
        } catch (e: any) {
            console.error("transport.connect error", e);
            GLOBAL_STATE.showErrorDialog(e);
            return Promise.reject(e);
        }

        async function dispose() {
            // Adb won't close the streams,
            // so manually close them.
            try {
                readable.cancel();
            } catch {}
            try {
                await writable.close();
            } catch {}
            GLOBAL_STATE.setDevice(undefined, undefined);
            await Dialog.confirm({
                title: "与当前车辆失去连接，请检查网络后重试",
                confirmText: "关闭",
                cancelText: "重连",
                onCancel() {
                    location.reload();
                },
                onConfirm() {
                    goDevices();
                },
            });
        }

        try {
            const device = new Adb(
                await AdbDaemonTransport.authenticate({
                    serial: transport.serial,
                    connection: { readable, writable },
                    credentialStore: CredentialStore as any,
                }),
            );
            console.log("AdbDaemonTransport.authenticate 通过");

            device.disconnected.then(
                async () => {
                    console.log("device.disconnected resolve");
                    await dispose();
                },
                async (e: any) => {
                    console.log("device.disconnected reject");
                    GLOBAL_STATE.showErrorDialog(e);
                    await dispose();
                },
            );

            GLOBAL_STATE.setDevice(transport, device);
        } catch (e: any) {
            GLOBAL_STATE.showErrorDialog(e);
            await dispose();
            return Promise.reject(e);
        }
    };

    const start = async () => {
        console.log("demo-start start");
        let hasConnectErr = false;
        const connectTimer = setTimeout(() => {
            hasConnectErr = true;
            STATE.stop();
            Dialog.alert({
                title: "当前车辆连接超时，请检查后重试",
                confirmText: "好",
                onConfirm() {
                    goDevices();
                },
            });
        }, 7000);

        await connect().catch(async (e) => {
            console.log("demo-start connect error", e);
            STATE.stop();
            clearTimeout(connectTimer);
            if (!hasConnectErr) {
                await Dialog.alert({
                    title: "与当前车辆不在同一网络，请检查后重试",
                    confirmText: "好",
                });
                goDevices();
            }

            return Promise.reject(e);
        });

        clearTimeout(connectTimer);

        await STATE.start().catch(async (e) => {
            await Dialog.alert({
                title: "连接车辆失败，请重试",
            });
            goDevices();
            console.log(e);
            return Promise.reject(e);
        });
        props.connected();
        console.log("demo-start STATE", STATE);
    };

    useEffect(() => {
        console.log(transport);
        // connect();
        if (!transport) {
            return;
        }
        start();
    }, [transport]);

    useEffect(() => {
        getDeviceItem(location.href)
            .then((item: any) => {
                const { vin, ip, displayId, vehicleType } = item;
                datafluxRum &&
                    datafluxRum.addRumGlobalContext("device_car", {
                        vin,
                        ip,
                        displayId,
                        vehicleType,
                    });
                GLOBAL_STATE.addCarListItem(item);
                GLOBAL_STATE.setCurrentCar(item);

                setItem(DEVICES_LIST, GLOBAL_STATE.carList);

                STATE.setDisplayId(displayId);
                getDevices(`ws://${ip}:15555`);
            })
            .catch((e) => {
                console.log("getDeviceItem catch", e);

                if (!GLOBAL_STATE.currentCar) {
                    goDevices();
                } else {
                    getDevices(`ws://${GLOBAL_STATE.currentCar.ip}:15555`);
                }
            });
        return () => {
            STATE.stop();
        };
    }, []);

    return <section></section>;
}
