import { DevicesItemType } from "@/utils/utils";
import { Button, Input, Modal } from "antd-mobile";
import { useEffect, useState } from "react";
import { GLOBAL_STATE } from "../../state";

type Props = {
    [key: string]: any;
    car: DevicesItemType;
    visible: boolean;
    onClose: () => void;
};

export default function UpdateCarNamePop(props: Props) {
    const [curName, setCurName] = useState("");

    useEffect(() => {
        setCurName(props?.car?.name);
    }, [props.car]);
    return (
        <Modal
            visible={props.visible}
            title="修改设备名称"
            content={
                <>
                    <div className="flex flex-row align-items-center mt-l">
                        <Input
                            className="flex-auto"
                            value={curName}
                            onChange={(val) => setCurName(val)}
                            autoFocus
                        ></Input>
                    </div>
                    <div className="text-align-center mt-xxxl">
                        <Button
                            color="primary"
                            onClick={() => {
                                GLOBAL_STATE.updateCarName(props.car, curName);
                                // const list = getItem("devicesList") || [];
                                // const item = list.find(
                                //     (item: DevicesItemType) =>
                                //         item.vin === props?.car?.vin,
                                // );
                                // console.log(item, list);
                                // Object.assign(item, {
                                //     name: curName,
                                // });
                                // setItem("devicesList", list);
                                props.onClose();
                            }}
                            size="small"
                        >
                            确定
                        </Button>
                        <Button
                            className="ml-l"
                            onClick={() => {
                                props.onClose();
                            }}
                            size="small"
                        >
                            取消
                        </Button>
                    </div>
                </>
            }
        ></Modal>
    );
}
