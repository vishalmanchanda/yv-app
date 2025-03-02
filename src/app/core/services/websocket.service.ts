import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, Subject } from 'rxjs';
import { NotificationService } from './notification.service';

export interface WebSocketMessage {
  type: 'notification' | 'update' | 'alert' | 'status';
  payload: any;
  timestamp: number;
}

export interface WebSocketStatus {
  connected: boolean;
  lastConnected?: Date;
  reconnectAttempt: number;
}

@Injectable({
  providedIn: 'root'
})
export class WebSocketService {
  private socket: WebSocket | null = null;
  private readonly WS_URL = 'ws://localhost:8080'; // Replace with your WebSocket server URL
  private readonly RECONNECT_INTERVAL = 3000;
  private reconnectAttempts = 0;
  private readonly MAX_RECONNECT_ATTEMPTS = 5;

  private messageSubject = new Subject<WebSocketMessage>();
  private statusSubject = new BehaviorSubject<WebSocketStatus>({
    connected: false,
    reconnectAttempt: 0
  });

  messages$ = this.messageSubject.asObservable();
  status$ = this.statusSubject.asObservable();

  constructor(private notificationService: NotificationService) {
    // Initialize WebSocket connection
    this.connect();
  }

  private connect(): void {
    try {
      this.socket = new WebSocket(this.WS_URL);
      this.setupSocketListeners();
    } catch (error) {
      console.error('WebSocket connection error:', error);
      this.handleConnectionError();
    }
  }

  private setupSocketListeners(): void {
    if (!this.socket) return;

    this.socket.onopen = () => {
      this.statusSubject.next({
        connected: true,
        lastConnected: new Date(),
        reconnectAttempt: 0
      });
      this.reconnectAttempts = 0;
      this.notificationService.success('WebSocket connected');
    };

    this.socket.onmessage = (event) => {
      try {
        const message: WebSocketMessage = JSON.parse(event.data);
        this.handleMessage(message);
      } catch (error) {
        console.error('Error parsing WebSocket message:', error);
      }
    };

    this.socket.onclose = () => {
      this.statusSubject.next({
        connected: false,
        lastConnected: this.statusSubject.value.lastConnected,
        reconnectAttempt: this.reconnectAttempts
      });
      this.handleConnectionError();
    };

    this.socket.onerror = (error) => {
      console.error('WebSocket error:', error);
      this.notificationService.error('WebSocket error occurred');
    };
  }

  private handleConnectionError(): void {
    if (this.reconnectAttempts < this.MAX_RECONNECT_ATTEMPTS) {
      this.reconnectAttempts++;
      setTimeout(() => this.connect(), this.RECONNECT_INTERVAL);
      this.notificationService.warning(
        `Connection lost. Reconnecting (${this.reconnectAttempts}/${this.MAX_RECONNECT_ATTEMPTS})...`
      );
    } else {
      this.notificationService.error('Failed to establish WebSocket connection');
    }
  }

  private handleMessage(message: WebSocketMessage): void {
    this.messageSubject.next(message);

    switch (message.type) {
      case 'notification':
        this.notificationService.info(message.payload.message);
        break;
      case 'alert':
        this.notificationService.warning(message.payload.message);
        break;
      case 'status':
        // Handle status updates
        break;
      default:
        console.log('Unhandled message type:', message.type);
    }
  }

  sendMessage(type: WebSocketMessage['type'], payload: any): void {
    if (this.socket?.readyState === WebSocket.OPEN) {
      const message: WebSocketMessage = {
        type,
        payload,
        timestamp: Date.now()
      };
      this.socket.send(JSON.stringify(message));
    } else {
      this.notificationService.error('WebSocket is not connected');
    }
  }

  // Mock methods for testing without a real WebSocket server
  simulateIncomingMessage(type: WebSocketMessage['type'], payload: any): void {
    const message: WebSocketMessage = {
      type,
      payload,
      timestamp: Date.now()
    };
    this.handleMessage(message);
  }

  disconnect(): void {
    if (this.socket) {
      this.socket.close();
      this.socket = null;
    }
  }
} 