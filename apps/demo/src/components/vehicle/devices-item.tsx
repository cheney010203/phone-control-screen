import styles from "@/styles/modules/devices-list.module.scss";
import { DevicesItemType } from "@/utils/utils";
import { Button } from "antd-mobile";
import { DeleteOutline } from "antd-mobile-icons";
import { usePageJump } from "../../hooks";
import { GLOBAL_STATE } from "../../state";

type Props = {
    [key: string]: any;
    item: DevicesItemType;
    editCar: (car: DevicesItemType) => void;
    remove: (vin: string) => void;
};

export default function DevicesItem(props: Props) {
    // 页面跳转hooks
    const { goScrcpy, goSpecScrcpy } = usePageJump();

    const item: any = props.item;

    return (
        <div
            className={`${styles["devices-item-pane"]} panel`}
            onClick={() => {
                const { ip, vin, displayId } = item;
                GLOBAL_STATE.setCurrentCar(item);
                goSpecScrcpy(`ip=${ip}&vin=${vin}&displayId=${displayId}`);
            }}
        >
            <div className="bold">
                {item.name}
                {/* <span
                    className="fc-active p-xxs"
                    onClick={(e) => {
                        e.stopPropagation();
                        props.editCar(item);
                    }}
                >
                    <EditFill />
                </span> */}
            </div>
            {/* <div className="mt-s fc-info">{item.vin}</div> */}
            <div className="mt-s">
                <Button
                    size="small"
                    color="primary"
                    style={{ marginRight: 16 }}
                >
                    点击控屏
                </Button>
                <Button
                    size="small"
                    color="danger"
                    fill="outline"
                    onClick={(e) => {
                        e.stopPropagation();
                        props.remove(item.vin);
                    }}
                >
                    <DeleteOutline />
                    删除
                </Button>
            </div>
        </div>
    );
}
