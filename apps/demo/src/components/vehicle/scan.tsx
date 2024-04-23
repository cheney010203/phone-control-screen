"use client";
import { CameraOutline } from "antd-mobile-icons";
import jsQr from "jsqr";
import { useRouter } from "next/router";
import { useEffect, useRef, useState } from "react";
import { usePageJump } from "../../hooks";
import { GLOBAL_STATE } from "../../state";
import { getDeviceItem } from "../../utils/utils";

type Props = {
    [key: string]: any;
};

export default function Scan(props: Props) {
    const [canvas, setCanvas] = useState<any>(null);
    const [fileRef, setFileRef] = useState<any>();
    const timer = useRef<any>(null);
    const router = useRouter();
    const { goScrcpy } = usePageJump();
    const scanSuccess = async (url: string) => {
        const item = await getDeviceItem(url);

        GLOBAL_STATE.addCarListItem(item);

        GLOBAL_STATE.setCurrentCar(item);
        goScrcpy();
    };

    /**
     * 打开摄像头,并用vide承接stream
     * :: TODO 非Https localhost 不支持
    //  */
    // async function openCamera() {
    //     const stream = await navigator.mediaDevices
    //         ?.getUserMedia({
    //             video: {
    //                 width: 640,
    //                 height: 480,
    //             },
    //         })
    //         .catch((e) => {
    //             return Promise.reject(e);
    //         });

    //     const video = document.createElement("video");
    //     console.log(2332, stream);
    //     if ("srcObject" in video) {
    //         video.srcObject = stream;
    //         video.onloadedmetadata = function (e) {
    //             video.play();
    //             getImageData(video, stream);
    //         };
    //     } else {
    //         // :: todo 不支持 video
    //     }
    // }

    // /**
    //  * 在canvas上绘制摄像头内容，并扫描
    //  * @param video
    //  * @param stream
    //  */
    // function getImageData(video: HTMLVideoElement, stream: MediaStream) {
    //     const context = canvas.getContext("2d");
    //     const vW = video.videoWidth;
    //     const vH = video.videoHeight;
    //     const width = window.innerWidth;
    //     const height = window.innerHeight;
    //     const videoRatio = vW / vH;
    //     const ratio = width / height;
    //     canvas.width = width;
    //     canvas.height = height;
    //     let w = 0;
    //     let h = 0;
    //     if (videoRatio > ratio) {
    //         w = width;
    //         h = width / videoRatio;
    //     } else {
    //         h = height;
    //         w = h * videoRatio;
    //     }
    //     timer.current = setInterval(() => {
    //         const x = (width - w) / 2;
    //         const y = (height - h) / 2;
    //         context.drawImage(video, x, y, w, h);
    //         const imageData = context.getImageData(x, y, w, h);
    //         const code = jsQr(
    //             imageData.data,
    //             imageData.width,
    //             imageData?.height,
    //         );
    //         if (code?.data) {
    //             clearInterval(timer.current);
    //             stream.getTracks?.()?.[0]?.stop();
    //             setShowCameras(false);
    //             scanSuccess(code.data);
    //         }
    //     }, 100);
    // }

    // /**
    //  * 在canvas上绘制摄像头内容，并扫描
    //  * @param video
    //  * @param stream
    //  */
    function getImageData(video: HTMLImageElement) {
        const context = canvas.getContext("2d");
        const vW = video.width;
        const vH = video.height;
        const width = window.innerWidth;
        const height = window.innerHeight;
        const videoRatio = vW / vH;
        const ratio = width / height;
        canvas.width = width;
        canvas.height = height;
        let w = 0;
        let h = 0;
        if (videoRatio > ratio) {
            w = width;
            h = width / videoRatio;
        } else {
            h = height;
            w = h * videoRatio;
        }
        const x = (width - w) / 2;
        const y = (height - h) / 2;
        context.drawImage(video, x, y, w, h);
        const imageData = context.getImageData(x, y, w, h);
        const code = jsQr(imageData.data, imageData.width, imageData?.height);
        if (code?.data) {
            console.log(code);
            scanSuccess(code.data);
        } else {
            console.log("未识别到二维码");
        }
        fileRef.value = null;
    }

    /**
     * 当canvas打开时
     */
    useEffect(() => {
        console.log(canvas);
        if (!canvas) return;
        // openCamera();
        return () => {
            clearInterval(timer.current);
        };
    }, [canvas]);

    useEffect(() => {
        console.log(router);
        const query = router.query;
        if (query.ip && query.port && query.vin) {
            scanSuccess(location.href);
        }
    }, []);

    const scanHandle = () => {
        // try {
        //     wx.scanQRCode({
        //         needResult: 1,
        //         scanType: ["qrCode"],
        //         success(res) {
        //             console.log(res.resultStr);
        //         },
        //     });
        // } catch {
        fileRef.click();
        // }
    };

    return (
        <section>
            <div className="panel flex-core flex-col" onClick={scanHandle}>
                <CameraOutline
                    style={{
                        fontSize: "40px",
                    }}
                />
                {/* <div className="fc-sec mt-l">添加新设备</div> */}
                <div className="fc-warning mt-xxs fs-xs">
                    拍照后使用照片，识别成功即完成设备添加
                </div>
            </div>
            <input
                type="file"
                ref={setFileRef}
                accept="image/*"
                style={{
                    display: "none",
                }}
                onChange={(...arg) => {
                    const url = URL.createObjectURL(fileRef!.files[0]);
                    const image = document.createElement("img");
                    console.log(arg, url, image);
                    image.src = url;
                    image.addEventListener("load", function () {
                        console.log(this, this.width, this.height);
                        getImageData(this);
                    });
                }}
                // capture={true}
            />
            {/* <iframe src="/test" frameborder="0"></iframe> */}
            <canvas
                ref={setCanvas}
                style={{
                    position: "fixed",
                    top: "0",
                    left: "0",
                    width: "100vw",
                    height: "100vh",
                    background: "#000",
                    display: "none",
                }}
            ></canvas>
        </section>
    );
}
