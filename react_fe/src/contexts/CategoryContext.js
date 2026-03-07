import React, {
  createContext,
  useContext,
  useEffect,
  useState,
  useCallback,
} from 'react';
import CategoryService from 'services/CategoryService';
import { useAppToast } from 'utils/ToastHelper';

const CategoryContext = createContext();

export const CategoryProvider = ({ children }) => {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(false);
  const toast = useAppToast();

  const fetchCategories = useCallback(async () => {
    setLoading(true);
    try {
      const { data } = await CategoryService.getAll({ page: 0, size: 200 });
      setCategories(data.content || []);
    } catch (err) {
      console.error(err);
      toast.error('Failed to load categories');
    } finally {
      setLoading(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    fetchCategories();
  }, [fetchCategories]);

  return (
    <CategoryContext.Provider
      value={{
        categories,
        loading,
        refreshCategories: fetchCategories,
      }}
    >
      {children}
    </CategoryContext.Provider>
  );
};

export const useCategories = () => useContext(CategoryContext);
