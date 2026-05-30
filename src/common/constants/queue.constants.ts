export const QUEUE_NAMES = {
  USER_QUEUE: 'user_queue',
  ORDER_QUEUE: 'order_queue',
} as const;

export const EVENT_PATTERNS = {
  // User events
  USER_CREATED: 'user.created',
  USER_FETCHED: 'user.fetched',
  // Order events
  ORDER_CREATED: 'order.created',
  ORDER_STATUS_UPDATED: 'order.status_updated',
} as const;

export const MESSAGING_SERVICE = 'MESSAGING_SERVICE';