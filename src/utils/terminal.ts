import * as path from 'node:path';
import * as vscode from 'vscode';
import type { Logger } from './logger.js';

const terminalsByCwd = new Map<string, Array<vscode.Terminal>>();
const busyTerminals = new Set<vscode.Terminal>();

function normalizePath(p: string): string {
  return p.replace(/\\/g, '/').replace(/\/+$/, '');
}

export function getOrCreateTerminal(cwd: string, logger: Logger): vscode.Terminal {
  const normalizedCwd = normalizePath(cwd);
  const existing = terminalsByCwd.get(normalizedCwd) ?? [];

  /** Find an idle terminal with matching cwd */
  const idle = existing.find((t) => !busyTerminals.has(t));
  if (idle) {
    logger.info(`Reusing terminal: ${idle.name}`);
    return idle;
  }

  /** Create a new terminal */
  const baseName = path.basename(cwd);
  const count = existing.length;
  const name = count > 0
    ? `Folder Commands: ${baseName} (${count + 1})`
    : `Folder Commands: ${baseName}`;

  logger.info(`Creating terminal: ${name} (cwd: ${cwd})`);
  const terminal = vscode.window.createTerminal({ name, cwd });

  existing.push(terminal);
  terminalsByCwd.set(normalizedCwd, existing);

  return terminal;
}

export function registerTerminalListeners(): Array<vscode.Disposable> {
  const disposables: Array<vscode.Disposable> = [];

  disposables.push(
    vscode.window.onDidCloseTerminal((closed) => {
      busyTerminals.delete(closed);

      for (const [cwd, terminals] of terminalsByCwd) {
        const filtered = terminals.filter((t) => t !== closed);
        if (filtered.length === 0) {
          terminalsByCwd.delete(cwd);
        } else {
          terminalsByCwd.set(cwd, filtered);
        }
      }
    }),
  );

  disposables.push(
    vscode.window.onDidStartTerminalShellExecution((e) => {
      busyTerminals.add(e.terminal);
    }),
  );

  disposables.push(
    vscode.window.onDidEndTerminalShellExecution((e) => {
      busyTerminals.delete(e.terminal);
    }),
  );

  return disposables;
}
