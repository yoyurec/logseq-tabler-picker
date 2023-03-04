import { SettingSchemaDesc } from '@logseq/libs/dist/LSPlugin.user';

import { doc, body, globals } from '../globals';
import { checkPluginUpdate } from '../utils';
import { initPluginPopup, showPluginToolbarPopup } from './pluginPopup';

export const pluginLoad = () => {
    body.classList.add(globals.isPluginEnabled);

    logseq.useSettingsSchema(settingsConfig);
    globals.pluginConfig = logseq.settings;

    initPluginPopup();

    logseq.provideModel({
        showPluginToolbarPopup: showPluginToolbarPopup
    });

    logseq.App.registerUIItem(
        'toolbar',
        {
            key: 'TablerPicker',
            template: `
                <button
                class="button" id="taPi-toggle-button"
                data-on-click="showPluginToolbarPopup" data-rect>
                    <span id="taPi-toggle-icon" class="ti ti-triangle-square-circle"></span>
                </button>
            `
        }
    );

    setTimeout(() => {
        doc.head.insertAdjacentHTML('beforeend', `<link rel="stylesheet" id="css-tablerPicker" href="lsp://logseq.io/${globals.pluginID}/dist/assets/tablerPicker.css">`)
    }, 100);

    setTimeout(() => {
        // Listen plugin unload
        logseq.beforeunload(async () => {
            pluginUnload();
        });
    }, 2000)

    if (globals.pluginConfig.pluginUpdateNotify) {
        setTimeout(() => {
            checkPluginUpdate();
        }, 8000)
    }
}

const pluginUnload = () => {
    body.classList.remove(globals.isPluginEnabled);
    unregisterPlugin();
}

const settingsConfig: SettingSchemaDesc[] = [
    {
        key: 'settingsHeading',
        title: 'Settings',
        description: '',
        type: 'heading',
        default: null,
    },
    {
        key: 'hideAfterInsert',
        title: '',
        description: 'Hide inline popup after inserting icon?',
        type: 'boolean',
        default: true,
    },
    {
        key: 'showTablerInplace',
        title: 'Show Tabler picker',
        description: 'Shortcut to open icon picker on editing',
        default: 'mod+shift+t',
        type: 'string',
    },
    {
        key: 'otherHeading',
        title: 'Other',
        description: '',
        type: 'heading',
        default: null,
    },
    {
        key: 'pluginUpdateNotify',
        title: '',
        description: 'Enable new version notifier on app load?',
        type: 'boolean',
        default: true,
    },
];

const unregisterPlugin = () => {
    doc.getElementById('css-tablerPicker')?.remove();
}
