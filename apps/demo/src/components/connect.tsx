import {
    DefaultButton,
    Dialog,
    Dropdown,
    IDropdownOption,
    PrimaryButton,
    ProgressIndicator,
    Stack,
    StackItem,
} from "@fluentui/react";
import {
    Adb,
    AdbDaemonDevice,
    AdbDaemonTransport,
    AdbPacketData,
    AdbPacketInit,
} from "@yume-chan/adb";
// import AdbWebCredentialStore from "@yume-chan/adb-credential-web";
import AdbDaemonDirectSocketsDevice from "@yume-chan/adb-daemon-direct-sockets";
import {
    AdbDaemonWebUsbDeviceManager,
    AdbDaemonWebUsbDeviceWatcher,
} from "@yume-chan/adb-daemon-webusb";
import AdbDaemonWebSocketDevice from "@yume-chan/adb-daemon-ws";
import {
    Consumable,
    InspectStream,
    ReadableStream,
    WritableStream,
    pipeFrom,
} from "@yume-chan/stream-extra";
import { observer } from "mobx-react-lite";
import { useCallback, useEffect, useMemo, useState } from "react";
import { GLOBAL_STATE } from "../state";
import { CommonStackTokens, Icons } from "../utils";

const credentialArr = [
    48, 130, 4, 188, 2, 1, 0, 48, 13, 6, 9, 42, 134, 72, 134, 247, 13, 1, 1, 1,
    5, 0, 4, 130, 4, 166, 48, 130, 4, 162, 2, 1, 0, 2, 130, 1, 1, 0, 148, 32,
    53, 221, 176, 132, 125, 186, 235, 128, 168, 241, 117, 157, 57, 118, 171,
    247, 191, 212, 7, 11, 146, 37, 111, 128, 109, 206, 103, 240, 177, 140, 190,
    108, 156, 215, 209, 24, 28, 32, 252, 245, 27, 195, 57, 4, 143, 105, 66, 85,
    114, 209, 219, 233, 164, 45, 56, 120, 175, 226, 227, 11, 28, 217, 197, 137,
    81, 28, 204, 156, 90, 40, 145, 62, 147, 181, 237, 13, 254, 125, 37, 170,
    109, 33, 77, 25, 73, 145, 118, 31, 82, 113, 63, 66, 253, 23, 176, 115, 63,
    112, 238, 215, 245, 147, 199, 62, 207, 15, 219, 45, 36, 224, 218, 56, 151,
    98, 227, 80, 147, 221, 163, 42, 131, 98, 29, 25, 123, 125, 136, 67, 12, 216,
    2, 145, 6, 10, 75, 245, 135, 241, 255, 120, 103, 79, 89, 41, 247, 235, 209,
    95, 108, 216, 48, 78, 96, 50, 115, 131, 238, 47, 66, 16, 55, 164, 33, 5,
    240, 173, 64, 151, 83, 36, 122, 164, 57, 155, 42, 126, 48, 219, 37, 67, 0,
    240, 140, 47, 36, 120, 199, 13, 203, 137, 42, 127, 140, 55, 29, 113, 42, 41,
    54, 238, 174, 249, 230, 224, 153, 153, 151, 76, 146, 107, 118, 54, 253, 43,
    64, 157, 216, 251, 15, 24, 169, 154, 85, 64, 122, 0, 175, 238, 187, 226, 16,
    228, 136, 198, 213, 106, 245, 160, 18, 217, 170, 116, 113, 218, 243, 79,
    142, 29, 239, 108, 57, 254, 175, 7, 2, 3, 1, 0, 1, 2, 130, 1, 0, 14, 122,
    99, 25, 118, 44, 181, 13, 191, 1, 169, 116, 225, 52, 151, 206, 147, 84, 63,
    107, 161, 22, 168, 87, 90, 46, 95, 77, 58, 190, 151, 13, 181, 45, 35, 143,
    7, 119, 71, 234, 247, 133, 0, 114, 251, 42, 111, 10, 112, 71, 226, 8, 222,
    29, 37, 56, 160, 76, 234, 195, 91, 41, 47, 52, 57, 137, 21, 87, 213, 199,
    150, 231, 250, 199, 247, 35, 22, 246, 167, 179, 85, 42, 12, 150, 110, 200,
    116, 16, 125, 104, 230, 35, 126, 245, 244, 88, 203, 79, 227, 166, 64, 125,
    91, 25, 215, 242, 109, 44, 33, 226, 116, 210, 108, 75, 143, 242, 221, 141,
    67, 200, 69, 150, 54, 125, 126, 111, 164, 125, 132, 88, 34, 120, 43, 70, 62,
    146, 129, 39, 207, 154, 57, 121, 218, 20, 69, 155, 28, 29, 238, 174, 214,
    246, 104, 228, 144, 139, 87, 16, 61, 132, 2, 25, 175, 202, 22, 58, 235, 27,
    9, 232, 146, 126, 108, 16, 8, 229, 212, 152, 76, 123, 95, 56, 208, 179, 50,
    75, 28, 152, 93, 211, 193, 3, 198, 118, 143, 13, 250, 106, 224, 12, 240,
    222, 195, 106, 213, 96, 33, 192, 64, 141, 163, 229, 103, 181, 64, 138, 206,
    206, 204, 92, 75, 121, 218, 179, 146, 147, 147, 80, 87, 16, 139, 36, 246,
    127, 90, 202, 76, 82, 201, 45, 232, 189, 130, 4, 199, 116, 44, 21, 214, 230,
    181, 253, 218, 233, 219, 73, 2, 129, 129, 0, 209, 94, 16, 120, 4, 195, 47,
    190, 253, 30, 171, 80, 48, 190, 139, 166, 149, 173, 56, 157, 111, 148, 108,
    82, 38, 20, 105, 184, 236, 249, 103, 96, 251, 20, 155, 112, 206, 190, 112,
    220, 34, 32, 64, 69, 70, 147, 179, 209, 27, 16, 178, 123, 88, 29, 170, 167,
    95, 19, 128, 97, 85, 139, 244, 84, 131, 192, 92, 208, 22, 226, 61, 106, 14,
    9, 69, 160, 150, 77, 211, 34, 198, 198, 3, 45, 68, 234, 62, 224, 207, 170,
    37, 75, 73, 54, 55, 66, 109, 29, 60, 218, 212, 180, 142, 163, 101, 230, 251,
    31, 182, 226, 71, 42, 173, 107, 236, 167, 158, 162, 213, 36, 196, 50, 184,
    216, 185, 150, 2, 217, 2, 129, 129, 0, 181, 30, 52, 210, 15, 97, 62, 114,
    140, 67, 148, 37, 174, 212, 211, 235, 210, 12, 11, 247, 220, 241, 197, 10,
    231, 69, 68, 105, 193, 90, 128, 143, 183, 99, 14, 245, 150, 109, 40, 4, 75,
    255, 3, 54, 204, 146, 8, 105, 13, 11, 111, 20, 189, 115, 204, 93, 61, 20,
    215, 239, 44, 162, 189, 221, 248, 45, 75, 93, 51, 17, 138, 175, 119, 3, 175,
    95, 232, 190, 66, 108, 31, 184, 42, 86, 200, 82, 175, 28, 34, 238, 230, 66,
    2, 96, 112, 120, 211, 139, 203, 75, 241, 123, 237, 2, 126, 239, 221, 179,
    12, 80, 149, 85, 73, 187, 143, 206, 58, 154, 230, 121, 237, 66, 229, 55,
    206, 155, 84, 223, 2, 129, 128, 1, 159, 117, 9, 57, 32, 58, 50, 132, 203,
    196, 16, 47, 16, 139, 12, 147, 132, 112, 55, 232, 49, 130, 85, 112, 174, 31,
    211, 171, 34, 147, 198, 144, 171, 172, 56, 199, 161, 122, 70, 122, 141, 61,
    114, 76, 5, 193, 19, 17, 222, 163, 67, 137, 127, 81, 95, 82, 193, 87, 241,
    105, 52, 88, 132, 127, 48, 242, 135, 58, 102, 46, 139, 175, 232, 42, 126, 0,
    44, 66, 66, 182, 191, 186, 46, 147, 166, 45, 46, 152, 237, 124, 180, 132,
    176, 194, 228, 228, 235, 161, 25, 33, 36, 245, 38, 23, 24, 31, 66, 51, 172,
    181, 88, 131, 87, 158, 209, 253, 204, 205, 82, 39, 163, 45, 3, 161, 12, 164,
    161, 2, 129, 128, 25, 171, 203, 94, 206, 177, 64, 209, 169, 145, 214, 136,
    180, 204, 19, 177, 132, 23, 19, 7, 49, 184, 206, 237, 233, 179, 198, 171,
    154, 173, 66, 53, 156, 143, 156, 202, 48, 101, 14, 91, 245, 141, 146, 158,
    12, 198, 210, 12, 89, 189, 250, 35, 157, 106, 177, 87, 177, 213, 167, 121,
    142, 1, 15, 26, 76, 23, 215, 107, 193, 86, 70, 42, 242, 154, 130, 27, 252,
    248, 34, 160, 2, 170, 238, 205, 88, 29, 104, 22, 123, 217, 18, 167, 222,
    128, 94, 208, 177, 99, 74, 16, 92, 140, 237, 30, 2, 113, 235, 33, 122, 168,
    93, 82, 54, 94, 48, 86, 209, 181, 172, 223, 49, 66, 223, 12, 86, 235, 107,
    79, 2, 129, 128, 59, 11, 250, 227, 50, 174, 57, 75, 130, 203, 64, 118, 134,
    225, 96, 111, 36, 64, 201, 15, 114, 32, 191, 118, 21, 113, 131, 92, 61, 106,
    169, 199, 26, 74, 155, 0, 235, 229, 99, 35, 213, 251, 24, 71, 69, 47, 32,
    64, 217, 118, 26, 58, 198, 124, 139, 212, 196, 10, 254, 103, 36, 226, 156,
    149, 97, 194, 89, 108, 106, 40, 166, 44, 163, 102, 35, 209, 25, 98, 238,
    181, 166, 30, 209, 65, 165, 213, 29, 82, 245, 82, 78, 249, 13, 56, 44, 227,
    101, 83, 90, 14, 71, 40, 97, 26, 7, 92, 17, 196, 227, 123, 112, 221, 111,
    46, 110, 192, 37, 213, 44, 127, 254, 219, 74, 231, 70, 104, 107, 24,
];

