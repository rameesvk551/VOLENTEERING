/**
 * Event Emitter Service
 * Emits events to Kafka for Payment, Notification, and Analytics services
 */

import { Kafka, Producer, logLevel } from 'kafkajs';
import { ReservationEvent } from '../types/index.js';

export class EventEmitter {
  private producer: Producer | null = null;
  private kafka: Kafka | null = null;
  private isConnected = false;
  private kafkaEnabled: boolean;

  constructor() {
    this.kafkaEnabled = (process.env.KAFKA_ENABLED ?? 'true') !== 'false';
  }

  /**
   * Initialize Kafka producer
   */
  async connect(): Promise<void> {
    if (!this.kafkaEnabled) {
      console.log('Kafka is disabled. Events will be logged only.');
      return;
    }

    const brokers = (process.env.KAFKA_BROKERS ?? '')
      .split(',')
      .map((broker: string) => broker.trim())
      .filter(Boolean);

    if (brokers.length === 0) {
      console.warn('Kafka integration enabled but KAFKA_BROKERS is empty. Events will be logged only.');
      return;
    }

    const clientId = process.env.KAFKA_CLIENT_ID ?? 'hotel-service';

    this.kafka = new Kafka({ 
      clientId, 
      brokers, 
      logLevel: logLevel.WARN 
    });

    this.producer = this.kafka.producer();

    try {
      await this.producer.connect();
      this.isConnected = true;
      console.log('Kafka producer connected successfully');
    } catch (error) {
      console.error('Failed to connect Kafka producer:', error);
      this.isConnected = false;
    }
  }

  /**
   * Disconnect Kafka producer
   */
  async disconnect(): Promise<void> {
    if (this.producer && this.isConnected) {
      await this.producer.disconnect();
      this.isConnected = false;
      console.log('Kafka producer disconnected');
    }
  }

  /**
   * Emit reservation event
   */
  async emitReservationEvent(event: ReservationEvent): Promise<void> {
    const topic = this.getTopicForEvent(event.eventType);
    
    console.log(`Emitting event: ${event.eventType} to topic: ${topic}`, {
      reservationId: event.reservationId,
      userId: event.userId
    });

    if (!this.isConnected || !this.producer) {
      console.log('Kafka not connected. Event logged but not sent:', event);
      return;
    }

    try {
      await this.producer.send({
        topic,
        messages: [
          {
            key: event.reservationId,
            value: JSON.stringify(event),
            headers: {
              eventType: event.eventType,
              timestamp: event.timestamp
            }
          }
        ]
      });

      console.log(`Event ${event.eventType} sent successfully`);
    } catch (error) {
      console.error(`Failed to emit event ${event.eventType}:`, error);
      throw error;
    }
  }

  /**
   * Emit payment request event
   */
  async emitPaymentRequest(reservationId: string, userId: string, amount: number, currency: string): Promise<void> {
    const topic = process.env.PAYMENT_TOPIC ?? 'payment.requests';
    
    const payload = {
      eventType: 'PAYMENT_REQUESTED',
      reservationId,
      userId,
      amount,
      currency,
      timestamp: new Date().toISOString()
    };

    console.log(`Emitting payment request for reservation: ${reservationId}`);

    if (!this.isConnected || !this.producer) {
      console.log('Kafka not connected. Payment request logged but not sent:', payload);
      return;
    }

    try {
      await this.producer.send({
        topic,
        messages: [
          {
            key: reservationId,
            value: JSON.stringify(payload)
          }
        ]
      });

      console.log('Payment request sent successfully');
    } catch (error) {
      console.error('Failed to emit payment request:', error);
    }
  }

  /**
   * Get Kafka topic for event type
   */
  private getTopicForEvent(eventType: string): string {
    const topicMap: Record<string, string> = {
      RESERVATION_CREATED: process.env.RESERVATION_CREATED_TOPIC ?? 'hotel.reservation.created',
      RESERVATION_CONFIRMED: process.env.RESERVATION_CONFIRMED_TOPIC ?? 'hotel.reservation.confirmed',
      RESERVATION_CANCELLED: process.env.RESERVATION_CANCELLED_TOPIC ?? 'hotel.reservation.cancelled'
    };

    return topicMap[eventType] ?? 'hotel.events';
  }
}
