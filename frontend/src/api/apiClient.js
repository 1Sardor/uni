const API_BASE = import.meta.env.VITE_API_URL || "http://localhost:8000/api";

const TOKEN_KEY = "unilink_access_token";
const REFRESH_KEY = "unilink_refresh_token";

function getToken() {
  return localStorage.getItem(TOKEN_KEY);
}

function setTokens({ access_token, refresh_token } = {}) {
  if (access_token) localStorage.setItem(TOKEN_KEY, access_token);
  if (refresh_token) localStorage.setItem(REFRESH_KEY, refresh_token);
}

function clearTokens() {
  localStorage.removeItem(TOKEN_KEY);
  localStorage.removeItem(REFRESH_KEY);
}

async function request(path, { method = "GET", body, formData, params } = {}) {
  let url = `${API_BASE}${path}`;
  if (params) {
    const qs = new URLSearchParams(
      Object.entries(params).filter(([, v]) => v !== undefined && v !== null && v !== "")
    ).toString();
    if (qs) url += `?${qs}`;
  }

  const headers = {};
  if (!formData) headers["Content-Type"] = "application/json";
  const token = getToken();
  if (token) headers.Authorization = `Bearer ${token}`;

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 15000);

  let res;
  try {
    res = await fetch(url, {
      method,
      headers,
      body: formData || (body !== undefined ? JSON.stringify(body) : undefined),
      signal: controller.signal,
    });
  } catch (err) {
    if (err.name === "AbortError") {
      throw { status: 0, message: "Request timed out. Please try again." };
    }
    throw { status: 0, message: "Network error. Please check your connection." };
  } finally {
    clearTimeout(timeoutId);
  }

  if (res.status === 204) return null;

  let data = null;
  try {
    data = await res.json();
  } catch {
    data = null;
  }

  if (!res.ok) {
    const message =
      data?.message || data?.detail || (typeof data === "object" && data ? Object.values(data)[0] : null) || "Request failed";
    throw { status: res.status, message: Array.isArray(message) ? message[0] : message };
  }

  return data;
}

function makeRestEntity(path, { sortMap = {}, filterMap = {}, toApi = (x) => x, fromApi = (x) => x } = {}) {
  const mapSort = (sort) => {
    if (!sort) return undefined;
    const desc = sort.startsWith("-");
    const field = desc ? sort.slice(1) : sort;
    const mapped = sortMap[field] || field;
    return desc ? `-${mapped}` : mapped;
  };

  const mapFilter = (filter = {}) => {
    const params = {};
    for (const [key, value] of Object.entries(filter)) {
      const mappedKey = filterMap[key] || key;
      params[mappedKey] = value;
    }
    return params;
  };

  return {
    async get(id) {
      const data = await request(`${path}${id}/`);
      return fromApi(data);
    },
    async list(sort, limit) {
      const params = {};
      const mappedSort = mapSort(sort);
      if (mappedSort) params.sort = mappedSort;
      if (limit) params.limit = limit;
      const data = await request(path, { params });
      return (Array.isArray(data) ? data : data.results || []).map(fromApi);
    },
    async filter(filter = {}) {
      const data = await request(path, { params: mapFilter(filter) });
      return (Array.isArray(data) ? data : data.results || []).map(fromApi);
    },
    async create(data) {
      const created = await request(path, { method: "POST", body: toApi(data) });
      return fromApi(created);
    },
    async update(id, data) {
      const updated = await request(`${path}${id}/`, { method: "PATCH", body: toApi(data) });
      return fromApi(updated);
    },
    async delete(id) {
      await request(`${path}${id}/`, { method: "DELETE" });
    },
  };
}

const discountEntity = makeRestEntity("/discounts/", {
  filterMap: { restaurant_id: "place_id" },
  toApi: ({ restaurant_id, ...rest }) => (restaurant_id !== undefined ? { ...rest, place: restaurant_id } : rest),
  fromApi: ({ place, ...rest }) => ({ ...rest, place, restaurant_id: place }),
});
discountEntity.claim = async (id, token) => request(`/discounts/${id}/claim/`, { method: "POST", body: { token } });

const claimedDiscountEntity = makeRestEntity("/claimed-discounts/", {
  sortMap: { created_date: "created_at" },
  toApi: ({ discount_id, ...rest }) => (discount_id !== undefined ? { ...rest, discount: discount_id } : rest),
  fromApi: (record) => ({ ...record, created_date: record.created_at }),
});

