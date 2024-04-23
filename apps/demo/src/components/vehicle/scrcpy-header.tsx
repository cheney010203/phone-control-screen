import styles from "@/styles/modules/scrcpy-header.module.scss";
import { LeftOutline, UnorderedListOutline } from "antd-mobile-icons";
import { useCallback, useEffect, useRef, useState } from "react";
import { usePageJump } from "../../hooks";
import { GLOBAL_STATE } from "../../state";
import DisplayList from "./display-list";
import { STATE } from "../scrcpy";

type Props = {
    [key: string]: any;
};

export default function ScrcpyHeader(props: Props) {
    const [hidden, setHidden] = useState(false);
    const timer = useRef<any>();
    const [showList, setShowList] = useState(false);
    const { goDevices } = usePageJump();

    const setTimer = useCallback(() => {
        return setTimeout(() => {
            setHidden(true);
        }, 3000);
    }, []);

    const listHandle = () => {
        clearTimeout(timer.current);
        timer.current = setTimer();
        if (hidden) {
            setHidden(false);
        } else {
            setShowList(!showList);
            clearTimeout(timer.current);
        }
    };

    const back = () => {
        if (showList) {
            setShowList(false);
        } else {
            goDevices();
        }
    };

    useEffect(() => {
        timer.current = setTimer();
        return () => {
            clearTimeout(timer.current);
        };
    }, [setTimer]);

    useEffect(() => {
        clearTimeout(timer.current);

        if (!showList) {
            timer.current = setTimer();
        }
    }, [showList]);
    return (
        <>
            <section
                className={`${styles["header"]}  ${
                    hidden ? styles["hidden"] : ""
                }`}
            >
                <div className={styles["back-icon"]} onClick={back}>
                    <LeftOutline className="fs-m"></LeftOutline>
                </div>
                <div className={styles["header-icon"]} onClick={listHandle}>
                    <UnorderedListOutline></UnorderedListOutline>
                </div>
                <div className={`${styles["header-name"]} ml-m`}>
                    {GLOBAL_STATE.currentCar?.name}
                </div>
            </section>
            {showList && (
                <DisplayList
                    onClose={() => {
                        setShowList(false);
                    }}
                ></DisplayList>
            )}
        </>
    );
}
