'use strict';

import * as vscode from 'vscode';
import { workspace } from 'vscode';

console.log('aquilon is starting...');

export type LangConfig =
	| string
	| string[]
	| { regex?: string | string[]; separator?: string; replacement?: string }
	| undefined;

const config = workspace.getConfiguration();
const langConfig: { [key: string]: LangConfig | LangConfig[] } =
	config.get('headwind.classRegex') || {};


export function activate(context: vscode.ExtensionContext) {

	let disposable = vscode.commands.registerCommand('aquilon.organizeClasses', () => {
		vscode.window.showInformationMessage('Starting formatting...');

	});

	context.subscriptions.push(disposable);
}

// this method is called when your extension is deactivated
export function deactivate() { }
