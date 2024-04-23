// 定义Base64解码函数
// Base64 编码
export function base64Encode(input: string) {
    return window.btoa(decodeURIComponent(input));
}

// Base64 解码
export function base64Decode(input: string) {
    return decodeURIComponent(encodeURIComponent(window.atob(input)));
}
export function getSearchParams(key: string) {
    const searchObj = new URLSearchParams(location.search);
    return searchObj.get(key);
}

/**
 * 生成62进制哈希
 * @param number 长度
 * @returns
 */
export function hash52(number: number) {
    let res = "G";
    for (let i = res.length; i < number; i++) {
        let r = Math.floor(Math.random() * 36).toString(36);
        if (isNaN(+r)) {
            r = Math.random() > 0.5 ? r.toUpperCase() : r;
        }
        res += r;
    }

    return res;
}
export type DevicesItemTypeDisplayItem = {
    name: string;
    displayId: string | number;
};

export interface DevicesItemType {
    // 名称
    name: string;
    // 设备ip
    ip: string | number;
    // 设备adb启动端口
    port: string | number;
    // 屏幕target列表
    displayList: DevicesItemTypeDisplayItem[];
    displayId: string | number;
    vin: string;
    // 车辆类型
    vehicleType: string;
    para?: string;
}

export async function getDeviceItem(url: string): Promise<DevicesItemType> {
    let urlObj: URL | null = null;
    try {
        urlObj = new URL(url);
    } catch (error) {
        console.log(error);
        return Promise.reject("url分析出错");
    }
    let search = Object.fromEntries(
        new URLSearchParams(urlObj.search).entries(),
    );
    const { para } = search;
    if (para) {
        const paraDeoceStr = decodeURIComponent(base64Decode(para));
        search = Object.fromEntries(
            new URLSearchParams(paraDeoceStr).entries(),
        );
    }
    const { vin, vehicleType } = search;
    if (!search.ip && !vin) {
        return Promise.reject("url分析出错");
    }

    const displayId = search.displayid || search.displayId || 0;
    const name = `车辆：${vin}`;
    return {
        name,
        ip: search.ip,
        port: search.port,
        displayList: [
            {
                displayId,
                name,
            },
        ],
        para,
        displayId,
        vin,
        vehicleType,
    };
}

export const vehicleMap: any = {
    "": "领克09",
    undefined: "领克09",
    ex11a3: "领克09",
};
