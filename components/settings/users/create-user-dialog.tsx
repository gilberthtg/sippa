'use client';

import { useState } from 'react';
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
import { createUser } from '@/app/actions/user-management';
import { toast } from 'sonner';

const createUserSchema = z.object({
  name: z.string().min(1, 'Name is required').max(200, 'Name too long'),
  email: z.string().email('Invalid email format'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
  roleId: z.number().refine(val => !!val, { message: 'Role is required' }),
  developerRoleId: z.number().nullable(),
  unitId: z.number().nullable(),
  phone: z.string().max(50, 'Phone too long').nullable(),
}).refine((data) => {
  // If role is DEVELOPER (roleId 3), developerRoleId must be provided
  // We'll validate this in the component based on roleCode
  return true;
}, {
  message: 'Developer role is required when role is Developer',
  path: ['developerRoleId'],
});

type CreateUserForm = z.infer<typeof createUserSchema>;

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
  roles: Role[];
  units: Unit[];
  developerRoles: DeveloperRole[];
};

export function CreateUserDialog({ open, onOpenChange, roles, units, developerRoles }: Props) {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);

  const form = useForm<CreateUserForm>({
    resolver: zodResolver(createUserSchema),
    mode: 'onChange', // Enable onChange mode for better reactivity
    defaultValues: {
      name: '',
      email: '',
      password: '',
      roleId: 0, // Changed from undefined to 0 to prevent controlled/uncontrolled warning
      developerRoleId: null,
      unitId: null,
      phone: null,
    },
  });

  // Watch roleId to determine if developer role should be shown
  const selectedRoleId = form.watch('roleId');
  const selectedRole = roles.find(r => r.id === selectedRoleId);
  const isDeveloperRole = selectedRole?.code?.toLowerCase() === 'developer';

  const onSubmit = async (data: CreateUserForm) => {
    // Validate role selection
    if (!data.roleId || data.roleId === 0) {
      toast.error('Please select a role');
      return;
    }

    // Validate developer role requirement
    if (isDeveloperRole && !data.developerRoleId) {
      toast.error('Developer role is required when role is Developer');
      return;
    }

    setIsLoading(true);

    try {
      await createUser(data);
      toast.success('User created successfully');
      onOpenChange(false);
      form.reset();
      router.refresh();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Failed to create user');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="min-w-[50vw] max-w-6xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Create New User</DialogTitle>
          <DialogDescription>Add a new user to the system</DialogDescription>
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
                    <Input placeholder="John Doe" {...field} />
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
                    <Input type="email" placeholder="john@example.com" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="password"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Password</FormLabel>
                  <FormControl>
                    <Input type="password" placeholder="••••••••" {...field} />
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
                      value={field.value > 0 ? field.value.toString() : ''}
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
                        value={field.value?.toString()}
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
                    <Input
                      placeholder="+62 812 3456 7890"
                      {...field}
                      value={field.value || ''}
                    />
                  </FormControl>
                  <FormMessage />
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
                {isLoading ? 'Creating...' : 'Create User'}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
