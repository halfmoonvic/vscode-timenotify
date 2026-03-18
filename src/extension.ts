import * as vscode from "vscode";
import { loadConfig } from "./config";
import { Notifier } from "./notifier";
import { compileEvent } from "./parser";
import { Scheduler } from "./scheduler";
import { StatusBarClock } from "./statusBar";

let scheduler: Scheduler | undefined;
let clock: StatusBarClock | undefined;
function setup(): void {
  const config = loadConfig();

  clock?.dispose();
  clock = new StatusBarClock(config.clockFormat, config.statusBarAlignment);
  clock.start();

  const notifier = new Notifier(config.notificationLevel);
  const compiled = config.enabled
    ? config.events.flatMap((event, index) => {
        try {
          return [compileEvent(event, index)];
        } catch {
          return [];
        }
      })
    : [];

  scheduler?.stop();
  scheduler = new Scheduler({
    intervalSeconds: config.pollIntervalSeconds,
    dedupeSeconds: config.dedupeSeconds,
    events: compiled,
    onTrigger: (event) => {
      void notifier.notify(event.title, event.message);
    }
  });
  scheduler.start();
}

export function activate(context: vscode.ExtensionContext): void {
  setup();

  const command = vscode.commands.registerCommand("timenotify.showNow", () => {
    const now = new Date().toLocaleString();
    void vscode.window.showInformationMessage(`Current time: ${now}`);
  });

  context.subscriptions.push(clock!);
  context.subscriptions.push(command);
}

export function deactivate(): void {
  scheduler?.stop();
  scheduler = undefined;
  clock?.dispose();
  clock = undefined;
}
