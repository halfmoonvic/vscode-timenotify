import * as vscode from "vscode";
import { StatusBarAlignmentSetting } from "./types";
import { formatClock } from "./clockFormat";

export class StatusBarClock implements vscode.Disposable {
  private item: vscode.StatusBarItem;
  private timer: NodeJS.Timeout | undefined;
  private format: string;

  constructor(format: string, alignment: StatusBarAlignmentSetting) {
    this.item = vscode.window.createStatusBarItem(
      alignment === "left" ? vscode.StatusBarAlignment.Left : vscode.StatusBarAlignment.Right,
      100
    );
    this.item.name = "TimeNotify";
    this.item.show();
    this.format = format;
  }

  setFormat(format: string): void {
    this.format = format;
    this.update();
  }

  start(): void {
    this.stop();
    this.update();
    this.timer = setInterval(() => this.update(), 1000);
  }

  update(now = new Date()): void {
    this.item.text = `$(clock) ${formatClock(now, this.format)}`;
    this.item.tooltip = "TimeNotify";
  }

  stop(): void {
    if (!this.timer) {
      return;
    }
    clearInterval(this.timer);
    this.timer = undefined;
  }

  dispose(): void {
    this.stop();
    this.item.dispose();
  }
}