const studentProfileEntity = (() => {
  const base = makeRestEntity("/student-profiles/");
  const toFormData = (data) => {
    const fd = new FormData();
    Object.entries(data).forEach(([key, value]) => {
      if (value === undefined || value === null) return;
      if (key === "student_card_image" && !(value instanceof File)) return;
      fd.append(key, value);
    });
    return fd;
  };
  return {
    ...base,
    async filter() {
      return base.list();
    },
    async create(data) {
      return request("/student-profiles/", { method: "POST", formData: toFormData(data) });
    },
    async update(id, data) {
      return request(`/student-profiles/${id}/`, { method: "PATCH", formData: toFormData(data) });
    },
    async verify(token) {
      return request(`/student-profiles/verify/${token}/`);
    },
  };
})();

const partnerToApi = ({ businessName, contactName, ...rest }) => ({
  ...rest,
  business_name: businessName,
  contact_name: contactName,
});
const partnerFromApi = ({ business_name, contact_name, ...rest }) => ({
  ...rest,
  business_name,
  contact_name,
  businessName: business_name,
  contactName: contact_name,
});

const partnerEntity = (() => {
  const base = makeRestEntity("/partners/", { toApi: partnerToApi, fromApi: partnerFromApi });
  return {
    ...base,
    async me() {
      const data = await request("/partners/me/");
      return partnerFromApi(data);
    },
    async updateMe(data) {
      const updated = await request("/partners/me/", { method: "PATCH", body: partnerToApi(data) });
      return partnerFromApi(updated);
    },
    async uploadImage(file) {
      const formData = new FormData();
      formData.append("image", file);
      return request("/partners/upload_image/", { method: "POST", formData });
    },
    async stats() {
      return request("/partners/stats/");
    },
  };
})();

const GIFT_LS_KEY = "unilink_gift_vouchers_v1";

function loadGifts() {
  try {
    const raw = localStorage.getItem(GIFT_LS_KEY);
    if (raw) return JSON.parse(raw);
  } catch {}
  return [];
}

function saveGifts(list) {
  localStorage.setItem(GIFT_LS_KEY, JSON.stringify(list));
}

const giftVoucherEntity = {
  async get(id) {
    return loadGifts().find((g) => g.id === id) || null;
  },
  async list(sort, limit) {
    let items = [...loadGifts()];
    if (sort) {
      const desc = sort.startsWith("-");
      const field = desc ? sort.slice(1) : sort;
      items.sort((a, b) => {
        const av = a[field] ?? "";
        const bv = b[field] ?? "";
        if (av < bv) return desc ? 1 : -1;
        if (av > bv) return desc ? -1 : 1;
        return 0;
      });
    }
    if (limit) items = items.slice(0, limit);
    return items;
  },
  async filter(filter = {}) {
    return loadGifts().filter((item) =>
      Object.entries(filter).every(([key, value]) => item[key] === value)
    );
  },
  async create(data) {
    const list = loadGifts();
    const record = {
      id: Math.random().toString(36).slice(2) + Date.now().toString(36),
      created_date: new Date().toISOString(),
      status: "sent",
      ...data,
    };
    list.push(record);
    saveGifts(list);
    return record;
  },
  async update(id, data) {
    const list = loadGifts().map((item) => (item.id === id ? { ...item, ...data } : item));
    saveGifts(list);
    return list.find((item) => item.id === id);
  },
  async delete(id) {
    saveGifts(loadGifts().filter((item) => item.id !== id));
  },
};

export const api = {
  auth: {
    async me() {
      if (!getToken()) throw { status: 401, message: "Not authenticated" };
      return request("/auth/me/");
    },
    async loginWithTelegram(code) {
      const result = await request("/auth/telegram/verify/", {
        method: "POST",
        body: { code },
      });
      setTokens(result);
      return result.user;
    },
    async businessLogin(email, password) {
      const result = await request("/auth/business/login/", {
        method: "POST",
        body: { email, password },
      });
      setTokens(result);
      return result.user;
    },
    setToken(accessToken) {
      setTokens({ access_token: accessToken });
    },
    logout(redirectTo) {
      clearTokens();
      if (redirectTo) window.location.href = redirectTo;
    },
    redirectToLogin() {
      window.location.href = "/login";
    },
  },
  entities: {
    Restaurant: makeRestEntity("/places/"),
    Category: makeRestEntity("/categories/"),
    Discount: discountEntity,
    CampusEvent: makeRestEntity("/events/"),
    ClaimedDiscount: claimedDiscountEntity,
    GiftVoucher: giftVoucherEntity,
    StudentProfile: studentProfileEntity,
    Partner: partnerEntity,
  },
};
