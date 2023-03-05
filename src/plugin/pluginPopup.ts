import { debounce } from '@github/mini-throttle';

import { doc, globals } from '../globals';
import { getMainCSSColors, injectPluginCSS } from '../utils';

import tablerIconsListJSON from './tablerIcons.json';
import logseqIconsListJSON from './logseqIcons.json';

type iconItem = {
    n: string;
    t: string;
    u: string;
    c: string;
}

const app = document.getElementById('app');
const appClose = document.getElementById('app-close');
const appInner = document.getElementById('app-inner');
const iconPickerList = document.getElementById('icon-picker-list');
const searchField = document.getElementById('icon-picker-search') as HTMLInputElement;
const searchCategory = document.getElementById('icon-picker-category') as HTMLInputElement;
let existingIconsList: iconItem[] = [];

export const initPluginPopup = () => {

    logseq.Editor.registerSlashCommand('✨ Tabler icon picker', openPopupInPlace);

    logseq.App.registerCommand(
        'showTablerInplace',
        {
            key: 'inlineTablerPicker',
            label: 'Show Tabler picker',
            keybinding: { binding: globals.pluginConfig.showTablerInplace },
        },
        openPopupInPlace
    );

    app!.addEventListener('click', containerClickHandler);
    appClose!.addEventListener('click', appCloseClickHandler);
    iconPickerList!.addEventListener('click', iconPickerListClickHandler);
    searchField!.addEventListener('keyup', iconPickerSearchHandler);
    searchCategory!.addEventListener('change', iconPickerCategoryHandler);

    existingIconsList = getExistingIconsList();
    globals.iconsCategoryList = [...existingIconsList];
    globals.iconsList = [...globals.iconsCategoryList];
    updateIconPickerList();
}

export const showPluginToolbarPopup = () => {
    setPopupPosition();
    iconPickerList!.dataset.invokedFrom = 'toolbar';
    openPluginPopup();
}

const openPluginPopup = () => {
    injectPluginCSS('logseq-tabler-picker_iframe', 'taPi-vars', getMainCSSColors());
    logseq.showMainUI();
    setTimeout(() => {
        const searchField = document.getElementById('icon-picker-search') as HTMLInputElement;
        searchField.focus();
    }, 500)
}

const closePluginPopup = () => {
    logseq.hideMainUI({ restoreEditingCursor: true });
    setTimeout(() => {
        iconPickerList!.parentElement!.scrollTop = 0;
        searchField.value = '';
        globals.iconsList = [...globals.iconsCategoryList];
        updateIconPickerList();
     }, 1000)
}

export const openPopupInPlace = async () => {
    await setPopupInPlacePosition();
    iconPickerList!.dataset.invokedFrom = 'inplace';
    openPluginPopup();
}

const setPopupPosition = () => {
    const button = doc.getElementById('taPi-toggle-button');
    if (button) {
        const buttonPos = button.getBoundingClientRect();
        const appInner = document.getElementById('app-inner');
        Object.assign(
            appInner!.style,
            {
                top: `${buttonPos.top + 40}px`,
                right: `0px`,
                left: 'unset'
            }
        );
    }
}

const setPopupInPlacePosition = async () => {
    // @ts-ignore
    const { left, top, rect } = await logseq.Editor.getEditingCursorPosition();
    Object.assign(
        appInner!.style,
        {
            top: top + rect.top + 26 + 'px',
            left: left + rect.left + 5 + 'px',
            right: 'unset'
        }
    )
}

const containerClickHandler = (e: Event) => {
    const target = e.target as HTMLElement;
    if (!target.closest('#app-inner')) {
        closePluginPopup();
    }
}

const appCloseClickHandler = () => {
    closePluginPopup();
}

const getExistingIconsList = () => {
    return tablerIconsListJSON.filter(item => logseqIconsListJSON.includes(item.u));
}

const iconPickerListClickHandler = async (e: Event) => {
    const target = e.target as HTMLElement;
    if (target) {
        const content = target.innerHTML || '';
        if (iconPickerList!.dataset.invokedFrom == 'toolbar') {
            navigator.clipboard.writeText(content).then(() => {
                logseq.UI.showMsg(`Icon ${target.className.replace('icon-', '')} copied to clipboard`, 'success', { timeout: 1500 });
            }, () => {
                console.error('Failed to copy');
            });
        }
        if (iconPickerList!.dataset.invokedFrom == 'inplace') {
            if (globals.pluginConfig.hideAfterInsert) {
                closePluginPopup();
            }
            await logseq.Editor.insertAtEditingCursor(content);
        }
    }
}

const iconPickerSearchHandler = debounce((e: KeyboardEvent) => {
    if (e.key === 'Escape') {
        closePluginPopup();
    }
    const target = e.target as HTMLInputElement;
    const searchText = target.value.toLowerCase();
    filterListByText(searchText);
    iconPickerList!.parentElement!.scrollTop = 0;
    updateIconPickerList();
}, 300);

const filterListByText = (searchText: string) => {
    if (!searchText) {
        globals.iconsList = [...globals.iconsCategoryList];
    } else {
        globals.iconsList = globals.iconsCategoryList.filter((item: iconItem) => item.t.includes(searchText))
    }
}

const iconPickerCategoryHandler = (e: Event) => {
    const target = e.target as HTMLSelectElement;
    const category = target.value;
    if (!category) {
        // if 'All'
        globals.iconsCategoryList = [...existingIconsList];
    } else {
        // Category
        globals.iconsCategoryList = existingIconsList.filter((item: iconItem) => item.c === category);
    }
    const searchText = searchField.value.toLowerCase();
    filterListByText(searchText);
    iconPickerList!.parentElement!.scrollTop = 0;
    updateIconPickerList();
}

const getIconsListHTML = (list:iconItem[]): string => {
    return list.map((item) => {
        return `<div class="icon-item"><button class="icon-glyph" title="${item.n}">&#x${item.u};</button><button class="icon-code" title="${item.t}" tabindex="-1">${item.u}</button></div>`;
    }).join('');
}

const updateIconPickerList = () => {
    const iconPickerHTML = getIconsListHTML(globals.iconsList);
    iconPickerList?.replaceChildren();
    iconPickerList?.insertAdjacentHTML('afterbegin', iconPickerHTML);
}
