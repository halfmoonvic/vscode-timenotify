import * as vscode from "vscode";
import { CompiledEvent } from "./types";
import { getSnoozeAction } from "./snooze";

export class Notifier {
  notify(event: CompiledEvent): Thenable<string | undefined> {
    const text = event.message ? `${event.title}: ${event.message}` : event.title;
    const snoozeAction = getSnoozeAction(event);
    const actions = snoozeAction ? [snoozeAction] : [];

    if (event.notificationMode === "modal") {
      return vscode.window.showInformationMessage(text, { modal: true }, ...actions);
    }
    return vscode.window.showInformationMessage(text, ...actions);
  }
}
