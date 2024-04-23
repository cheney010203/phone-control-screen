import styles from "@/styles/modules/scrcpy-commander.module.scss";
import { AndroidKeyCode, AndroidKeyEventAction } from "@yume-chan/scrcpy";
import { BsCircleFill, BsTriangleFill, BsUnion } from "react-icons/bs";
import { STATE } from "../scrcpy";

type Props = {
    [key: string]: any;
};

export default function ScrcpyCommander(props: Props) {
    const back = {
        pointerDown: () => {
            STATE.client!.controlMessageWriter!.backOrScreenOn(
                AndroidKeyEventAction.Down,
            );
        },
        pointerUp: () => {
            STATE.client!.controlMessageWriter!.backOrScreenOn(
                AndroidKeyEventAction.Up,
            );
        },
    };
    const home = {
        pointerDown: () => {
            STATE.client!.controlMessageWriter!.injectKeyCode({
                action: AndroidKeyEventAction.Down,
                keyCode: AndroidKeyCode.AndroidHome,
                repeat: 0,
                metaState: 0,
            });
        },
        pointerUp() {
            STATE.client!.controlMessageWriter!.injectKeyCode({
                action: AndroidKeyEventAction.Up,
                keyCode: AndroidKeyCode.AndroidHome,
                repeat: 0,
                metaState: 0,
            });
        },
    };

    const multiPor = {
        pointerDown() {
            STATE.client!.controlMessageWriter!.injectKeyCode({
                action: AndroidKeyEventAction.Down,
                keyCode: AndroidKeyCode.AndroidAppSwitch,
                repeat: 0,
                metaState: 0,
            });
        },
        pointerUp() {
            STATE.client!.controlMessageWriter!.injectKeyCode({
                action: AndroidKeyEventAction.Up,
                keyCode: AndroidKeyCode.AndroidAppSwitch,
                repeat: 0,
                metaState: 0,
            });
        },
    };
    return (
        <section className={styles["commander-pane"]}>
            <ul className={styles["command-list"]}>
                <li className={styles["command-item"]}>
                    <div
                        className={`${styles["useful-pane"]} rotate--90`}
                        onPointerDown={back.pointerDown}
                        onPointerUp={back.pointerUp}
                    >
                        <BsTriangleFill />
                    </div>
                </li>
                <li className={styles["command-item"]}>
                    <div
                        className={`${styles["useful-pane"]}`}
                        onPointerDown={home.pointerDown}
                        onPointerUp={home.pointerUp}
                    >
                        <BsCircleFill></BsCircleFill>
                    </div>
                </li>
                <li className={styles["command-item"]}>
                    <div
                        className={`${styles["useful-pane"]}`}
                        onPointerDown={multiPor.pointerDown}
                        onPointerUp={multiPor.pointerUp}
                    >
                        <BsUnion></BsUnion>
                    </div>
                </li>
            </ul>
        </section>
    );
}
