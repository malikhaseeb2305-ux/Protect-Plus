import { alertService } from '../alertService';
import { alertNotificationRepository } from '../../infrastructure/alertNotificationRepository';
import { NotFoundError } from '../../../../shared/errors';

jest.mock('../../infrastructure/alertNotificationRepository');

const mockedRepo = alertNotificationRepository as jest.Mocked<typeof alertNotificationRepository>;

function makeNotifDoc(overrides: Record<string, unknown> = {}) {
  return {
    _id: 'notif-1',
    userId: 'user-1',
    locationId: 'loc-1',
    ruleId: 'rule-1',
    triggeredAt: new Date('2025-06-01T12:00:00Z'),
    message: 'Temperature exceeds 35 in London, GB (current: 40)',
    snapshotId: null,
    read: false,
    createdAt: new Date('2025-06-01T12:00:00Z'),
    updatedAt: new Date('2025-06-01T12:00:00Z'),
    ...overrides,
  } as any;
}

describe('alertService', () => {
  afterEach(() => jest.clearAllMocks());

  describe('getAlerts', () => {
    it('should return mapped alert entities', async () => {
      mockedRepo.findByUser.mockResolvedValue([makeNotifDoc()]);
      const alerts = await alertService.getAlerts('user-1');

      expect(alerts).toHaveLength(1);
      expect(alerts[0].id).toBe('notif-1');
      expect(alerts[0].message).toContain('Temperature exceeds');
      expect(alerts[0].read).toBe(false);
    });

    it('should return empty array when user has no alerts', async () => {
      mockedRepo.findByUser.mockResolvedValue([]);
      const alerts = await alertService.getAlerts('user-1');
      expect(alerts).toEqual([]);
    });

    it('should pass default pagination (page=1, limit=20)', async () => {
      mockedRepo.findByUser.mockResolvedValue([]);
      await alertService.getAlerts('user-1');
      expect(mockedRepo.findByUser).toHaveBeenCalledWith('user-1', { page: 1, limit: 20 });
    });

    it('should pass custom pagination parameters', async () => {
      mockedRepo.findByUser.mockResolvedValue([]);
      await alertService.getAlerts('user-1', 3, 10);
      expect(mockedRepo.findByUser).toHaveBeenCalledWith('user-1', { page: 3, limit: 10 });
    });

    it('should return multiple alerts in order', async () => {
      const doc1 = makeNotifDoc({ _id: 'notif-1', message: 'Alert 1' });
      const doc2 = makeNotifDoc({ _id: 'notif-2', message: 'Alert 2' });
      mockedRepo.findByUser.mockResolvedValue([doc1, doc2]);

      const alerts = await alertService.getAlerts('user-1');

      expect(alerts).toHaveLength(2);
      expect(alerts[0].id).toBe('notif-1');
      expect(alerts[1].id).toBe('notif-2');
    });

    it('should correctly map snapshotId when present', async () => {
      const doc = makeNotifDoc({ snapshotId: 'snap-123' });
      mockedRepo.findByUser.mockResolvedValue([doc]);

      const alerts = await alertService.getAlerts('user-1');
      expect(alerts[0].snapshotId).toBe('snap-123');
    });

    it('should map snapshotId to null when absent', async () => {
      const doc = makeNotifDoc({ snapshotId: null });
      mockedRepo.findByUser.mockResolvedValue([doc]);

      const alerts = await alertService.getAlerts('user-1');
      expect(alerts[0].snapshotId).toBeNull();
    });
  });

  describe('getUnreadCount', () => {
    it('should return the unread count from repository', async () => {
      mockedRepo.countUnread.mockResolvedValue(5);
      const count = await alertService.getUnreadCount('user-1');
      expect(count).toBe(5);
    });

    it('should return 0 when no unread alerts', async () => {
      mockedRepo.countUnread.mockResolvedValue(0);
      const count = await alertService.getUnreadCount('user-1');
      expect(count).toBe(0);
    });

    it('should pass the correct userId', async () => {
      mockedRepo.countUnread.mockResolvedValue(0);
      await alertService.getUnreadCount('user-42');
      expect(mockedRepo.countUnread).toHaveBeenCalledWith('user-42');
    });
  });

  describe('markRead', () => {
    it('should mark a notification as read and return it', async () => {
      const readDoc = makeNotifDoc({ read: true });
      mockedRepo.markAsRead.mockResolvedValue(readDoc);

      const result = await alertService.markRead('user-1', 'notif-1');

      expect(result.read).toBe(true);
      expect(result.id).toBe('notif-1');
      expect(mockedRepo.markAsRead).toHaveBeenCalledWith('user-1', 'notif-1');
    });

    it('should throw NotFoundError when notification does not exist', async () => {
      mockedRepo.markAsRead.mockResolvedValue(null);
      await expect(alertService.markRead('user-1', 'nonexistent')).rejects.toThrow(NotFoundError);
    });

    it('should throw NotFoundError when notification belongs to different user', async () => {
      mockedRepo.markAsRead.mockResolvedValue(null);
      await expect(alertService.markRead('user-999', 'notif-1')).rejects.toThrow(NotFoundError);
    });
  });

  describe('markAllRead', () => {
    it('should call repository markAllAsRead with correct userId', async () => {
      mockedRepo.markAllAsRead.mockResolvedValue();
      await alertService.markAllRead('user-1');
      expect(mockedRepo.markAllAsRead).toHaveBeenCalledWith('user-1');
    });

    it('should not throw when user has no unread alerts', async () => {
      mockedRepo.markAllAsRead.mockResolvedValue();
      await expect(alertService.markAllRead('user-1')).resolves.not.toThrow();
    });
  });

  describe('createNotification', () => {
    it('should create and return a notification entity', async () => {
      mockedRepo.create.mockResolvedValue(makeNotifDoc());

      const result = await alertService.createNotification({
        userId: 'user-1',
        locationId: 'loc-1',
        ruleId: 'rule-1',
        message: 'Temperature exceeds 35 in London, GB (current: 40)',
      });

      expect(result.id).toBe('notif-1');
      expect(result.read).toBe(false);
      expect(mockedRepo.create).toHaveBeenCalledWith(
        expect.objectContaining({
          userId: 'user-1',
          locationId: 'loc-1',
          ruleId: 'rule-1',
          triggeredAt: expect.any(Date),
        }),
      );
    });

    it('should set triggeredAt to current time', async () => {
      const before = new Date();
      mockedRepo.create.mockResolvedValue(makeNotifDoc());

      await alertService.createNotification({
        userId: 'user-1',
        locationId: 'loc-1',
        ruleId: 'rule-1',
        message: 'Test',
      });

      const after = new Date();
      const callArg = mockedRepo.create.mock.calls[0][0];
      expect(callArg.triggeredAt.getTime()).toBeGreaterThanOrEqual(before.getTime());
      expect(callArg.triggeredAt.getTime()).toBeLessThanOrEqual(after.getTime());
    });

    it('should pass optional snapshotId when provided', async () => {
      mockedRepo.create.mockResolvedValue(makeNotifDoc({ snapshotId: 'snap-1' }));

      await alertService.createNotification({
        userId: 'user-1',
        locationId: 'loc-1',
        ruleId: 'rule-1',
        message: 'Test',
        snapshotId: 'snap-1',
      });

      expect(mockedRepo.create).toHaveBeenCalledWith(
        expect.objectContaining({ snapshotId: 'snap-1' }),
      );
    });
  });
});
