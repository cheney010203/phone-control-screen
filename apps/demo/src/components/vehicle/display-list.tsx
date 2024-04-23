import styles from "@/styles/modules/display-list.module.scss";
import { GLOBAL_STATE } from "../../state";
import { STATE } from "../scrcpy";
import { DevicesItemTypeDisplayItem } from "./devices-list";

type Props = {
    onClose: () => void;
};

export default function DisplayList(props: Props) {
    function selectDisplay(item: DevicesItemTypeDisplayItem) {
        if (GLOBAL_STATE.currentCar?.displayId !== item.displayId) {
            STATE.stop();
            STATE.start();
        }
        console.log(GLOBAL_STATE.currentCar, item.displayId);
        props.onClose?.();
    }
    return (
        <section
            className={styles["list-pane-mask"]}
            onClick={() => {
                props.onClose?.();
            }}
        >
            <div className={styles["list-pane"]}>
                {GLOBAL_STATE?.currentCar?.displayList.map((item) => (
                    <div
                        className={styles["item-pane"]}
                        key={item.displayId}
                        onClick={(e) => {
                            e.stopPropagation();
                            selectDisplay(item);
                        }}
                    >
                        {item.name || "中控屏"}
                    </div>
                ))}
            </div>
        </section>
    );
}
