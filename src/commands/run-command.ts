import * as path from 'node:path';
import * as vscode from 'vscode';
import { type CommandConfig, getCommands } from '../utils/config.js';
import type { Logger } from '../utils/logger.js';
import { getOrCreateTerminal } from '../utils/terminal.js';

function normalizePath(p: string): string {
  return p.replace(/\\/g, '/').replace(/\/+$/, '');
}

export async function runCommand(uri: vscode.Uri | undefined, logger: Logger): Promise<void> {
  const allCommands = getCommands();

  if (allCommands.length === 0) {
    const action = await vscode.window.showInformationMessage(
      'No commands configured.',
      'Open Settings',
    );
    if (action === 'Open Settings') {
      vscode.commands.executeCommand(
        'workbench.action.openSettings',
        'folderCommands.commands',
      );
    }
    return;
  }

  let matching: Array<CommandConfig>;
  let workspaceFolder: vscode.WorkspaceFolder | undefined;

  if (uri) {
    workspaceFolder = vscode.workspace.getWorkspaceFolder(uri);
    if (!workspaceFolder) {
      vscode.window.showErrorMessage('Command Runner requires an open workspace.');
      return;
    }

    const clickedRelative = normalizePath(
      path.relative(workspaceFolder.uri.fsPath, uri.fsPath),
    );

    matching = allCommands.filter(
      (cmd) => normalizePath(cmd.folder) === clickedRelative,
    );

    if (matching.length === 0) {
      const action = await vscode.window.showInformationMessage(
        `No commands configured for "${clickedRelative}".`,
        'Open Settings',
      );
      if (action === 'Open Settings') {
        vscode.commands.executeCommand(
          'workbench.action.openSettings',
          'folderCommands.commands',
        );
      }
      return;
    }
  } else {
    matching = allCommands;
  }

  const picked = await vscode.window.showQuickPick(
    matching.map((cmd) => ({
      label: cmd.label,
      description: cmd.command,
      detail: cmd.folder,
      cmd,
    })),
    { placeHolder: 'Select a command to run' },
  );

  if (!picked) return;
  const selected = picked.cmd;

  if (!workspaceFolder) {
    const folders = vscode.workspace.workspaceFolders;
    if (!folders || folders.length === 0) {
      vscode.window.showErrorMessage('Command Runner requires an open workspace.');
      return;
    }
    workspaceFolder = folders[0];
  }

  const cwd = path.join(workspaceFolder.uri.fsPath, selected.folder);
  logger.info(`Running "${selected.command}" in ${cwd}`);

  const terminal = getOrCreateTerminal(cwd, logger);
  terminal.sendText(selected.command);
  terminal.show();
}
