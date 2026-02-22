/**
 * Structured Logger
 *
 * All logging must go through this module. Do not import pino directly in domain code.
 * This ensures consistent formatting, context propagation, and observability.
 *
 * Usage:
 *   import { createLogger } from '@providers/telemetry/logger';
 *   const log = createLogger('my-domain');
 *   log.info({ orderId: '123' }, 'Order created');
 */

import pino from "pino";

const baseLogger = pino({
	level: process.env.LOG_LEVEL ?? "info",
	formatters: {
		level(label) {
			return { level: label };
		},
	},
	timestamp: pino.stdTimeFunctions.isoTime,
});

export function createLogger(domain: string) {
	return baseLogger.child({ domain });
}

export type Logger = ReturnType<typeof createLogger>;
