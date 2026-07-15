import { z } from 'zod';
import { 
  insertAppSchema, 
  insertScreenSchema, 
  insertComponentSchema, 
  insertDataEntrySchema,
  apps,
  screens,
  components,
  dataEntries,
  users
} from './schema';

export const errorSchemas = {
  validation: z.object({
    message: z.string(),
    field: z.string().optional(),
  }),
  notFound: z.object({
    message: z.string(),
  }),
  internal: z.object({
    message: z.string(),
  }),
  unauthorized: z.object({
    message: z.string(),
  }),
};

export const api = {
  apps: {
    list: {
      method: 'GET' as const,
      path: '/api/AppEntity' as const,
      responses: {
        200: z.array(z.custom<typeof apps.$inferSelect & { owner: typeof users.$inferSelect }>()),
      },
    },
    create: {
      method: 'POST' as const,
      path: '/api/AppEntity' as const,
      input: insertAppSchema,
      responses: {
        201: z.custom<typeof apps.$inferSelect>(),
        400: errorSchemas.validation,
        401: errorSchemas.unauthorized,
      },
    },
    get: {
      method: 'GET' as const,
      path: '/api/AppEntity/:id' as const,
      responses: {
        200: z.custom<typeof apps.$inferSelect>(),
        404: errorSchemas.notFound,
      },
    },
    update: {
      method: 'PUT' as const,
      path: '/api/AppEntity/:id' as const,
      input: insertAppSchema.partial(),
      responses: {
        200: z.custom<typeof apps.$inferSelect>(),
        400: errorSchemas.validation,
        404: errorSchemas.notFound,
        401: errorSchemas.unauthorized,
      },
    },
    delete: {
      method: 'DELETE' as const,
      path: '/api/AppEntity/:id' as const,
      responses: {
        204: z.void(),
        404: errorSchemas.notFound,
        401: errorSchemas.unauthorized,
      },
    },
    publish: {
      method: 'POST' as const,
      path: '/api/AppEntity/:id/publish' as const,
      responses: {
        200: z.custom<typeof apps.$inferSelect>(),
        404: errorSchemas.notFound,
        401: errorSchemas.unauthorized,
      },
    },
    unpublish: {
      method: 'POST' as const,
      path: '/api/AppEntity/:id/unpublish' as const,
      responses: {
        200: z.custom<typeof apps.$inferSelect>(),
        404: errorSchemas.notFound,
        401: errorSchemas.unauthorized,
      },
    },
    published: {
      method: 'GET' as const,
      path: '/api/AppEntity' as const,
      responses: {
        200: z.array(z.custom<typeof apps.$inferSelect & { owner: typeof users.$inferSelect }>()),
      },
    },
    public: {
      method: 'GET' as const,
      path: '/api/AppEntity/public/:publicLink' as const,
      responses: {
        200: z.custom<typeof apps.$inferSelect>(),
        404: errorSchemas.notFound,
      },
    },
  },
  screens: {
    list: {
      method: 'GET' as const,
      path: '/api/screens' as const,
      responses: {
        200: z.array(z.custom<typeof screens.$inferSelect>()),
      },
    },
    get: {
      method: 'GET' as const,
      path: '/api/screens/:id' as const,
      responses: {
        200: z.custom<typeof screens.$inferSelect>(),
        404: errorSchemas.notFound,
      },
    },
    create: {
      method: 'POST' as const,
      path: '/api/screens' as const,
      input: insertScreenSchema.omit({ appId: true }),
      responses: {
        201: z.custom<typeof screens.$inferSelect>(),
        400: errorSchemas.validation,
        401: errorSchemas.unauthorized,
      },
    },
    update: {
      method: 'PUT' as const,
      path: '/api/screens/:id' as const,
      input: insertScreenSchema.partial().omit({ appId: true }),
      responses: {
        200: z.custom<typeof screens.$inferSelect>(),
        400: errorSchemas.validation,
        404: errorSchemas.notFound,
        401: errorSchemas.unauthorized,
      },
    },
    delete: {
      method: 'DELETE' as const,
      path: '/api/screens/:id' as const,
      responses: {
        204: z.void(),
        404: errorSchemas.notFound,
        401: errorSchemas.unauthorized,
      },
    },
  },
  components: {
    list: {
      method: 'GET' as const,
      path: '/api/Component' as const,
      responses: {
        200: z.array(z.custom<typeof components.$inferSelect>()),
      },
    },
    get: {
      method: 'GET' as const,
      path: '/api/Component/:id' as const,
      responses: {
        200: z.custom<typeof components.$inferSelect>(),
        404: errorSchemas.notFound,
      },
    },
    create: {
      method: 'POST' as const,
      path: '/api/Component' as const,
      input: insertComponentSchema.omit({ screenId: true }),
      responses: {
        201: z.custom<typeof components.$inferSelect>(),
        400: errorSchemas.validation,
        401: errorSchemas.unauthorized,
      },
    },
    update: {
      method: 'PUT' as const,
      path: '/api/Component/:id' as const,
      input: insertComponentSchema.partial().omit({ screenId: true }),
      responses: {
        200: z.custom<typeof components.$inferSelect>(),
        400: errorSchemas.validation,
        404: errorSchemas.notFound,
        401: errorSchemas.unauthorized,
      },
    },
    delete: {
      method: 'DELETE' as const,
      path: '/api/Component/:id' as const,
      responses: {
        204: z.void(),
        404: errorSchemas.notFound,
        401: errorSchemas.unauthorized,
      },
    },
  },
  dataEntries: {
    list: {
      method: 'GET' as const,
      path: '/api/DataEntry' as const,
      responses: {
        200: z.array(z.custom<typeof dataEntries.$inferSelect>()),
      },
    },
    get: {
      method: 'GET' as const,
      path: '/api/DataEntry/:id' as const,
      responses: {
        200: z.custom<typeof dataEntries.$inferSelect>(),
        404: errorSchemas.notFound,
      },
    },
    create: {
      method: 'POST' as const,
      path: '/api/DataEntry' as const,
      input: insertDataEntrySchema.omit({ appId: true, screenId: true }),
      responses: {
        201: z.custom<typeof dataEntries.$inferSelect>(),
        400: errorSchemas.validation,
        401: errorSchemas.unauthorized,
      },
    },
    update: {
      method: 'PUT' as const,
      path: '/api/DataEntry/:id' as const,
      input: insertDataEntrySchema.partial().omit({ appId: true, screenId: true }),
      responses: {
        200: z.custom<typeof dataEntries.$inferSelect>(),
        400: errorSchemas.validation,
        404: errorSchemas.notFound,
        401: errorSchemas.unauthorized,
      },
    },
    delete: {
      method: 'DELETE' as const,
      path: '/api/DataEntry/:id' as const,
      responses: {
        204: z.void(),
        404: errorSchemas.notFound,
        401: errorSchemas.unauthorized,
      },
    },
  },
};

export function buildUrl(path: string, params?: Record<string, string | number>): string {
  let url = path;
  if (params) {
    Object.entries(params).forEach(([key, value]) => {
      if (url.includes(`:${key}`)) {
        url = url.replace(`:${key}`, String(value));
      }
    });
  }
  return url;
}
