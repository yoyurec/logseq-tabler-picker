import { debounce } from '@github/mini-throttle';

import { doc } from '../globals';
import { getMainCSSColors, injectPluginCSS } from '../utils';

import tablerIconsListJSON from './tablerIcons.json';
import logseqIconsListJSON from './logseqIcons.json';

type iconItem = {
    n: string;
    t: string;
    u: string;
}

export const togglePluginPopup = () => {
    if (!logseq.isMainUIVisible) {
        openPluginPopup();
    } else {
        closePluginPopup();
    }
}

const openPluginPopup = () => {
    injectPluginCSS('logseq-tabler-picker_iframe', 'taPi-vars', getMainCSSColors());
    setPopupPosition();
    logseq.showMainUI();
    setTimeout(() => {
        const searchField = document.getElementById('icon-picker-search') as HTMLInputElement;
        searchField.focus();
    }, 500)
}

const closePluginPopup = async () => {
    logseq.hideMainUI();
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
                right: `0px`
            }
        );
    }
}

const getExistingIconsList = () => {
    return tablerIconsListJSON.filter(item => logseqIconsListJSON.includes(item.u));
}

const app = document.getElementById('app');
const iconPickerList = document.getElementById('icon-picker-list');
const existingIconsList = getExistingIconsList();

export const generatePluginPopup = () => {
    app!.addEventListener('click', containerClickHandler);
    iconPickerList!.addEventListener('click', iconPickerListClickHandler);
    const searchField = document.getElementById('icon-picker-search') as HTMLInputElement;
    searchField!.addEventListener('keyup', iconPickerSearchHandler);
    const iconPickerHTML = generateIconPicker(existingIconsList);
    iconPickerList?.insertAdjacentHTML('afterbegin', iconPickerHTML);
}

const containerClickHandler = (e: Event) => {
    const target = e.target as HTMLElement;
    if (!target.closest('#app-inner')) {
        closePluginPopup();
    }
}

const iconPickerListClickHandler = (e: Event) => {
    const target = e.target as HTMLElement;
    if (target) {
        const content = target.innerHTML || '';
        navigator.clipboard.writeText(content).then(() => {
            logseq.UI.showMsg(`Icon ${target.className.replace('icon-', '')} copied to clipboard`, 'success', { timeout: 1500 });
          },() => {
            console.error('Failed to copy');
          });
    }
}

const iconPickerSearchHandler = debounce((e: Event) => {
    const target = e.target as HTMLInputElement;
    const searchText = target.value.toLowerCase();
    iconPickerList?.replaceChildren();
    const filteredList = existingIconsList.filter(item => item.t.includes(searchText))
    const iconPickerHTML = generateIconPicker(filteredList);
    iconPickerList?.insertAdjacentHTML('afterbegin', iconPickerHTML);
}, 500);

const generateIconPicker = (list:iconItem[]): string => {
    return list.map((item) => {
        return `<div class="icon-item"><button class="icon-glyph">&#x${item.u};</button><button class="icon-code" tabindex="-1">${item.u}</button></div>`;
    }).join('');
}
