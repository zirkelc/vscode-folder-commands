import * as vscode from 'vscode';
import { addCommand } from './commands/add-command.js';
import { runCommand } from './commands/run-command.js';
import { getCommands } from './utils/config.js';
import { Logger } from './utils/logger.js';
import { registerTerminalListeners } from './utils/terminal.js';

function updateHasCommands() {
  vscode.commands.executeCommand(
    'setContext',
    'folderCommands.hasCommands',
    getCommands().length > 0,
  );
}

export function activate(context: vscode.ExtensionContext) {
  const logger = new Logger('Folder Commands');
  logger.info('Folder Commands extension activated');

  updateHasCommands();

  const runCmd = vscode.commands.registerCommand(
    'folderCommands.runCommand',
    (uri: vscode.Uri) => runCommand(uri, logger),
  );

  const addCmd = vscode.commands.registerCommand(
    'folderCommands.addCommand',
    async (uri: vscode.Uri) => {
      await addCommand(uri, logger);
      updateHasCommands();
    },
  );

  const configWatcher = vscode.workspace.onDidChangeConfiguration((e) => {
    if (e.affectsConfiguration('folderCommands.commands')) {
      updateHasCommands();
    }
  });

  const terminalDisposables = registerTerminalListeners();

  context.subscriptions.push(runCmd, addCmd, configWatcher, ...terminalDisposables, logger);
}

export function deactivate() {}
