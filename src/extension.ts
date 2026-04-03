import * as vscode from 'vscode';
import { addCommand } from './commands/add-command.js';
import { runCommand } from './commands/run-command.js';
import { Logger } from './utils/logger.js';
import { registerTerminalListeners } from './utils/terminal.js';

export function activate(context: vscode.ExtensionContext) {
  const logger = new Logger('Folder Commands');
  logger.info('Folder Commands extension activated');

  const runCmd = vscode.commands.registerCommand(
    'folderCommands.runCommand',
    (uri: vscode.Uri) => runCommand(uri, logger),
  );

  const addCmd = vscode.commands.registerCommand(
    'folderCommands.addCommand',
    (uri: vscode.Uri) => addCommand(uri, logger),
  );

  const terminalDisposables = registerTerminalListeners();

  context.subscriptions.push(runCmd, addCmd, ...terminalDisposables, logger);
}

export function deactivate() {}
