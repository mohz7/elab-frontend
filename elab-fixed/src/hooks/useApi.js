import { useState, useEffect, useCallback } from 'react';

export function useApi(apiFn, deps = [], options = {}) {
  const { immediate = true, initialData = null } = options;
  const [data, setData] = useState(initialData);
  const [loading, setLoading] = useState(immediate);
  const [error, setError] = useState(null);

  const execute = useCallback(async (...args) => {
    setLoading(true);
    setError(null);
    try {
      const res = await apiFn(...args);
      // If the response has a .data property that is the actual payload (ServiceResult)
      // we check if it has its own .data property.
      let result = res.data;
      if (result && typeof result === 'object' && 'data' in result) {
        result = result.data;
      }
      setData(result);
      return result;
    } catch (err) {
      const msg = err.response?.data?.message || err.message || 'Something went wrong';
      setError(msg);
      throw err;
    } finally {
      setLoading(false);
    }
  }, deps); // eslint-disable-line

  useEffect(() => {
    if (immediate) execute();
  }, deps); // eslint-disable-line

  return { data, loading, error, refetch: execute };
}

export function useSubmit(apiFn) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const submit = async (data) => {
    setLoading(true);
    setError(null);
    try {
      const res = await apiFn(data);
      return res.data;
    } catch (err) {
      const msg = err.response?.data?.message || err.message || 'Something went wrong';
      setError(msg);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  return { submit, loading, error };
}
