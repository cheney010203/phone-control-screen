"use client";
export function getItem(key: string) {
    let res: any = localStorage.getItem(key);
    try {
        res = JSON.parse(res);
    } catch (e) {
        console.log(`${key} 不是一个Json对象`);
    }
    return res;
}
export function setItem<T extends string | Object>(key: string, value: T) {
    console.log(key, value);
    if (value instanceof Object) {
        localStorage.setItem(key, JSON.stringify(value));
        return;
    }
    localStorage.setItem(key, value);
}

export function clearItem(key: string) {
    delete localStorage[key];
}
