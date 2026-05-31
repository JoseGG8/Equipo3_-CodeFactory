import { useState } from 'react';
import { Tag, Layers, Plus } from 'lucide-react';
import { toast } from 'sonner';

interface FormularioCategoriaProps {
  onAgregarCategoria: (categoria: { nombre: string; tipo: string }) => void | Promise<void>;
}

export function FormularioCategoria({ onAgregarCategoria }: FormularioCategoriaProps) {
  const [nombre, setNombre] = useState('');
  const [tipo, setTipo] = useState<'INGRESO' | 'GASTO' | ''>('');
  const [enviando, setEnviando] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!nombre.trim()) {
      toast.error('Error de validación', {
        description: 'El nombre de la categoría es obligatorio'
      });
      return;
    }

    if (!tipo) {
      toast.error('Error de validación', {
        description: 'Debe seleccionar un tipo de categoría'
      });
      return;
    }

    setEnviando(true);
    try {
      await Promise.resolve(
        onAgregarCategoria({
          nombre: nombre.trim(),
          tipo
        })
      );
      setNombre('');
      setTipo('');
    } catch {
      // El padre ya mostró el error
    } finally {
      setEnviando(false);
    }
  };

  return (
    null
  );
}
