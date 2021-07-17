'use strict';

import * as vscode from 'vscode';
import { workspace } from 'vscode';
import { sortAndFormat } from './utils';

console.log('aquilon is starting...');

const config = workspace.getConfiguration();
const langConfig = config.get('aquilon.classRegex') as any;
const sortOrder = config.get('aquilon.defaultSortOrder');
const opt = { prependOrAppendUnknow: false, useWindiCSSGrouping: true, indentLevel: 0 };

export function activate(context: vscode.ExtensionContext) {

	let disposable = vscode.commands.registerCommand('aquilon.organizeClasses', () => {

		let editor = vscode.window.activeTextEditor;
		if (!editor) { return; }

		const editorLangId = editor.document.languageId;
		const editorText = editor.document.getText();
		if (!['html', 'vue'].includes(editorLangId)) {
			vscode.window.showErrorMessage('You\'re using a \'' + editorLangId + '\' file which is not supported currently, please use HTML or Vue files.');
			return;
		};

		let range: vscode.Range;
		let newText: string = editorText.slice();
		range = new vscode.Range(
			editor.document.positionAt(0),
			editor.document.positionAt(editorText.length)
		);
		const matchingAttributes = [...editorText.matchAll(langConfig['html'])];
		matchingAttributes.forEach(attribute => {
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
		editor.edit(editBuilder => {
			editBuilder.replace(range, newText);
		});
	});


	// if (config.get('aquilon.runOnSave')) {
	// 	context.subscriptions.push(
	// 		workspace.onWillSaveTextDocument((_e) => {
	// 			commands.executeCommand('aquilon.organizeClasses');
	// 		})
	// 	);
	// }

	context.subscriptions.push(disposable);
}

// this method is called when your extension is deactivated
export function deactivate() { }
