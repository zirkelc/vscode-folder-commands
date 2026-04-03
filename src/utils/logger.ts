import * as vscode from 'vscode';

export class Logger implements vscode.Disposable {
  private outputChannel: vscode.LogOutputChannel;

  constructor(name: string) {
    this.outputChannel = vscode.window.createOutputChannel(name, { log: true });
  }

  info(message: string): void {
    this.outputChannel.info(message);
  }

  warn(message: string): void {
    this.outputChannel.warn(message);
  }

  error(input: Error | string | unknown): string {
    if (input instanceof Error) {
      this.outputChannel.error(input);
      return input.message;
    }

    const message = typeof input === 'string' ? input : String(input);
    this.outputChannel.error(message);
    return message;
  }

  debug(message: string): void {
    this.outputChannel.debug(message);
  }

  show(preserveFocus: boolean = true): void {
    this.outputChannel.show(preserveFocus);
  }

  dispose(): void {
    this.outputChannel.dispose();
  }
}
