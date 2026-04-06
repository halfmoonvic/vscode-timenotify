import * as vscode from "vscode";
import { loadConfig } from "./config";
import {
  formatInsertValue,
  getInsertFormatDescription,
  getInsertFormatLabel,
  shouldPromptForInsertFormat
} from "./insertFormats";
import { Notifier } from "./notifier";
import { compileEvents } from "./parser";
import { Scheduler } from "./scheduler";
import { isSnoozeAction } from "./snooze";
import { InsertFormat } from "./types";
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

  const notifier = new Notifier();
  const { compiled, errors } = compileEvents(config.events, {
    notificationMode: config.notificationMode,
    snoozeMinutes: config.snoozeMinutes
  });
  errors.forEach((line) => output?.appendLine(`[config] ${line}`));

  scheduler?.stop();
  scheduler = new Scheduler({
    intervalSeconds: 1,
    dedupeSeconds: config.dedupeSeconds,
    events: config.enabled ? compiled : [],
    onTrigger: (event, now) => {
      output?.appendLine(`[trigger] ${event.title}`);
      void notifier.notify(event).then((action) => {
        if (isSnoozeAction(action, event)) {
          scheduler?.scheduleSnooze(event, event.snoozeMinutes, now);
        }
      });
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

async function pickInsertFormat(formats: InsertFormat[]): Promise<InsertFormat | undefined> {
  if (!shouldPromptForInsertFormat(formats)) {
    return formats[0];
  }

  const now = new Date();
  const selected = await vscode.window.showQuickPick(
    formats.map((format) => ({
      label: getInsertFormatLabel(format),
      description: getInsertFormatDescription(now, format),
      format
    })),
    { placeHolder: "Select a time format to insert" }
  );

  return selected?.format;
}

async function insertNow(): Promise<void> {
  const editor = vscode.window.activeTextEditor;
  if (!editor) {
    void vscode.window.showInformationMessage("No active text editor to insert into.");
    return;
  }

  const { insert } = loadConfig();
  const format = await pickInsertFormat(insert);
  if (!format) {
    return;
  }

  const text = formatInsertValue(new Date(), format);
  await editor.edit((editBuilder) => {
    for (const selection of editor.selections) {
      editBuilder.replace(selection, text);
    }
  });
}

export function activate(context: vscode.ExtensionContext): void {
  setup(context);

  const showNowCommand = vscode.commands.registerCommand("timenotify.showNow", () => {
    const now = new Date().toLocaleString();
    void vscode.window.showInformationMessage(`Current time: ${now}`);
  });
  const insertNowCommand = vscode.commands.registerCommand("timenotify.insertNow", insertNow);

  context.subscriptions.push(clock!);
  context.subscriptions.push(showNowCommand, insertNowCommand);
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
