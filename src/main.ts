import { addIcon, Plugin } from 'obsidian';
import { FileTreeView, ICON, VIEW_TYPE } from './FileTreeView';
import { LocationIcon, ZoomInIcon, ZoomOutDoubleIcon, ZoomOutIcon } from './utils/icons';
import { DEFAULT_SETTINGS, FileTreeAlternativePluginSettings, FileTreeAlternativePluginSettingsTab } from './settings';
import yaml from 'js-yaml';

export const eventTypes = {
    activeFileChange: 'file-tree-alternative-active-file-change',
    refreshView: 'file-tree-alternative-refresh-view',
};

export default class FileTreeAlternativePlugin extends Plugin {
    settings: FileTreeAlternativePluginSettings;
    ribbonIconEl: HTMLElement | undefined = undefined;

    keys = {
        activeFolderPathKey: 'fileTreePlugin-ActiveFolderPath',
        pinnedFilesKey: 'fileTreePlugin-PinnedFiles',
        openFoldersKey: 'fileTreePlugin-OpenFolders',
        customHeightKey: 'fileTreePlugin-CustomHeight',
        focusedFolder: 'fileTreePlugin-FocusedFolder',
    };

    async onload() {
        console.log('Loading Alternative File Tree Plugin');

        addIcon('zoomInIcon', ZoomInIcon);
        addIcon('zoomOutIcon', ZoomOutIcon);
        addIcon('zoomOutDoubleIcon', ZoomOutDoubleIcon);
        addIcon('locationIcon', LocationIcon);

        // Load Settings
        this.addSettingTab(new FileTreeAlternativePluginSettingsTab(this.app, this));
        await this.loadSettings();

        // Register File Tree View
        this.registerView(VIEW_TYPE, (leaf) => {
            return new FileTreeView(leaf, this);
        });

        // Event Listeners
        this.app.workspace.onLayoutReady(async () => await this.openFileTreeLeaf(true));

        // Add Command to Open File Tree Leaf
        this.addCommand({
            id: 'open-file-tree-leaf',
            name: 'Open File Tree Leaf',
            callback: async () => await this.openFileTreeLeaf(true),
        });

        // Ribbon Icon For Opening
        this.refreshIconRibbon();
    }

    onunload() {
        console.log('Unloading Alternative File Tree Plugin');
        this.detachFileTreeLeafs();
    }

    async loadSettings() {
        this.settings = Object.assign({}, DEFAULT_SETTINGS, await this.loadData());
    }

    async saveSettings() {
        await this.saveData(this.settings);
    }

    refreshIconRibbon = () => {
        this.ribbonIconEl?.remove();
        if (this.settings.ribbonIcon) {
            this.ribbonIconEl = this.addRibbonIcon(ICON, 'File Tree Alternative Plugin', async () => {
                await this.openFileTreeLeaf(true);
            });
        }
    };

    openFileTreeLeaf = async (showAfterAttach: boolean) => {
        if (this.app.workspace.getLeavesOfType(VIEW_TYPE).length == 0) {
            let leaf = this.app.workspace.getLeftLeaf(false);
            await leaf.setViewState({ type: VIEW_TYPE });
            if (showAfterAttach) this.app.workspace.revealLeaf(leaf);
        }
    };

    detachFileTreeLeafs = () => {
        let leafs = this.app.workspace.getLeavesOfType(VIEW_TYPE);
        for (let leaf of leafs) {
            (leaf.view as FileTreeView).destroy();
            leaf.detach();
        }
    };

    refreshTreeLeafs = () => {
        this.detachFileTreeLeafs();
        this.openFileTreeLeaf(true);
    };

    async evalFile(f: string): Promise<void> {
        try {
            const file = await this.app.vault.adapter.read(f);
            const def = yaml.load(file);
            return def;
        } catch (e) {
            console.error(`File Order couldn\'t import ${f}`);
            console.error(e);
        }
    }

    async loadTagOrder() {
        // load all scripts
        this.settings.tagOrder = await this.evalFile(this.settings.tagFile);

        // @ts-ignore
        window.tagOrder = tagOrder;
    }
}
