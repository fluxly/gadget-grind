import "./core/web-components/index.ts";
import { GadgetGrindMessenger } from "./core/GadgetGrindMessenger"

function step1() {
    GadgetGrindMessenger.sendMessage('step', '', '');
}
function step100() {
    for (let i = 0; i < 100; i++) {
        GadgetGrindMessenger.sendMessage('step', '', '');
    }
}

document.querySelector('#step-1')?.addEventListener('click', step1);
document.querySelector('#step-100')?.addEventListener('click', step100);
