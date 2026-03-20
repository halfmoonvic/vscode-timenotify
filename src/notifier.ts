import * as vscode from "vscode";
import { CompiledEvent } from "./types";

export const SNOOZE_ACTION = "Snooze";

export class Notifier {
  notify(event: CompiledEvent): Thenable<string | undefined> {
    const text = event.message ? `${event.title}: ${event.message}` : event.title;
    const actions = event.snoozeMinutes > 0 ? [SNOOZE_ACTION] : [];

    if (event.notificationMode === "modal") {
      return vscode.window.showInformationMessage(text, { modal: true }, ...actions);
    }
    return vscode.window.showInformationMessage(text, ...actions);
  }
}
