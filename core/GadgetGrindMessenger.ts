type MessengerTarget = EventTarget & { dispatchEvent(evt: Event): boolean };

export interface GadgetGrindMessengerType {
    subscriptions: Record<string, MessengerTarget[]>;
    sendMessage(msg: string, cmd: string, content: unknown): void;
    subscribe(msg: string, target: MessengerTarget): void;
    unsubscribe(msg: string, target: MessengerTarget): void;
}

export const GadgetGrindMessenger: GadgetGrindMessengerType = {
    subscriptions: {},

    sendMessage(msg, cmd, content) {
        const evt = new CustomEvent(msg, { detail: { cmd: cmd, content: content } });

        const targets = this.subscriptions[msg];
        if (!targets || targets.length === 0) return;

        for (let i = 0; i < targets.length; i++) {
            targets[i].dispatchEvent(evt);
        }
    },

    subscribe(msg, target) {
        if (!this.subscriptions[msg]) {
            this.subscriptions[msg] = [];
        }
        this.subscriptions[msg].push(target);
    },

    unsubscribe(msg, target) {
        const targets = this.subscriptions[msg];
        if (!targets) return;

        const index = targets.indexOf(target);
        if (index !== -1) {
            targets.splice(index, 1);
        }
    }
};
