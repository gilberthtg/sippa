'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { updateUser } from '@/app/actions/user-management';
import { toast } from 'sonner';

const editUserSchema = z.object({
  name: z.string().min(1, 'Name is required').max(200, 'Name too long'),
  email: z.string().email('Invalid email format'),
  roleId: z.number().refine(val => !!val, { message: 'Role is required' }),
  developerRoleId: z.number().nullable(),
  unitId: z.number().nullable(),
  phone: z.string().max(50, 'Phone too long').nullable(),
  isActive: z.boolean(),
});

type EditUserForm = z.infer<typeof editUserSchema>;

type User = {
  id: number;
  name: string;
  email: string;
  roleId: number;
  developerRoleId: number | null;
  unitId: number | null;
  phone: string | null;
  isActive: boolean;
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
  open: boolean;
  onOpenChange: (open: boolean) => void;
  user: User;
  roles: Role[];
  units: Unit[];
  developerRoles: DeveloperRole[];
  currentUserId: number;
};

export function EditUserDialog({ open, onOpenChange, user, roles, units, developerRoles, currentUserId }: Props) {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const isCurrentUser = user.id === currentUserId;

  const form = useForm<EditUserForm>({
    resolver: zodResolver(editUserSchema),
    defaultValues: {
      name: user.name,
      email: user.email,
      roleId: user.roleId,
      developerRoleId: user.developerRoleId,
      unitId: user.unitId,
      phone: user.phone,
      isActive: user.isActive,
    },
  });

  // Watch roleId to determine if developer role should be shown
  const selectedRoleId = form.watch('roleId');
  const selectedRole = roles.find(r => r.id === selectedRoleId);
  const isDeveloperRole = selectedRole?.code === 'DEVELOPER';

  useEffect(() => {
    form.reset({
      name: user.name,
      email: user.email,
      roleId: user.roleId,
      developerRoleId: user.developerRoleId,
      unitId: user.unitId,
      phone: user.phone,
      isActive: user.isActive,
    });
  }, [user, form]);

  const onSubmit = async (data: EditUserForm) => {
    // Validate developer role requirement
    if (isDeveloperRole && !data.developerRoleId) {
      toast.error('Developer role is required when role is Developer');
      return;
    }

    setIsLoading(true);

    try {
      await updateUser(user.id, data);
      toast.success('User updated successfully');
      onOpenChange(false);
      router.refresh();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Failed to update user');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Edit User</DialogTitle>
          <DialogDescription>Update user information</DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Name</FormLabel>
                  <FormControl>
                    <Input {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Email</FormLabel>
                  <FormControl>
                    <Input type="email" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="roleId"
              render={({ field }) => {
                const selectedRole = roles.find(r => r.id === field.value);
                return (
                  <FormItem>
                    <FormLabel>Role</FormLabel>
                    <Select
                      onValueChange={(value) => field.onChange(Number(value))}
                      value={field.value?.toString()}
                      disabled={isCurrentUser}
                    >
                      <FormControl>
                        <SelectTrigger className="w-full">
                          <SelectValue placeholder="Select role">
                            {selectedRole ? `${selectedRole.name} (${selectedRole.code})` : 'Select role'}
                          </SelectValue>
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {roles.map((role) => (
                          <SelectItem key={role.id} value={role.id.toString()}>
                            <div className="flex flex-col py-1">
                              <span className="font-medium">{role.name}</span>
                              <span className="text-xs text-muted-foreground">{role.code}</span>
                            </div>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    {isCurrentUser && (
                      <p className="text-xs text-muted-foreground">
                        You cannot change your own role
                      </p>
                    )}
                    <FormMessage />
                  </FormItem>
                );
              }}
            />

            {isDeveloperRole && (
              <FormField
                control={form.control}
                name="developerRoleId"
                render={({ field }) => {
                  const selectedDevRole = developerRoles.find(dr => dr.id === field.value);
                  return (
                    <FormItem>
                      <FormLabel>Developer Role <span className="text-destructive">*</span></FormLabel>
                      <Select
                        onValueChange={(value) => field.onChange(Number(value))}
                        value={field.value?.toString() || ''}
                      >
                        <FormControl>
                          <SelectTrigger className="w-full">
                            <SelectValue placeholder="Select developer role">
                              {selectedDevRole ? `${selectedDevRole.name} (${selectedDevRole.code})` : 'Select developer role'}
                            </SelectValue>
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {developerRoles.map((devRole) => (
                            <SelectItem key={devRole.id} value={devRole.id.toString()}>
                              <div className="flex flex-col py-1">
                                <span className="font-medium">{devRole.name}</span>
                                <span className="text-xs text-muted-foreground">{devRole.code}</span>
                              </div>
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <p className="text-xs text-muted-foreground">
                        Required for Developer role
                      </p>
                      <FormMessage />
                    </FormItem>
                  );
                }}
              />
            )}

            <FormField
              control={form.control}
              name="unitId"
              render={({ field }) => {
                const selectedUnit = units.find(u => u.id === field.value);
                return (
                  <FormItem>
                    <FormLabel>Unit (Optional)</FormLabel>
                    <Select
                      onValueChange={(value) => field.onChange(value === 'none' ? null : Number(value))}
                      value={field.value ? field.value.toString() : 'none'}
                    >
                      <FormControl>
                        <SelectTrigger className="w-full">
                          <SelectValue placeholder="Select unit">
                            {field.value === null || field.value === undefined ? (
                              <span className="text-muted-foreground italic">None</span>
                            ) : (
                              selectedUnit ? `${selectedUnit.name} (${selectedUnit.code})` : 'Select unit'
                            )}
                          </SelectValue>
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="none">
                          <span className="text-muted-foreground italic">None</span>
                        </SelectItem>
                        {units.map((unit) => (
                          <SelectItem key={unit.id} value={unit.id.toString()}>
                            <div className="flex flex-col py-1">
                              <span className="font-medium">{unit.name}</span>
                              <span className="text-xs text-muted-foreground">{unit.code}</span>
                            </div>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                );
              }}
            />

            <FormField
              control={form.control}
              name="phone"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Phone (Optional)</FormLabel>
                  <FormControl>
                    <Input {...field} value={field.value || ''} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="isActive"
              render={({ field }) => (
                <FormItem className="flex items-center justify-between rounded-lg border p-4">
                  <div className="space-y-0.5">
                    <FormLabel className="text-base">Active Status</FormLabel>
                    <div className="text-sm text-muted-foreground">
                      {field.value ? 'User can access the system' : 'User cannot access the system'}
                    </div>
                  </div>
                  <FormControl>
                    <Switch
                      checked={field.value}
                      onCheckedChange={field.onChange}
                      disabled={isCurrentUser}
                    />
                  </FormControl>
                </FormItem>
              )}
            />

            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => onOpenChange(false)}
                disabled={isLoading}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={isLoading}>
                {isLoading ? 'Saving...' : 'Save Changes'}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
