import * as vscode from 'vscode';

export interface CommandConfig {
  label: string;
  command: string;
  folder: string;
}

export function getCommands(): Array<CommandConfig> {
  const config = vscode.workspace.getConfiguration('folderCommands');
  return config.get<Array<CommandConfig>>('commands', []);
}
