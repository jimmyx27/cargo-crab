import * as vscode from 'vscode';
import { spawn } from 'child_process';

export function activate(context: vscode.ExtensionContext) {

	const statusBar = vscode.window.createStatusBarItem(vscode.StatusBarAlignment.Left, 100);
	statusBar.command = 'extension.showCargoCheckResult';
	context.subscriptions.push(statusBar);

	let disposable = vscode.workspace.onDidSaveTextDocument((document: vscode.TextDocument) => {
		if (document.languageId === 'rust' && document.uri.scheme === 'file') {
			const workspaceFolderPath = getWorkspaceFolderPath(document.uri);
			if (workspaceFolderPath) {
				const cargoCheckProcess = spawn('cargo', ['check', '--message-format=json'], { cwd: workspaceFolderPath });
				
				cargoCheckProcess.stdout.on('data', (data) => {
					console.log(data);
					const output = data.toString();
					if (output.includes("error:")) {
						statusBar.text = `$(alert) Rust Errors`;
						statusBar.backgroundColor = new vscode.ThemeColor('statusBarItem.errorsBackground');
						statusBar.show();
					} else {
						statusBar.text = `$(check) Rust Ok`;
						statusBar.backgroundColor = undefined;
						statusBar.show();
					}
				});

				cargoCheckProcess.stderr.on('data', (data) => {
					console.error(data.toString());
				});
			}
		}
	});
	context.subscriptions.push(disposable);
}

function getWorkspaceFolderPath(documentUri: vscode.Uri): string | undefined {
	const workspaceFolder = vscode.workspace.getWorkspaceFolder(documentUri);
	return workspaceFolder ? workspaceFolder.uri.fsPath : undefined;
}

export function deactivate() {}
