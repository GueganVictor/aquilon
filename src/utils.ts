import * as vscode from 'vscode';
import { workspace } from 'vscode';

type SelectorsDict = { [key: string]: string[]; };
type Options = { placeCustomClassesFirst: boolean; useWindiCSSGrouping: boolean; indentLevel: number };

const config = workspace.getConfiguration();
const langConfig = config.get('aquilon.classRegex') as any;
const opt : Options = {
    placeCustomClassesFirst: config.get('aquilon.placeCustomClassesFirst') || false,
    useWindiCSSGrouping: config.get('aquilon.useWindiCSSGrouping') || true, 
    indentLevel: 0
};

const regexSelector = /([^\s]+):\(?([^)]+|[^"'\s]+)[\)"']?/gm;

declare global {
    interface Array<T> {
        reIndexOf(rx: string): number;
    }
}

export const sortAndFormat = (text: string, sortingArray: string[], options: Options): string => {

    const { selectorsArray, baseClasses } = splitBaseClassesAndSelectors(text);
    baseClasses.sort((a: string, b: string): number => {
        const sortOrder = sortingArray.reIndexOf(a) - sortingArray.reIndexOf(b);
        if (sortOrder < -2) { console.log(a, b, sortOrder); }
        return sortOrder;
    });

    let formattedString = '';
    formattedString += baseClasses.join(' ').replace('(', ' ');

    for (const key in selectorsArray) {
        selectorsArray[key].sort((a: string, b: string): number => {
            return sortingArray.reIndexOf(a) - sortingArray.reIndexOf(b);
        });
        formattedString += '\r\n' + ' '.repeat(options.indentLevel);
        if (options.useWindiCSSGrouping) {
            formattedString += key + ':(' + selectorsArray[key].map(x => x.trim()).join(' ') + ')';
        } else {

            formattedString += selectorsArray[key].map((x) => key + ':' + x).join(' ');
        }
    }

    return formattedString;
};

const splitBaseClassesAndSelectors = (text: string) => {
    const textTrimmed = text.replace(/\r?\n|\r|\s+/g, ' ');
    let tempBaseClasses = textTrimmed;
    let selectorsArray: SelectorsDict = {};
    let regexMatch: RegExpExecArray | null;
    while ((regexMatch = regexSelector.exec(textTrimmed)) !== null) {
        if (!selectorsArray.hasOwnProperty(regexMatch[1])) {
            selectorsArray[regexMatch[1]] = [regexMatch[2]];
        } else {
            selectorsArray[regexMatch[1]].push(regexMatch[2]);
        }
        tempBaseClasses = tempBaseClasses.replace(regexMatch[0], '');
    }
    const baseClasses = tempBaseClasses.replace(/\s+/g, ' ').trim().split(' ');
    return { selectorsArray, baseClasses };
};

export const parseAndSort = (editorText: string, editor: vscode.TextEditor | undefined, sortOrder: unknown, newText: string) => {
    const matchingAttributes = [...editorText.matchAll(langConfig['html'])];
    matchingAttributes.forEach(attribute => {
        console.log(attribute);
        const currentIndex = (attribute.index || 0) + attribute[0].length - 1 - attribute[1].length - 1;
        if (attribute[0].includes(':')) {
            for (let i = currentIndex; i > 0; i--) {
                if (editorText[i].match('\n')) {
                    opt.indentLevel = currentIndex - i;
                    break;
                }
            }
        }
        if (!editor) { return; }

        let textRaplce = sortAndFormat(attribute[1], Array.isArray(sortOrder) ? sortOrder : [], opt);
        newText = newText.replace(attribute[0], "class=\"" + textRaplce + "\"");
    });
    return newText;
};



if (!Array.prototype.reIndexOf) {
    Array.prototype.reIndexOf = function <T>(this: T[], s: string): number {
        const temp = this as unknown as Array<string>;
        for (let i = 0; i < temp.length; i++) {
            if (s.match(new RegExp(temp[i]))) { return i; }
        }

        if (opt.placeCustomClassesFirst) { return 9999999; }
        else { return -9999999; }
    };
}
