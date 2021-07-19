import * as vscode from 'vscode';
import { parseAndSort } from './utils';


console.log('aquilon is starting...');

const config = vscode.workspace.getConfiguration();

export function activate(context: vscode.ExtensionContext) {
	
	let disposable = vscode.commands.registerCommand('aquilon.organizeClasses', () => {
		const sortOrder = config.get('aquilon.defaultSortOrder');

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
		newText = parseAndSort(editorText, editor, sortOrder, newText);
		editor.edit(editBuilder => {
			editBuilder.replace(range, newText);
		});
	});


	if (config.get('aquilon.runOnSave')) {
		context.subscriptions.push(
			vscode.workspace.onWillSaveTextDocument((_e) => {
				vscode.commands.executeCommand('aquilon.organizeClasses');
			})
		);
	}

	context.subscriptions.push(disposable);
}

export function deactivate() { }
