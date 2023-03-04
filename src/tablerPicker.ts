import '@logseq/libs';

import { pluginLoad } from './plugin/plugin';

import './tablerPicker.css';

// Main logseq on ready
const main = async () => {
    console.log(`TablerPicker: plugin loaded`);
    pluginLoad();
};

logseq.ready(main).catch(null);
