import "./core/web-components/index.ts";
import { GadgetGrindMessenger } from "./core/GadgetGrindMessenger"

function step1() {
    GadgetGrindMessenger.sendMessage('step', '', '');
}
async function step100() {
    for (let i = 1; i <= 100; i++) {
        GadgetGrindMessenger.sendMessage('step', '', '');
        document.querySelector('#step-count')!.innerHTML = JSON.stringify(i);
        await new Promise(resolve => setTimeout(resolve, 150));
    }
}

document.querySelector('#step-1')?.addEventListener('click', step1);
document.querySelector('#step-100')?.addEventListener('click', step100);
