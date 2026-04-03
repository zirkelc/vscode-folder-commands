import * as path from 'node:path';
import * as vscode from 'vscode';
import { getCommands } from '../utils/config.js';
import type { Logger } from '../utils/logger.js';

function normalizePath(p: string): string {
  return p.replace(/\\/g, '/').replace(/\/+$/, '');
}

export async function addCommand(uri: vscode.Uri, logger: Logger): Promise<void> {
  const workspaceFolder = vscode.workspace.getWorkspaceFolder(uri);
  if (!workspaceFolder) {
    vscode.window.showErrorMessage('Folder Commands requires an open workspace.');
    return;
  }

  const folder = normalizePath(
    path.relative(workspaceFolder.uri.fsPath, uri.fsPath),
  );

  const label = await vscode.window.showInputBox({
    title: 'Folder Commands: Add Command (1/2)',
    prompt: 'Display label for this command',
    placeHolder: 'e.g. Deploy',
  });
  if (!label) return;

  const command = await vscode.window.showInputBox({
    title: 'Folder Commands: Add Command (2/2)',
    prompt: `Shell command to run in "${folder}"`,
    placeHolder: 'e.g. pnpm run deploy',
  });
  if (!command) return;

  const config = vscode.workspace.getConfiguration('folderCommands');
  const existing = getCommands();
  const updated = [...existing, { label, command, folder }];

  await config.update('commands', updated, vscode.ConfigurationTarget.Workspace);

  logger.info(`Added command "${label}" (${command}) for folder "${folder}"`);
  vscode.window.showInformationMessage(`Command "${label}" added for ${folder}.`);
}
