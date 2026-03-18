import * as vscode from "vscode";
import { NotificationLevel } from "./types";

export class Notifier {
  constructor(private readonly level: NotificationLevel) {}

  notify(title: string, message?: string): Thenable<string | undefined> {
    const text = message ? `${title}: ${message}` : title;
    if (this.level === "warning") {
      return vscode.window.showWarningMessage(text);
    }
    return vscode.window.showInformationMessage(text);
  }
}
