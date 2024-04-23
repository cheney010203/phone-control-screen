class EventBus {
    event: {
        [key: string]: Function[] | undefined;
    };
    constructor() {
        this.event = {};
    }

    on(event: string, callback: Function) {
        if (this.event[event]) {
            this.event[event]!.push(callback);
        } else {
            this.event[event] = [callback];
        }
    }

    emit(event: string, arg: any[] = []) {
        this.event[event]?.forEach((item) => item(...arg));
    }

    off(event?: string) {
        if (event) {
            this.event[event] = undefined;
        } else {
            this.event = {};
        }
    }
}

export default new EventBus();
