type SelectorsDict = { [key: string]: string[]; };
type Options = { prependOrAppendUnknow: boolean; useWindiCSSGrouping: boolean; indentLevel: number };
const regexSelector = /([^\s]+):(\([^)]+\)|[^\s]+)/gm;

export const sortAndFormat = (text: string, sortingArray: string[], options: Options): string => {

    const { selectorsArray, baseClasses } = splitBaseClassesAndSelectors(text);
    baseClasses.sort(function (a, b) {
        return sortingArray.indexOf(a) - sortingArray.indexOf(b);
    });

    let formattedString = '';
    formattedString += baseClasses.join(' ');

    for (const key in selectorsArray) {
        selectorsArray[key].sort(function (a, b) {
            return sortingArray.indexOf(a) - sortingArray.indexOf(b);
        });
        formattedString += '\r\n' + ' '.repeat(options.indentLevel);
        if (options.useWindiCSSGrouping) {
            formattedString += key + ':(' + selectorsArray[key].join(' ') + ')';
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
