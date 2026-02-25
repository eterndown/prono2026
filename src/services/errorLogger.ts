
export type LogLevel = 'info' | 'warn' | 'error';

export interface LogEntry {
  timestamp: string;
  level: LogLevel;
  message: string;
  context?: any;
}

class ErrorLogger {
  private logs: LogEntry[] = [];
  private readonly MAX_LOGS = 50;
  private subscribers: ((logs: LogEntry[]) => void)[] = [];

  constructor() {
    this.loadFromStorage();
  }

  private loadFromStorage() {
    if (typeof window === 'undefined') return;
    try {
      const saved = localStorage.getItem('fifa_system_logs');
      if (saved) {
        this.logs = JSON.parse(saved);
      }
    } catch (e) {
      console.error('Failed to load logs from storage', e);
    }
  }

  private saveToStorage() {
    if (typeof window === 'undefined') return;
    try {
      localStorage.setItem('fifa_system_logs', JSON.stringify(this.logs.slice(-20)));
    } catch (e) {
      console.error('Failed to save logs to storage', e);
    }
  }

  public log(message: string, level: LogLevel = 'info', context?: any) {
    const entry: LogEntry = {
      timestamp: new Date().toISOString(),
      level,
      message,
      context
    };

    console[level](`[${level.toUpperCase()}] ${message}`, context || '');
    
    this.logs.push(entry);
    if (this.logs.length > this.MAX_LOGS) {
      this.logs.shift();
    }

    this.saveToStorage();
    this.notify();
  }

  public subscribe(callback: (logs: LogEntry[]) => void) {
    this.subscribers.push(callback);
    callback(this.logs);
    return () => {
      this.subscribers = this.subscribers.filter(s => s !== callback);
    };
  }

  private notify() {
    this.subscribers.forEach(s => s([...this.logs]));
  }

  public getLogs() {
    return [...this.logs];
  }

  public clear() {
    this.logs = [];
    if (typeof window !== 'undefined') {
      localStorage.removeItem('fifa_system_logs');
    }
    this.notify();
  }
}

export const logger = new ErrorLogger();
