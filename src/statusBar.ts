import * as vscode from "vscode";
import { StatusBarAlignmentSetting } from "./types";

function pad2(value: number): string {
  return value.toString().padStart(2, "0");
}

export function formatClock(date: Date, format: string): string {
  return format
    .replace(/YYYY/g, String(date.getFullYear()))
    .replace(/MM/g, pad2(date.getMonth() + 1))
    .replace(/DD/g, pad2(date.getDate()))
    .replace(/HH/g, pad2(date.getHours()))
    .replace(/mm/g, pad2(date.getMinutes()))
    .replace(/ss/g, pad2(date.getSeconds()));
}

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
