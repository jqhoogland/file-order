import { App, Keymap, TFile, TFolder } from 'obsidian';
import FileTreeAlternativePlugin from 'main';
import { FolderFileCountMap, FolderTree } from 'utils/types';


const _parseMetadata = (plugin) => (path) => {
    const file = plugin.app.plugins.plugins.dataview?.api.page(path);
    return {
        tags: file?.tags?.values ?? [],
        lcc: file?.lcc ?? '',
    };
};

const parseMetadata = (plugin) => ({ path, ...file }) => ({
    metadata: _parseMetadata(plugin)(path),
    path, ...file,
});

export const sortByMetadata = settings => (a, b) => {
    const atag = (settings?.tagOrder ?? []).indexOf(a.metadata.tags?.[0] ?? '');
    const btag = (settings?.tagOrder ?? []).indexOf(b.metadata.tags?.[0] ?? '');

    const _a = a.metadata.lcc !== '' ? a.metadata.lcc : atag >= 0 ? `${atag}` : `z${a.name}`;
    const _b = b.metadata.lcc !== '' ? b.metadata.lcc : btag >= 0 ? `${btag}` : `z${b.name}`;
    if (a.metadata?.tags?.length > 0 || b.metadata?.tags?.length > 0) console.log({
        a,
        b,
        atag,
        btag,
        _a,
        _b,
        r: _a.localeCompare(_b),
        settings,
    });

    return (_a).localeCompare(_b);
};

// Helper Function To Get List of Files
export const getFilesUnderPath = (path: string, plugin: FileTreeAlternativePlugin, getAllFiles?: boolean): TFile[] => {
    var filesUnderPath: TFile[] = [];
    var showFilesFromSubFolders = getAllFiles ? true : plugin.settings.showFilesFromSubFolders;
    recursiveFx(path, plugin.app);

    function recursiveFx(path: string, app: App) {
        var folderObj = app.vault.getAbstractFileByPath(path);
        if (folderObj instanceof TFolder && folderObj.children) {
            for (let child of folderObj.children) {
                if (child instanceof TFile) filesUnderPath.push(child);
                if (child instanceof TFolder && showFilesFromSubFolders) recursiveFx(child.path, app);
            }
        }
    }

    //console.log(filesUnderPath.map(parseMetadata(plugin)).sort(sortByMetadata));
    return filesUnderPath.map(parseMetadata(plugin));
};

// Helper Function to Create Folder Tree
export const createFolderTree = (startFolder: TFolder): FolderTree => {
    let fileTree: { folder: TFolder; children: any } = { folder: startFolder, children: [] };

    function recursive(folder: TFolder, object: { folder: TFolder; children: any }) {
        if (!(folder && folder.children)) return;
        for (let child of folder.children) {
            if (child instanceof TFolder) {
                let childFolder: TFolder = child as TFolder;
                let newObj: { folder: TFolder; children: any } = { folder: childFolder, children: [] };
                object.children.push(newObj);
                if (childFolder.children) recursive(childFolder, newObj);
            }
        }
    }

    recursive(startFolder, fileTree);
    return fileTree;
};

// Create Folder File Count Map
export const getFolderNoteCountMap = (plugin: FileTreeAlternativePlugin) => {
    const counts: FolderFileCountMap = {};
    let files: TFile[];
    if (plugin.settings.folderCountOption === 'notes') {
        files = plugin.app.vault.getMarkdownFiles();
    } else {
        files = plugin.app.vault.getFiles();
    }

    files.forEach((file) => {
        for (let folder = file.parent; folder != null; folder = folder.parent) {
            counts[folder.path] = 1 + (counts[folder.path] || 0);
        }
    });
    return counts;
};

// Check if folder has child folder
export const hasChildFolder = (folder: TFolder): boolean => {
    let children = folder.children;
    for (let child of children) {
        if (child instanceof TFolder) return true;
    }
    return false;
};

// Files out of Md should be listed with extension badge - Md without extension
export const getFileNameAndExtension = (fullName: string) => {
    var index = fullName.lastIndexOf('.');
    return {
        fileName: fullName.substring(0, index),
        extension: fullName.substring(index + 1),
    };
};

// Returns all parent folder paths
export const getParentFolderPaths = (file: TFile): string[] => {
    let folderPaths: string[] = ['/'];
    let parts: string[] = file.parent.path.split('/');
    let current: string = '';
    for (let i = 0; i < parts.length; i++) {
        current += `${i === 0 ? '' : '/'}` + parts[i];
        folderPaths.push(current);
    }
    return folderPaths;
};

// Extracts the Folder Name from the Full Folder Path
export const getFolderName = (folderPath: string, app: App) => {
    if (folderPath === '/') return app.vault.getName();
    let index = folderPath.lastIndexOf('/');
    if (index !== -1) return folderPath.substring(index + 1);
    return folderPath;
};

export const internalPluginLoaded = (pluginName: string, app: App) => {
    // @ts-ignore
    return app.internalPlugins.plugins[pluginName]?._loaded;
};

export const openInternalLink = (event: React.MouseEvent<Element, MouseEvent>, link: string, app: App) => {
    app.workspace.openLinkText(link, '/', Keymap.isModifier(event as unknown as MouseEvent, 'Mod') || 1 === event.button);
};
