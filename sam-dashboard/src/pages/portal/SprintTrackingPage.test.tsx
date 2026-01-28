import { describe, it, expect, vi, beforeEach, type Mock } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { SprintTrackingPage } from './SprintTrackingPage';
import * as hooks from '../../hooks/usePortal';
import type { Sprint, SprintTask } from '../../types/portal';

// Mock the hooks
vi.mock('../../hooks/usePortal', () => ({
  useSprints: vi.fn(),
  useSprint: vi.fn(),
}));

const mockTasks: SprintTask[] = [
  {
    id: 'task-1',
    sprintId: 'sprint-1',
    title: 'Implement login flow',
    description: 'Add OAuth2 login functionality',
    status: 'IN_PROGRESS',
    priority: 'HIGH',
    assigneeId: 'user-1',
    assigneeName: 'John Doe',
    estimatedHours: 16,
    actualHours: 12,
    dueDate: null,
    order: 1,
    createdAt: '2025-01-10T00:00:00Z',
    updatedAt: '2025-01-15T00:00:00Z',
  },
  {
    id: 'task-2',
    sprintId: 'sprint-1',
    title: 'Design API endpoints',
    description: 'Create REST API specification',
    status: 'DONE',
    priority: 'MEDIUM',
    assigneeId: 'user-2',
    assigneeName: 'Jane Smith',
    estimatedHours: 8,
    actualHours: 10,
    dueDate: null,
    order: 2,
    createdAt: '2025-01-08T00:00:00Z',
    updatedAt: '2025-01-12T00:00:00Z',
  },
  {
    id: 'task-3',
    sprintId: 'sprint-1',
    title: 'Write unit tests',
    description: 'Add test coverage for core modules',
    status: 'TODO',
    priority: 'HIGH',
    assigneeId: 'user-1',
    assigneeName: 'John Doe',
    estimatedHours: 24,
    actualHours: 0,
    dueDate: null,
    order: 3,
    createdAt: '2025-01-12T00:00:00Z',
    updatedAt: '2025-01-12T00:00:00Z',
  },
];

const mockSprints: Sprint[] = [
  {
    id: 'sprint-1',
    contractId: 'contract-1',
    name: 'Sprint 1 - MVP Features',
    goal: 'Complete core authentication and dashboard',
    status: 'ACTIVE',
    startDate: '2025-01-06',
    endDate: '2025-01-20',
    plannedVelocity: 48,
    actualVelocity: 18,
    tasks: mockTasks,
    createdAt: '2025-01-05T00:00:00Z',
    updatedAt: '2025-01-15T00:00:00Z',
  },
  {
    id: 'sprint-2',
    contractId: 'contract-1',
    name: 'Sprint 2 - Reporting',
    goal: 'Implement reporting features',
    status: 'PLANNING',
    startDate: '2025-01-20',
    endDate: '2025-02-03',
    plannedVelocity: null,
    actualVelocity: null,
    tasks: [],
    createdAt: '2025-01-10T00:00:00Z',
    updatedAt: '2025-01-10T00:00:00Z',
  },
];

function renderSprintTrackingPage() {
  return render(<SprintTrackingPage />);
}

