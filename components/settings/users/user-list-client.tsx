'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';
import { UserTable } from './user-table';
import { UserFilters } from './user-filters';
import { UserSearch } from './user-search';
import { CreateUserDialog } from './create-user-dialog';
import { EditUserDialog } from './edit-user-dialog';
import { ChangePasswordDialog } from './change-password-dialog';
import { DeactivateUserDialog } from './deactivate-user-dialog';
import { useRouter, useSearchParams } from 'next/navigation';

type User = {
  id: number;
  name: string;
  email: string;
  roleId: number;
  roleName: string | null;
  roleCode: string | null;
  developerRoleId: number | null;
  unitId: number | null;
  unitName: string | null;
  phone: string | null;
  isActive: boolean;
  lastLoginAt: Date | null;
  createdAt: Date;
  updatedAt: Date;
};

type Role = {
  id: number;
  name: string;
  code: string;
};

type Unit = {
  id: number;
  name: string;
  code: string;
};

type DeveloperRole = {
  id: number;
  name: string;
  code: string;
};

type Props = {
  initialData: {
    users: User[];
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
  roles: Role[];
  units: Unit[];
  developerRoles: DeveloperRole[];
  currentUserId: number;
};

export function UserListClient({ initialData, roles, units, developerRoles, currentUserId }: Props) {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [passwordDialogOpen, setPasswordDialogOpen] = useState(false);
  const [deactivateDialogOpen, setDeactivateDialogOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);

  const handleEdit = (user: User) => {
    setSelectedUser(user);
    setEditDialogOpen(true);
  };

  const handleChangePassword = (user: User) => {
    setSelectedUser(user);
    setPasswordDialogOpen(true);
  };

  const handleToggleActive = (user: User) => {
    setSelectedUser(user);
    setDeactivateDialogOpen(true);
  };

  const handlePageChange = (page: number) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set('page', page.toString());
    router.push(`/admin/settings/users?${params.toString()}`);
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex flex-1 items-center gap-4">
          <UserSearch />
          <UserFilters roles={roles} units={units} />
        </div>
        <Button onClick={() => setCreateDialogOpen(true)}>
          <Plus className="mr-2 h-4 w-4" />
          Add User
        </Button>
      </div>

      <UserTable
        users={initialData.users}
        onEdit={handleEdit}
        onChangePassword={handleChangePassword}
        onToggleActive={handleToggleActive}
        currentUserId={currentUserId}
        pagination={{
          page: initialData.page,
          totalPages: initialData.totalPages,
          total: initialData.total,
          onPageChange: handlePageChange,
        }}
      />

      <CreateUserDialog
        open={createDialogOpen}
        onOpenChange={setCreateDialogOpen}
        roles={roles}
        units={units}
        developerRoles={developerRoles}
      />

      {selectedUser && (
        <>
          <EditUserDialog
            open={editDialogOpen}
            onOpenChange={setEditDialogOpen}
            user={selectedUser}
            roles={roles}
            units={units}
            developerRoles={developerRoles}
            currentUserId={currentUserId}
          />

          <ChangePasswordDialog
            open={passwordDialogOpen}
            onOpenChange={setPasswordDialogOpen}
            userId={selectedUser.id}
            userName={selectedUser.name}
          />

          <DeactivateUserDialog
            open={deactivateDialogOpen}
            onOpenChange={setDeactivateDialogOpen}
            user={selectedUser}
            currentUserId={currentUserId}
          />
        </>
      )}
    </div>
  );
}
