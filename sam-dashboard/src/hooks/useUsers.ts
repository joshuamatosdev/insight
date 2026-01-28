import {useCallback, useEffect, useState} from 'react';
import type {CreateUserRequest, UpdateUserRequest, User, UserFilters, UserStatus} from '../services';
import {
    createUser,
    deleteUser,
    fetchCurrentUser,
    fetchUser,
    fetchUsers,
    updateUser,
    updateUserRoles,
    updateUserStatus,
} from '../services';

interface Page<T> {
  content: T[];
  totalElements: number;
  totalPages: number;
  size: number;
  number: number;
}

export interface UseUsersReturn {
  users: User[];
  totalElements: number;
  totalPages: number;
  page: number;
  isLoading: boolean;
  error: Error | null;
  filters: UserFilters;
  setFilters: (filters: UserFilters) => void;
  setPage: (page: number) => void;
  create: (data: CreateUserRequest) => Promise<User>;
  update: (id: string, data: UpdateUserRequest) => Promise<User>;
  remove: (id: string) => Promise<void>;
  updateStatus: (id: string, status: UserStatus) => Promise<User>;
  updateRoles: (id: string, roles: string[]) => Promise<User>;
  refresh: () => Promise<void>;
}

export function useUsers(
  initialPage: number = 0,
  pageSize: number = 20
): UseUsersReturn {
  const [users, setUsers] = useState<User[]>([]);
  const [totalElements, setTotalElements] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [page, setPage] = useState(initialPage);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const [filters, setFilters] = useState<UserFilters>({});

  const loadUsers = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const data: Page<User> = await fetchUsers(page, pageSize, filters);
      setUsers(data.content);
      setTotalElements(data.totalElements);
      setTotalPages(data.totalPages);
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Failed to load users'));
    } finally {
      setIsLoading(false);
    }
  }, [page, pageSize, filters]);

  useEffect(() => {
    void loadUsers();
  }, [loadUsers]);

  const create = useCallback(async (data: CreateUserRequest) => {
    const user = await createUser(data);
    await loadUsers();
    return user;
  }, [loadUsers]);

  const update = useCallback(async (id: string, data: UpdateUserRequest) => {
    const user = await updateUser(id, data);
    await loadUsers();
    return user;
  }, [loadUsers]);

  const remove = useCallback(async (id: string) => {
    await deleteUser(id);
    await loadUsers();
  }, [loadUsers]);

  const updateUserStatusFn = useCallback(async (id: string, status: UserStatus) => {
    const user = await updateUserStatus(id, status);
    await loadUsers();
    return user;
  }, [loadUsers]);

  const updateRolesFn = useCallback(async (id: string, roles: string[]) => {
    const user = await updateUserRoles(id, roles);
    await loadUsers();
    return user;
  }, [loadUsers]);

  return {
    users,
    totalElements,
    totalPages,
    page,
    isLoading,
    error,
    filters,
    setFilters,
    setPage,
    create,
    update,
    remove,
    updateStatus: updateUserStatusFn,
    updateRoles: updateRolesFn,
    refresh: loadUsers,
  };
}

export interface UseUserReturn {
  user: User | null;
  isLoading: boolean;
  error: Error | null;
  update: (data: UpdateUserRequest) => Promise<User>;
  refresh: () => Promise<void>;
}

export function useUser(id: string | null): UseUserReturn {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const loadUser = useCallback(async () => {
    if (id === null || id === '') {
      setUser(null);
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    setError(null);
    try {
      const data = await fetchUser(id);
      setUser(data);
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Failed to load user'));
    } finally {
      setIsLoading(false);
    }
  }, [id]);

  useEffect(() => {
    void loadUser();
  }, [loadUser]);

  const update = useCallback(async (data: UpdateUserRequest) => {
    if (id === null) throw new Error('No user ID');
    const updated = await updateUser(id, data);
    setUser(updated);
    return updated;
  }, [id]);

  return {
    user,
    isLoading,
    error,
    update,
    refresh: loadUser,
  };
}

export interface UseCurrentUserReturn {
  user: User | null;
  isLoading: boolean;
  error: Error | null;
  refresh: () => Promise<void>;
}

export function useCurrentUser(): UseCurrentUserReturn {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const loadUser = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await fetchCurrentUser();
      setUser(data);
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Failed to load current user'));
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadUser();
  }, [loadUser]);

  return {
    user,
    isLoading,
    error,
    refresh: loadUser,
  };
}
