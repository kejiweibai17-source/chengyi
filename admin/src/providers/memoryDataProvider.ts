import type {
  BaseRecord,
  CreateParams,
  DataProvider,
  DeleteOneParams,
  GetListParams,
  GetManyParams,
  GetOneParams,
  UpdateParams,
} from "@refinedev/core";
import { seedDatabase } from "../data/seed";

type Store = Record<string, BaseRecord[]>;

const store: Store = seedDatabase();

function clone<T>(value: T): T {
  return JSON.parse(JSON.stringify(value)) as T;
}

function nextId(resource: string): number {
  const rows = store[resource] ?? [];
  const max = rows.reduce((acc, row) => {
    const id = Number(row.id);
    return Number.isFinite(id) ? Math.max(acc, id) : acc;
  }, 0);
  return max + 1;
}

function matchesFilter(row: BaseRecord, field: string, operator: string | undefined, value: unknown) {
  const current = row[field];
  if (value === undefined || value === null || value === "") return true;

  switch (operator) {
    case "eq":
    case undefined:
      return String(current) === String(value);
    case "contains":
      return String(current ?? "")
        .toLowerCase()
        .includes(String(value).toLowerCase());
    case "in":
      return Array.isArray(value) ? value.map(String).includes(String(current)) : true;
    default:
      return String(current) === String(value);
  }
}

export const memoryDataProvider = {
  getList: async ({ resource, pagination, filters, sorters }: GetListParams) => {
    let data = clone(store[resource] ?? []);

    if (filters?.length) {
      data = data.filter((row) =>
        filters.every((filter) => {
          if (!("field" in filter)) return true;
          return matchesFilter(row, filter.field, filter.operator, filter.value);
        }),
      );
    }

    if (sorters?.length) {
      const { field, order } = sorters[0];
      data.sort((a, b) => {
        const left = a[field];
        const right = b[field];
        if (left === right) return 0;
        if (left == null) return 1;
        if (right == null) return -1;
        const compare = left > right ? 1 : -1;
        return order === "desc" ? -compare : compare;
      });
    }

    const current = pagination?.currentPage ?? 1;
    const pageSize = pagination?.pageSize ?? 10;
    const start = (current - 1) * pageSize;
    const end = start + pageSize;

    return {
      data: data.slice(start, end),
      total: data.length,
    };
  },

  getOne: async ({ resource, id }: GetOneParams) => {
    const row = (store[resource] ?? []).find((item) => String(item.id) === String(id));
    if (!row) {
      return Promise.reject(new Error(`${resource} #${id} not found`));
    }
    return { data: clone(row) };
  },

  getMany: async ({ resource, ids }: GetManyParams) => {
    const data = (store[resource] ?? []).filter((item) =>
      ids.map(String).includes(String(item.id)),
    );
    return { data: clone(data) };
  },

  create: async ({ resource, variables }: CreateParams) => {
    const id = nextId(resource);
    const row = {
      ...(variables as BaseRecord),
      id,
    };
    store[resource] = [...(store[resource] ?? []), row];
    return { data: clone(row) };
  },

  update: async ({ resource, id, variables }: UpdateParams) => {
    const rows = store[resource] ?? [];
    const index = rows.findIndex((item) => String(item.id) === String(id));
    if (index < 0) {
      return Promise.reject(new Error(`${resource} #${id} not found`));
    }
    const row = {
      ...rows[index],
      ...(variables as BaseRecord),
      id: rows[index].id,
    };
    rows[index] = row;
    store[resource] = rows;
    return { data: clone(row) };
  },

  deleteOne: async ({ resource, id }: DeleteOneParams) => {
    const rows = store[resource] ?? [];
    const index = rows.findIndex((item) => String(item.id) === String(id));
    if (index < 0) {
      return Promise.reject(new Error(`${resource} #${id} not found`));
    }
    const [removed] = rows.splice(index, 1);
    store[resource] = rows;
    return { data: clone(removed) };
  },

  getApiUrl: () => "",
} as DataProvider;
