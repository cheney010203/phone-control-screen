type Props = {
    [key: string]: any;
};
import { SpinLoading } from "antd-mobile";

export default function ScrcpyLoading(props: Props) {
    return (
        <section
            className="flex-core flex-col"
            style={{
                position: "fixed",
                top: 0,
                left: 0,
                zIndex: 99,
                width: "100%",
                height: "100%",
                color: "#fff",
                background: "#000",
            }}
        >
            <SpinLoading className="fs-xxxl" color="primary"></SpinLoading>
            <div className="mt-xxxl">正在连接中...</div>
        </section>
    );
}
