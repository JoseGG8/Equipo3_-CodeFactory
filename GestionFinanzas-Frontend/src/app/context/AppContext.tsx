import React, { createContext, useContext, useEffect, useMemo, useState, ReactNode } from 'react';
import { Categoria } from '../data/categorias';
import { Transaccion } from '../data/transacciones';
import { listarCategoriasApi, obtenerHistoricoTransaccionesApi } from '../services/api';

export interface Presupuesto {
  id: string;
  monto: number;
  mes: string; // YYYY-MM
}

interface AppContextType {
  categorias: Categoria[];
  transacciones: Transaccion[];
  ingresos: Transaccion[];
  gastos: Transaccion[];
  categoriasIngreso: Categoria[];
  categoriasGasto: Categoria[];
  balanceTotal: number;
  presupuestos: Presupuesto[];
  agregarIngreso: (ingreso: Omit<Transaccion, 'id'>) => void;
  agregarGasto: (gasto: Omit<Transaccion, 'id'>) => void;
  agregarCategoria: (categoria: Omit<Categoria, 'id'>) => void;
  eliminarCategoria: (id: string) => void;
  agregarPresupuesto: (presupuesto: Omit<Presupuesto, 'id'>) => void;
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
  const clavePresupuestos = `app_presupuestos_${userId}`;

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

  const [presupuestos, setPresupuestos] = useState<Presupuesto[]>(() => {
    try {
      const guardados = localStorage.getItem(clavePresupuestos);
      return guardados ? JSON.parse(guardados) : [];
    } catch {
      return [];
    }
  });

  useEffect(() => {
    let cancelado = false;
    (async () => {
      try {
        const cats = await listarCategoriasApi();
        if (cancelado) return;
        const mapeadas: Categoria[] = cats.map((c) => ({
          id: String(c.id),
          nombre: c.nombre,
          tipo: String(c.tipo).toLowerCase() === 'gasto' ? 'gasto' : 'ingreso',
        }));
        setCategorias(mapeadas);
        localStorage.setItem(claveCategorias, JSON.stringify(mapeadas));
      } catch {
        // Si falla el backend, dejamos lo que haya en localStorage (sin romper UI)
      }
    })();
    return () => {
      cancelado = true;
    };
  }, [claveCategorias]);

  useEffect(() => {
    // Si el userId es inválido (p.ej. aún no restauró sesión), no consultamos backend.
    const idNum = Number(userId);
    if (!Number.isFinite(idNum) || idNum <= 0) return;
    // Esperar a que las categorías estén cargadas antes de cargar transacciones
    if (categorias.length === 0) return;

    let cancelado = false;
    (async () => {
      try {
        // Cargamos un rango amplio para no “vaciar” historiales.
        const hist = await obtenerHistoricoTransaccionesApi({
          userId: idNum,
          inicioYmd: '2000-01-01',
          finYmd: '2099-12-31',
        });
        if (cancelado) return;

        const normalizadas: Transaccion[] = hist.map((t) => {
          const fechaYmd = String(t.fecha).slice(0, 10);
          const catId = String(t.categoria?.id ?? '');
          // Intentar encontrar el nombre de la categoría en las categorías cargadas
          const catNombre = categorias.find(c => c.id === catId)?.nombre ?? catId;
          return {
            id: String(t.id),
            monto: t.monto,
            fecha: fechaYmd,
            categoriaId: catId,
            categoriaNombre: catNombre,
            descripcion: t.descripcion ?? '',
            tipo: t.tipo === 'GASTO' ? 'gasto' : 'ingreso',
          };
        });

        setTransacciones(normalizadas);
        localStorage.setItem(claveTransacciones, JSON.stringify(normalizadas));
      } catch {
        // Si falla el backend, dejamos localStorage tal cual (sin romper UI).
      }
    })();

    return () => {
      cancelado = true;
    };
  }, [claveTransacciones, userId, categorias]);

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

  const agregarPresupuesto = (presupuesto: Omit<Presupuesto, 'id'>) => {
    // Si ya existe un presupuesto para ese mes, lo actualizamos. Si no, lo agregamos.
    const existentes = presupuestos.filter(p => p.mes !== presupuesto.mes);
    const nueva: Presupuesto = { ...presupuesto, id: `pres-${Date.now()}` };
    const nuevas = [...existentes, nueva];
    setPresupuestos(nuevas);
    localStorage.setItem(clavePresupuestos, JSON.stringify(nuevas));
  };

  const categoriasPorId = useMemo(() => {
    const m: Record<string, string> = {};
    categorias.forEach((c) => {
      m[c.id] = c.nombre;
    });
    return m;
  }, [categorias]);

  const transaccionesEnriquecidas = useMemo(() => {
    return transacciones.map((t) => ({
      ...t,
      categoriaNombre: categoriasPorId[t.categoriaId] ?? t.categoriaNombre,
    }));
  }, [transacciones, categoriasPorId]);

  const ingresosEnriquecidos = useMemo(
    () => transaccionesEnriquecidas.filter((t) => t.tipo === 'ingreso'),
    [transaccionesEnriquecidas]
  );
  const gastosEnriquecidos = useMemo(
    () => transaccionesEnriquecidas.filter((t) => t.tipo === 'gasto'),
    [transaccionesEnriquecidas]
  );

  const contextValue = useMemo(
    () => ({
      categorias,
      transacciones: transaccionesEnriquecidas,
      ingresos: ingresosEnriquecidos,
      gastos: gastosEnriquecidos,
      categoriasIngreso,
      categoriasGasto,
      balanceTotal,
      presupuestos,
      agregarIngreso,
      agregarGasto,
      agregarCategoria,
      eliminarCategoria,
      agregarPresupuesto,
    }),
    [
      categorias,
      transaccionesEnriquecidas,
      ingresosEnriquecidos,
      gastosEnriquecidos,
      categoriasIngreso,
      categoriasGasto,
      balanceTotal,
      presupuestos,
    ]
  );

  return (
    <AppContext.Provider
      value={contextValue}
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