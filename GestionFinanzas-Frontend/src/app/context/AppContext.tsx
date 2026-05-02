import { createContext, useContext, useState, ReactNode } from 'react';
import { Categoria } from '../data/categorias';
import { Transaccion } from '../data/transacciones';

interface AppContextType {
  categorias: Categoria[];
  transacciones: Transaccion[];
  ingresos: Transaccion[];
  gastos: Transaccion[];
  categoriasIngreso: Categoria[];
  categoriasGasto: Categoria[];
  balanceTotal: number;
  agregarIngreso: (ingreso: Omit<Transaccion, 'id'>) => void;
  agregarGasto: (gasto: Omit<Transaccion, 'id'>) => void;
  agregarCategoria: (categoria: Omit<Categoria, 'id'>) => void;
  eliminarCategoria: (id: string) => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

interface AppProviderProps {
  children: ReactNode;
  userId: string;
}

export function AppProvider({ children, userId }: AppProviderProps) {
  // Claves de localStorage con scope por usuario
  const claveTransacciones = `app_transacciones_${userId}`;
  const claveCategorias = `app_categorias_${userId}`;

  const [transacciones, setTransacciones] = useState<Transaccion[]>(() => {
    try {
      const guardadas = localStorage.getItem(claveTransacciones);
      return guardadas ? JSON.parse(guardadas) : [];
    } catch {
      return [];
    }
  });

  const [categorias, setCategorias] = useState<Categoria[]>(() => {
    try {
      const guardadas = localStorage.getItem(claveCategorias);
      return guardadas ? JSON.parse(guardadas) : [];
    } catch {
      return [];
    }
  });

  const ingresos = transacciones.filter((t) => t.tipo === 'ingreso');
  const gastos = transacciones.filter((t) => t.tipo === 'gasto');
  const categoriasIngreso = categorias.filter((c) => c.tipo === 'ingreso');
  const categoriasGasto = categorias.filter((c) => c.tipo === 'gasto');

  const totalIngresos = ingresos.reduce((sum, t) => sum + t.monto, 0);
  const totalGastos = gastos.reduce((sum, t) => sum + t.monto, 0);
  const balanceTotal = totalIngresos - totalGastos;

  const agregarIngreso = (ingreso: Omit<Transaccion, 'id'>) => {
    const nueva: Transaccion = { ...ingreso, id: `i-${Date.now()}` };
    const nuevas = [nueva, ...transacciones];
    setTransacciones(nuevas);
    localStorage.setItem(claveTransacciones, JSON.stringify(nuevas));
  };

  const agregarGasto = (gasto: Omit<Transaccion, 'id'>) => {
    const nueva: Transaccion = { ...gasto, id: `g-${Date.now()}` };
    const nuevas = [nueva, ...transacciones];
    setTransacciones(nuevas);
    localStorage.setItem(claveTransacciones, JSON.stringify(nuevas));
  };

  const agregarCategoria = (categoria: Omit<Categoria, 'id'>) => {
    const nueva: Categoria = { ...categoria, id: `cat-${Date.now()}` };
    const nuevas = [...categorias, nueva];
    setCategorias(nuevas);
    localStorage.setItem(claveCategorias, JSON.stringify(nuevas));
  };

  const eliminarCategoria = (id: string) => {
    const nuevas = categorias.filter((c) => c.id !== id);
    setCategorias(nuevas);
    localStorage.setItem(claveCategorias, JSON.stringify(nuevas));
  };

  return (
    <AppContext.Provider
      value={{
        categorias,
        transacciones,
        ingresos,
        gastos,
        categoriasIngreso,
        categoriasGasto,
        balanceTotal,
        agregarIngreso,
        agregarGasto,
        agregarCategoria,
        eliminarCategoria,
      }}
    >
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  const context = useContext(AppContext);
  if (!context) throw new Error('useApp debe ser usado dentro de AppProvider');
  return context;
}