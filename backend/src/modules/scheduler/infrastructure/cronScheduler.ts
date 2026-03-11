import { schedule, ScheduledTask } from 'node-cron';
import { config } from '../../../shared/config';
import { logger } from '../../../shared/logger';
import { evaluationService } from '../application/evaluationService';

let task: ScheduledTask | null = null;

export function startScheduler(): void {
  if (task) {
    logger.warn('Scheduler already running');
    return;
  }

  logger.info('Starting alert evaluation scheduler', {
    cron: config.alertEvaluationCron,
  });

  task = schedule(config.alertEvaluationCron, async () => {
    logger.debug('Scheduler tick — starting rule evaluation');
    try {
      await evaluationService.evaluateAllRules();
    } catch (err) {
      logger.error('Scheduler evaluation failed', {
        error: err instanceof Error ? err.message : String(err),
      });
    }
  });
}

export function stopScheduler(): void {
  if (task) {
    task.stop();
    task = null;
    logger.info('Scheduler stopped');
  }
}
