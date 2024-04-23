import { useEffect, useState } from "react";

// const proxy = new Proxy(localStorage, {
//     set(target, setKey, val) {
//         if (setKey === key) {
//             setVal(val);
//         }
//         return Reflect.set(...arguments);
//     },
// });

export default function useLocalStorage(key: string) {
    const [val, setVal] = useState(null);
    useEffect(() => {}, []);
    return val;
}
