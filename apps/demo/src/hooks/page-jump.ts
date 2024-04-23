import { useRouter } from "next/router";
export function usePageJump() {
    const router = useRouter();
    return {
        goScrcpy() {
            // router.push(`/demo?ws=${encodeURIComponent(`ws://${ip}:15555`)}`);
            router.replace(`/demo`);
        },
        goDevices() {
            router.replace(`/`);
        },
        goSpecScrcpy(param: string) {
            router.replace(`/demo?${param}`);
        },
    };
}
