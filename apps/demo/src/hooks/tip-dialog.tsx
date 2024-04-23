"use client";
import { Dialog, Modal } from "antd-mobile";
import { InformationCircleFill } from "antd-mobile-icons";
import { useMemo } from "react";

export const useConnectionTips = () => {
    return useMemo(() => {
        return {
            open() {
                return Modal.show({
                    content: (
                        <div>
                            <div>小贴士</div>
                            <div>
                                <div>
                                    “掌控镜像”能将车机上的内容投射到手机/平板上，并支持用手机/平板直接控制车机，解放您的身体，解锁车机操控新体验。躺在座位上就能实现车机精准操控。手机/平板将成为您车内的拓展全能屏，增加额外屏幕的同时还可实现功能操控。
                                </div>
                                <div>方式一</div>
                                <ul>
                                    <li>
                                        确保手机/平板与车机处于同一个Wi-Fi网络。
                                    </li>
                                    <li>建议使用手机热点。 </li>
                                </ul>
                                <div>*此方式使用手机网络 [配图说明]</div>
                                <div>第二步</div>
                                <ul>
                                    <li>
                                        点击打开或语音唤起车机掌控功能二维码
                                    </li>
                                    <li>
                                        【配图：车机图标界面+二维码打开界面，红框标注图标和二维码提示用户】
                                    </li>
                                </ul>
                                <div>此方式使用手机网络 [配图说明]</div>
                                <div>第三步</div>
                                <ul>
                                    <li>
                                        打开手机/平板扫一扫功能，扫描车机掌控功能二维码，即可完成连接。
                                    </li>
                                    <li>
                                        【配图：打开手机侧扫一扫功能+连接成功后的手机界面，红框标注扫一扫和连接成功主界面】
                                    </li>
                                </ul>
                            </div>
                        </div>
                    ),
                    closeOnMaskClick: true,
                    onClose() {
                        console.log("close");
                    },
                });
            },
        };
    }, []);
};

export const useInitDialog = () => {
    const cTip = useConnectionTips();
    const res = useMemo(() => {
        return {
            open() {
                return Dialog.confirm({
                    cancelText: "了解详情",
                    content: (
                        <div className="flex-core flex-col">
                            <div className="flex-row align-items-center">
                                <InformationCircleFill className="fc-active flex-none fs-xxl" />
                                <div className="fs-l ml-l">
                                    请确保手机和车机在同一网络下，以访问车机屏幕
                                </div>
                            </div>
                            <div className="mt-xxxl">
                                为提升使用体验，建议横屏使用
                            </div>
                        </div>
                    ),
                    onConfirm: () => {
                        console.log("Confirmed");
                        // cTip.open();
                    },
                    onCancel() {
                        cTip.open();
                    },
                });
            },
        };
    }, []);
    return res;
};