describe('SprintTrackingPage', () => {
  beforeEach(() => {
    vi.clearAllMocks();

    (hooks.useSprints as Mock).mockReturnValue({
      sprints: mockSprints,
      isLoading: false,
      error: null,
      create: vi.fn(),
      update: vi.fn(),
      remove: vi.fn(),
      refresh: vi.fn(),
    });

    (hooks.useSprint as Mock).mockReturnValue({
      sprint: mockSprints[0],
      isLoading: false,
      error: null,
      addTask: vi.fn(),
      updateTask: vi.fn(),
      removeTask: vi.fn(),
      moveTask: vi.fn(),
      refresh: vi.fn(),
    });
  });

  describe('Rendering', () => {
    it('should render the Sprint Tracking section', () => {
      renderSprintTrackingPage();
      expect(screen.getByText(/sprint tracking/i)).toBeInTheDocument();
    });

    it('should render section header with title', () => {
      renderSprintTrackingPage();
      expect(screen.getByText(/sprint tracking/i)).toBeInTheDocument();
    });

    it('should render sprint selector', () => {
      renderSprintTrackingPage();
      expect(screen.getByRole('combobox')).toBeInTheDocument();
    });

    it('should render Create Sprint button', () => {
      renderSprintTrackingPage();
      expect(screen.getByRole('button', { name: /create sprint/i })).toBeInTheDocument();
    });
  });

  describe('Sprint Display', () => {
    it('should display active sprint name', () => {
      renderSprintTrackingPage();
      expect(screen.getByText(/sprint 1 - mvp features/i)).toBeInTheDocument();
    });

    it('should display sprint goal', () => {
      renderSprintTrackingPage();
      expect(screen.getByText(/complete core authentication and dashboard/i)).toBeInTheDocument();
    });

    it('should display sprint progress', () => {
      renderSprintTrackingPage();
      // Should show actualVelocity / plannedVelocity
      expect(screen.getByText(/18/)).toBeInTheDocument();
      expect(screen.getByText(/48/)).toBeInTheDocument();
    });

    it('should display sprint dates', () => {
      renderSprintTrackingPage();
      expect(screen.getByText(/jan 6/i)).toBeInTheDocument();
      expect(screen.getByText(/jan 20/i)).toBeInTheDocument();
    });
  });

  describe('Task Board', () => {
    it('should display TODO column', () => {
      renderSprintTrackingPage();
      expect(screen.getByText('TODO')).toBeInTheDocument();
    });

    it('should display IN PROGRESS column', () => {
      renderSprintTrackingPage();
      expect(screen.getByText(/in progress/i)).toBeInTheDocument();
    });

    it('should display DONE column', () => {
      renderSprintTrackingPage();
      expect(screen.getByText('DONE')).toBeInTheDocument();
    });

    it('should display task titles', () => {
      renderSprintTrackingPage();
      expect(screen.getByText('Implement login flow')).toBeInTheDocument();
      expect(screen.getByText('Design API endpoints')).toBeInTheDocument();
      expect(screen.getByText('Write unit tests')).toBeInTheDocument();
    });

    it('should display assignee names', () => {
      renderSprintTrackingPage();
      expect(screen.getAllByText('John Doe').length).toBeGreaterThan(0);
      expect(screen.getByText('Jane Smith')).toBeInTheDocument();
    });
  });

  describe('Loading State', () => {
    it('should display loading message when sprints are loading', () => {
      (hooks.useSprints as Mock).mockReturnValue({
        sprints: [],
        isLoading: true,
        error: null,
        create: vi.fn(),
        update: vi.fn(),
        remove: vi.fn(),
        refresh: vi.fn(),
      });

      renderSprintTrackingPage();
      expect(screen.getByText(/loading sprints/i)).toBeInTheDocument();
    });
  });

  describe('Error State', () => {
    it('should display error message when loading fails', () => {
      const errorMessage = 'Failed to load sprints';
      (hooks.useSprints as Mock).mockReturnValue({
        sprints: [],
        isLoading: false,
        error: new Error(errorMessage),
        create: vi.fn(),
        update: vi.fn(),
        remove: vi.fn(),
        refresh: vi.fn(),
      });

      renderSprintTrackingPage();
      expect(screen.getByText(new RegExp(errorMessage, 'i'))).toBeInTheDocument();
    });
  });

  describe('Empty State', () => {
    it('should display empty state when no sprints exist', () => {
      (hooks.useSprints as Mock).mockReturnValue({
        sprints: [],
        isLoading: false,
        error: null,
        create: vi.fn(),
        update: vi.fn(),
        remove: vi.fn(),
        refresh: vi.fn(),
      });

      renderSprintTrackingPage();
      expect(screen.getByText(/no sprints found/i)).toBeInTheDocument();
    });
  });

  describe('Sprint Selection', () => {
    it('should allow selecting different sprints', async () => {
      const user = userEvent.setup();
      renderSprintTrackingPage();

      const sprintSelect = screen.getByRole('combobox');
      await user.selectOptions(sprintSelect, 'sprint-2');

      expect(hooks.useSprint).toHaveBeenCalled();
    });
  });

  describe('Task Actions', () => {
    it('should render Add Task button', () => {
      renderSprintTrackingPage();
      expect(screen.getByRole('button', { name: /add task/i })).toBeInTheDocument();
    });
  });
});
