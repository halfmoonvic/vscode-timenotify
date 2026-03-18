import * as vscode from "vscode";
import { loadConfig } from "./config";
import { Notifier } from "./notifier";
import { compileEvents } from "./parser";
import { Scheduler } from "./scheduler";
import { StatusBarClock } from "./statusBar";

let scheduler: Scheduler | undefined;
let clock: StatusBarClock | undefined;
let configWatcher: vscode.Disposable | undefined;
let output: vscode.OutputChannel | undefined;

function setup(context: vscode.ExtensionContext): void {
  const config = loadConfig();
  output = output ?? vscode.window.createOutputChannel("TimeNotify");

  clock?.dispose();
  clock = new StatusBarClock(config.clockFormat, config.statusBarAlignment);
  clock.start();

  const notifier = new Notifier(config.notificationLevel);
  const { compiled, errors } = compileEvents(config.events);
  errors.forEach((line) => output?.appendLine(`[config] ${line}`));

  scheduler?.stop();
  scheduler = new Scheduler({
    intervalSeconds: config.pollIntervalSeconds,
    dedupeSeconds: config.dedupeSeconds,
    events: config.enabled ? compiled : [],
    onTrigger: (event) => {
      output?.appendLine(`[trigger] ${event.title}`);
      void notifier.notify(event.title, event.message);
    }
  });
  scheduler.start();

  configWatcher?.dispose();
  configWatcher = vscode.workspace.onDidChangeConfiguration((event) => {
    if (event.affectsConfiguration("timenotify")) {
      setup(context);
    }
  });
  context.subscriptions.push(configWatcher);
}

export function activate(context: vscode.ExtensionContext): void {
  setup(context);

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
  configWatcher?.dispose();
  configWatcher = undefined;
  output?.dispose();
  output = undefined;
}