const DropdownStyles = { dropdown: { width: "100%" } };

// const CredentialStore = new AdbWebCredentialStore();

var c = {
    buffer: new Uint8Array(credentialArr),
    name: `wxq@${location.hostname}`,
};
console.log(`c.name:`, c.name);
const CredentialStore = {
    generateKey: c,
    async *iterateKeys() {
        yield c;
    },
};

function ConnectCore(): JSX.Element | null {
    const [selected, setSelected] = useState<AdbDaemonDevice | undefined>();
    const [connecting, setConnecting] = useState(false);

    const [usbSupported, setUsbSupported] = useState(true);
    const [usbDeviceList, setUsbDeviceList] = useState<AdbDaemonDevice[]>([]);
    const updateUsbDeviceList = useCallback(async () => {
        const devices: AdbDaemonDevice[] =
            await AdbDaemonWebUsbDeviceManager.BROWSER!.getDevices();
        setUsbDeviceList(devices);
        return devices;
    }, []);

    useEffect(
        () => {
            // Only run on client
            const supported = !!AdbDaemonWebUsbDeviceManager.BROWSER;
            setUsbSupported(supported);

            if (!supported) {
                // GLOBAL_STATE.showErrorDialog(
                //     "Your browser does not support WebUSB standard, which is required for this site to work.\n\nLatest version of Google Chrome, Microsoft Edge, or other Chromium-based browsers are required."
                // );
                return;
            }

            updateUsbDeviceList();

            const watcher = new AdbDaemonWebUsbDeviceWatcher(
                async (serial?: string) => {
                    const list = await updateUsbDeviceList();

                    if (serial) {
                        setSelected(
                            list.find((device) => device.serial === serial),
                        );
                        return;
                    }
                },
                globalThis.navigator.usb,
            );

            return () => watcher.dispose();
        },
        /* eslint-disable-next-line react-hooks/exhaustive-deps */
        [],
    );

    const [webSocketDeviceList, setWebSocketDeviceList] = useState<
        AdbDaemonWebSocketDevice[]
    >([]);
    useEffect(() => {
        const savedList = localStorage.getItem("ws-backend-list");
        if (!savedList) {
            return;
        }

        const parsed = JSON.parse(savedList) as { address: string }[];
        setWebSocketDeviceList(
            parsed.map((x) => new AdbDaemonWebSocketDevice(x.address)),
        );
    }, []);

    const addWebSocketDevice = useCallback(() => {
        const address = window.prompt("Enter the address of WebSockify server");
        if (!address) {
            return;
        }
        setWebSocketDeviceList((list) => {
            const copy = list.slice();
            copy.push(new AdbDaemonWebSocketDevice(address));
            globalThis.localStorage.setItem(
                "ws-backend-list",
                JSON.stringify(copy.map((x) => ({ address: x.serial }))),
            );
            return copy;
        });
    }, []);

    const [tcpDeviceList, setTcpDeviceList] = useState<
        AdbDaemonDirectSocketsDevice[]
    >([]);
    useEffect(() => {
        if (!AdbDaemonDirectSocketsDevice.isSupported()) {
            return;
        }

        const savedList = localStorage.getItem("tcp-backend-list");
        if (!savedList) {
            return;
        }

        const parsed = JSON.parse(savedList) as {
            address: string;
            port: number;
        }[];
        setTcpDeviceList(
            parsed.map(
                (x) => new AdbDaemonDirectSocketsDevice(x.address, x.port),
            ),
        );
    }, []);

    const addTcpDevice = useCallback(() => {
        const host = window.prompt("Enter the address of device");
        if (!host) {
            return;
        }

        const port = window.prompt("Enter the port of device", "5555");
        if (!port) {
            return;
        }

        const portNumber = Number.parseInt(port, 10);

        setTcpDeviceList((list) => {
            const copy = list.slice();
            copy.push(new AdbDaemonDirectSocketsDevice(host, portNumber));
            globalThis.localStorage.setItem(
                "tcp-backend-list",
                JSON.stringify(
                    copy.map((x) => ({
                        address: x.host,
                        port: x.port,
                    })),
                ),
            );
            return copy;
        });
    }, []);

    const handleSelectedChange = (
        e: React.FormEvent<HTMLDivElement>,
        option?: IDropdownOption,
    ) => {
        console.log(option);
        setSelected(option?.data as AdbDaemonDevice);
    };

    const addUsbDevice = useCallback(async () => {
        const device =
            await AdbDaemonWebUsbDeviceManager.BROWSER!.requestDevice();
        setSelected(device);
        await updateUsbDeviceList();
    }, [updateUsbDeviceList]);

    const connect = useCallback(async () => {
        if (!selected) {
            return;
        }

        setConnecting(true);

        let readable: ReadableStream<AdbPacketData>;
        let writable: WritableStream<Consumable<AdbPacketInit>>;
        try {
            const streams = await selected.connect();

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
            GLOBAL_STATE.showErrorDialog(e);
            setConnecting(false);
            return;
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
        }

        try {
            const device = new Adb(
                await AdbDaemonTransport.authenticate({
                    serial: selected.serial,
                    connection: { readable, writable },
                    credentialStore: CredentialStore as any,
                }),
            );

            device.disconnected.then(
                async () => {
                    await dispose();
                },
                async (e) => {
                    GLOBAL_STATE.showErrorDialog(e);
                    await dispose();
                },
            );

            GLOBAL_STATE.setDevice(selected, device);
        } catch (e: any) {
            GLOBAL_STATE.showErrorDialog(e);
            await dispose();
        } finally {
            setConnecting(false);
        }
    }, [selected]);

    const disconnect = useCallback(async () => {
        try {
            await GLOBAL_STATE.adb!.close();
        } catch (e: any) {
            GLOBAL_STATE.showErrorDialog(e);
        }
    }, []);

    const deviceList = useMemo(
        () =>
            ([] as AdbDaemonDevice[]).concat(
                usbDeviceList,
                webSocketDeviceList,
                tcpDeviceList,
            ),
        [usbDeviceList, webSocketDeviceList, tcpDeviceList],
    );

    const deviceOptions = useMemo(() => {
        return deviceList.map((device) => ({
            key: device.serial,
            text: `${device.serial} ${device.name ? `(${device.name})` : ""}`,
            data: device,
        }));
    }, [deviceList]);

    useEffect(() => {
        setSelected((old) => {
            if (old) {
                const current = deviceList.find(
                    (device) => device.serial === old.serial,
                );
                if (current) {
                    return current;
                }
            }

            return deviceList.length ? deviceList[0] : undefined;
        });
    }, [deviceList]);

    const addMenuProps = useMemo(() => {
        const items = [];

        if (usbSupported) {
            items.push({
                key: "usb",
                text: "USB",
                onClick: addUsbDevice,
            });
        }

        items.push({
            key: "websocket",
            text: "WebSocket",
            onClick: addWebSocketDevice,
        });

        if (AdbDaemonDirectSocketsDevice.isSupported()) {
            items.push({
                key: "direct-sockets",
                text: "Direct Sockets TCP",
                onClick: addTcpDevice,
            });
        }

        return {
            items,
        };
    }, [usbSupported, addUsbDevice, addWebSocketDevice, addTcpDevice]);

    return (
        <Stack tokens={{ childrenGap: 8, padding: "0 0 8px 8px" }}>
            <Dropdown
                disabled={!!GLOBAL_STATE.adb || deviceOptions.length === 0}
                label="Available devices"
                placeholder="No available devices"
                options={deviceOptions}
                styles={DropdownStyles}
                dropdownWidth={300}
                selectedKey={selected?.serial}
                onChange={handleSelectedChange}
            />

            {!GLOBAL_STATE.adb ? (
                <Stack horizontal tokens={CommonStackTokens}>
                    <StackItem grow shrink>
                        <PrimaryButton
                            iconProps={{ iconName: Icons.PlugConnected }}
                            text="Connect"
                            disabled={!selected && false}
                            primary={!!selected}
                            styles={{ root: { width: "100%" } }}
                            onClick={connect}
                        />
                    </StackItem>
                    <StackItem grow shrink>
                        <DefaultButton
                            iconProps={{ iconName: Icons.AddCircle }}
                            text="Add"
                            split
                            splitButtonAriaLabel="Add other connection type"
                            menuProps={addMenuProps}
                            disabled={!usbSupported && false}
                            primary={!selected}
                            styles={{ root: { width: "100%" } }}
                            onClick={addUsbDevice}
                        />
                    </StackItem>
                </Stack>
            ) : (
                <DefaultButton
                    iconProps={{ iconName: Icons.PlugDisconnected }}
                    text="Disconnect"
                    onClick={disconnect}
                />
            )}

            <Dialog
                hidden={!connecting}
                dialogContentProps={{
                    title: "Connecting...",
                    subText: "Please authorize the connection on your device",
                }}
            >
                <ProgressIndicator />
            </Dialog>
        </Stack>
    );
}

export const Connect = observer(ConnectCore);
