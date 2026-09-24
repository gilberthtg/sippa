# SiPPA API Conventions

Server action patterns, error handling, and development conventions for SiPPA.

---

## 📋 Table of Contents

- [Architecture Overview](#architecture-overview)
- [Server Actions](#server-actions)
- [Error Handling](#error-handling)
- [Data Validation](#data-validation)
- [Response Patterns](#response-patterns)
- [Authorization](#authorization)
- [Audit Logging](#audit-logging)
- [File Uploads](#file-uploads)
- [Database Queries](#database-queries)

---

## 🏗️ Architecture Overview

SiPPA uses Next.js App Router with:
- **Server Components** - Default for pages
- **Client Components** - For interactive UI (forms, tables)
- **Server Actions** - For mutations and data operations
- **Route Handlers** - For file downloads and special APIs

### File Structure

```
app/
├── actions/              # Server actions (grouped by domain)
│   ├── requests.ts       # Request CRUD operations
│   ├── admin-requests.ts # Admin request management
│   ├── developer-requests.ts # Developer operations
│   ├── master-data.ts    # Priorities, teams, units
│   ├── sla-policies.ts   # SLA configuration
│   ├── user-management.ts # User CRUD
│   ├── notifications.ts  # Notification operations
│   ├── reports.ts        # Laptri and SLA reports
│   └── audit-logs.ts     # Audit log queries
├── api/
│   └── attachments/[id]/download/route.ts # File download
└── (role-group)/
    └── pages.tsx         # Route pages
```

---

## 🔧 Server Actions

### Naming Conventions

Use clear, action-oriented names:

**Good:**
- `createRequest()`
- `approveRequest()`
- `updateProgress()`
- `getRequestById()`
- `getMyRequests()`

**Bad:**
- `request()` - Too vague
- `doSomething()` - Non-descriptive
- `handleForm()` - Implementation detail

### Function Signature Pattern

```typescript
'use server'

import { auth } from '@/lib/auth/config'
import { db } from '@/lib/db'
import { requestSchema } from '@/lib/validations/requests'
import { logAudit } from '@/lib/utils/audit'

export async function createRequest(formData: FormData) {
  try {
    // 1. Authentication check
    const session = await auth()
    if (!session?.user) {
      return { success: false, error: 'Unauthorized' }
    }

    // 2. Extract and validate data
    const rawData = {
      title: formData.get('title'),
      description: formData.get('description'),
      // ...
    }
    
    const validatedData = requestSchema.parse(rawData)

    // 3. Authorization check (if needed)
    if (session.user.roleCode !== 'user') {
      return { success: false, error: 'Only users can submit requests' }
    }

    // 4. Business logic / Database operation
    const result = await db.insert(requests).values({
      ...validatedData,
      requesterId: session.user.id,
      status: 'SUBMITTED'
    }).returning()

    // 5. Side effects (audit, notifications)
    await logAudit({
      actorUserId: session.user.id,
      actorName: session.user.name,
      module: 'requests',
      action: 'create',
      entityType: 'request',
      entityId: result[0].id.toString(),
      afterData: result[0]
    })

    // 6. Return success response
    return { 
      success: true, 
      data: result[0],
      message: 'Request submitted successfully' 
    }

  } catch (error) {
    // 7. Error handling
    console.error('Error creating request:', error)
    
    if (error instanceof z.ZodError) {
      return { 
        success: false, 
        error: 'Validation failed', 
        errors: error.flatten().fieldErrors 
      }
    }
    
    return { 
      success: false, 
      error: 'Failed to create request' 
    }
  }
}
```

### Server Action Checklist

For every server action:

- [ ] Mark with `'use server'` directive
- [ ] Check authentication (`await auth()`)
- [ ] Validate input with Zod schema
- [ ] Check authorization (role/permission)
- [ ] Perform database operation
- [ ] Log to audit trail (for mutations)
- [ ] Handle errors gracefully
- [ ] Return consistent response format

---

## ⚠️ Error Handling

### Response Format

Always return typed response objects:

```typescript
// Success response
type SuccessResponse<T> = {
  success: true
  data?: T
  message?: string
}

// Error response
type ErrorResponse = {
  success: false
  error: string
  errors?: Record<string, string[]> // For validation errors
}

// Union type
type ActionResponse<T> = SuccessResponse<T> | ErrorResponse
```

### Error Categories

**1. Authentication Errors**
```typescript
if (!session?.user) {
  return { success: false, error: 'Unauthorized' }
}
```

**2. Authorization Errors**
```typescript
if (session.user.roleCode !== 'admin') {
  return { success: false, error: 'Insufficient permissions' }
}
```

**3. Validation Errors**
```typescript
try {
  const validated = schema.parse(data)
} catch (error) {
  if (error instanceof z.ZodError) {
    return { 
      success: false, 
      error: 'Validation failed',
      errors: error.flatten().fieldErrors 
    }
  }
}
```

**4. Business Logic Errors**
```typescript
if (request.status === 'COMPLETED') {
  return { 
    success: false, 
    error: 'Cannot modify completed request' 
  }
}
```

**5. Database Errors**
```typescript
try {
  await db.insert(...)
} catch (error) {
  console.error('Database error:', error)
  return { 
    success: false, 
    error: 'Database operation failed' 
  }
}
```

### Client-Side Error Handling

```typescript
'use client'

import { toast } from 'sonner'

async function handleSubmit(formData: FormData) {
  const result = await createRequest(formData)
  
  if (!result.success) {
    // Show error toast
    toast.error(result.error || 'Operation failed')
    
    // Handle field errors
    if (result.errors) {
      Object.entries(result.errors).forEach(([field, messages]) => {
        console.error(`${field}: ${messages.join(', ')}`)
      })
    }
    return
  }
  
  // Success
  toast.success(result.message || 'Operation successful')
  // Redirect or update UI
}
```

---

## ✅ Data Validation

### Zod Schemas

Define validation schemas in `lib/validations/`:

```typescript
// lib/validations/requests.ts
import { z } from 'zod'

export const createRequestSchema = z.object({
  requestType: z.enum(['New Application', 'RFC']),
  title: z.string().min(5).max(200),
  description: z.string().min(20).max(5000),
  urgency: z.enum(['Low', 'Medium', 'High', 'Critical'])
})

export const approveRequestSchema = z.object({
  requestId: z.number().int().positive()
})

export const updateProgressSchema = z.object({
  requestId: z.number().int().positive(),
  progressPercent: z.number().int().min(0).max(100),
  updateNote: z.string().min(10).max(1000)
})
```

### FormData Extraction

```typescript
// Extract from FormData
const rawData = {
  title: formData.get('title') as string,
  description: formData.get('description') as string,
  requestType: formData.get('requestType') as string,
  urgency: formData.get('urgency') as string
}

// Validate
const validated = createRequestSchema.parse(rawData)
```

### Type Inference

```typescript
type CreateRequestInput = z.infer<typeof createRequestSchema>
// Type is automatically: { requestType: "New Application" | "RFC", ... }
```

---

## 📤 Response Patterns

### Standard Patterns

**Create Operation:**
```typescript
return { 
  success: true, 
  data: newRecord,
  message: 'Resource created successfully' 
}
```

**Update Operation:**
```typescript
return { 
  success: true, 
  data: updatedRecord,
  message: 'Resource updated successfully' 
}
```

**Delete Operation:**
```typescript
return { 
  success: true,
  message: 'Resource deleted successfully' 
}
```

**List/Query Operation:**
```typescript
return { 
  success: true, 
  data: records // Array of records
}
```

**Single Record Query:**
```typescript
if (!record) {
  return { success: false, error: 'Resource not found' }
}
return { success: true, data: record }
```

### Pagination Response

```typescript
type PaginatedResponse<T> = {
  success: true
  data: T[]
  pagination: {
    page: number
    pageSize: number
    total: number
    totalPages: number
  }
}
```

---

## 🔐 Authorization

### Role-Based Checks

```typescript
// Check specific role
if (session.user.roleCode !== 'admin') {
  return { success: false, error: 'Admin access required' }
}

// Check multiple allowed roles
const allowedRoles = ['admin', 'developer']
if (!allowedRoles.includes(session.user.roleCode)) {
  return { success: false, error: 'Insufficient permissions' }
}
```

### Resource Ownership

```typescript
// Users can only access their own requests
export async function getMyRequests() {
  const session = await auth()
  if (!session?.user) {
    return { success: false, error: 'Unauthorized' }
  }
  
  const requests = await db.query.requests.findMany({
    where: eq(requests.requesterId, session.user.id)
  })
  
  return { success: true, data: requests }
}
```

### Permission Helper (Future)

```typescript
// lib/permissions/check.ts
export function canApproveRequest(user: User): boolean {
  return user.roleCode === 'admin'
}

export function canUpdateProgress(user: User, request: Request): boolean {
  if (user.roleCode !== 'developer') return false
  // Check if assigned to user
  return request.assignedDeveloperId === user.id
}
```

---

## 📝 Audit Logging

### When to Log

Log all mutations:
- ✅ Create, update, delete operations
- ✅ Status changes (approve, reject, complete)
- ✅ Assignments
- ✅ Authentication events
- ❌ Read operations (too noisy)

### Audit Function

```typescript
import { logAudit } from '@/lib/utils/audit'

// Create
await logAudit({
  actorUserId: session.user.id,
  actorName: session.user.name,
  module: 'requests',
  action: 'create',
  entityType: 'request',
  entityId: newRequest.id.toString(),
  afterData: newRequest
})

// Update
await logAudit({
  actorUserId: session.user.id,
  actorName: session.user.name,
  module: 'requests',
  action: 'approve',
  entityType: 'request',
  entityId: requestId.toString(),
  beforeData: oldRequest,
  afterData: updatedRequest
})

// Delete (deactivate)
await logAudit({
  actorUserId: session.user.id,
  actorName: session.user.name,
  module: 'master-data',
  action: 'deactivate',
  entityType: 'priority',
  entityId: priorityId.toString(),
  beforeData: { isActive: true },
  afterData: { isActive: false }
})
```

### Audit Best Practices

- Fire-and-forget (don't await in critical path)
- Sanitize secrets (passwords, tokens)
- Include entity context
- Use consistent module names
- Log failed auth attempts (actorUserId = null)

---

## 📎 File Uploads

### Upload Pattern

```typescript
export async function uploadAttachment(formData: FormData) {
  const session = await auth()
  if (!session?.user) {
    return { success: false, error: 'Unauthorized' }
  }

  const file = formData.get('file') as File
  if (!file) {
    return { success: false, error: 'No file provided' }
  }

  // Validate
  const MAX_SIZE = 10 * 1024 * 1024 // 10MB
  if (file.size > MAX_SIZE) {
    return { success: false, error: 'File too large (max 10MB)' }
  }

  const ALLOWED_TYPES = ['application/pdf', 'image/jpeg', 'image/png', ...]
  if (!ALLOWED_TYPES.includes(file.type)) {
    return { success: false, error: 'File type not allowed' }
  }

  // Save to disk
  const uploadDir = process.env.UPLOAD_DIR || './uploads'
  const filename = `${Date.now()}-${file.name}`
  const filepath = path.join(uploadDir, filename)

  const buffer = await file.arrayBuffer()
  await writeFile(filepath, Buffer.from(buffer))

  // Save metadata to database
  const attachment = await db.insert(requestAttachments).values({
    requestId,
    originalName: file.name,
    storageKey: filename,
    mimeType: file.type,
    sizeBytes: file.size,
    uploadedBy: session.user.id
  }).returning()

  return { success: true, data: attachment[0] }
}
```

### Download Pattern

```typescript
// app/api/attachments/[id]/download/route.ts
export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  const session = await auth()
  if (!session?.user) {
    return new Response('Unauthorized', { status: 401 })
  }

  const attachment = await db.query.requestAttachments.findFirst({
    where: eq(requestAttachments.id, parseInt(params.id))
  })

  if (!attachment) {
    return new Response('Not found', { status: 404 })
  }

  // Authorization check
  // (verify user can access this request)

  const filepath = path.join(process.env.UPLOAD_DIR!, attachment.storageKey)
  const file = await readFile(filepath)

  return new Response(file, {
    headers: {
      'Content-Type': attachment.mimeType,
      'Content-Disposition': `attachment; filename="${attachment.originalName}"`
    }
  })
}
```

---

## 🗄️ Database Queries

### Drizzle ORM Patterns

**Insert:**
```typescript
const [newRecord] = await db.insert(requests).values({
  title: 'New Request',
  status: 'SUBMITTED'
}).returning()
```

**Update:**
```typescript
const [updated] = await db.update(requests)
  .set({ status: 'APPROVED', approvedAt: new Date() })
  .where(eq(requests.id, requestId))
  .returning()
```

**Delete (Soft):**
```typescript
await db.update(users)
  .set({ isActive: false })
  .where(eq(users.id, userId))
```

**Query with Relations:**
```typescript
const request = await db.query.requests.findFirst({
  where: eq(requests.id, requestId),
  with: {
    requester: true,
    requesterUnit: true,
    priority: true,
    assignments: {
      with: {
        developer: true,
        team: true
      }
    },
    progress: {
      orderBy: (progress, { desc }) => [desc(progress.createdAt)]
    }
  }
})
```

**Filter and Sort:**
```typescript
const requests = await db.query.requests.findMany({
  where: and(
    eq(requests.requesterId, userId),
    eq(requests.status, 'IN_PROGRESS')
  ),
  orderBy: (requests, { desc }) => [desc(requests.submittedAt)]
})
```

---

## 🧪 Testing Server Actions

### Manual Testing

```typescript
// Create test file
// __tests__/actions/requests.test.ts

import { createRequest } from '@/app/actions/requests'

describe('createRequest', () => {
  it('should create request with valid data', async () => {
    const formData = new FormData()
    formData.append('title', 'Test Request')
    formData.append('description', 'This is a test description that is long enough')
    formData.append('requestType', 'New Application')
    formData.append('urgency', 'Medium')

    const result = await createRequest(formData)

    expect(result.success).toBe(true)
    expect(result.data).toBeDefined()
  })

  it('should reject invalid data', async () => {
    const formData = new FormData()
    formData.append('title', 'Too short')
    
    const result = await createRequest(formData)

    expect(result.success).toBe(false)
    expect(result.error).toBeDefined()
  })
})
```

---

## 📚 Additional Resources

- [Next.js Server Actions](https://nextjs.org/docs/app/building-your-application/data-fetching/server-actions-and-mutations)
- [Drizzle ORM Docs](https://orm.drizzle.team/docs/overview)
- [Zod Documentation](https://zod.dev/)
- [NextAuth.js v5](https://authjs.dev/)

---

**Follow these conventions for consistent, maintainable code! 🎯**
