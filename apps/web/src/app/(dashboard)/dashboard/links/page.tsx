'use client';

import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
  useSortable,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { apiClient } from '@/lib/axios';
import { linkSchema, type LinkFormData } from '@/lib/validations/link';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { FiEdit2, FiTrash2, FiPlus, FiExternalLink } from 'react-icons/fi';
import { MdDragIndicator } from 'react-icons/md';

interface Link {
  id: string;
  title: string;
  url: string;
  description: string | null;
  icon: string | null;
  position: number;
  isActive: boolean;
  clickCount: number;
}

function SortableLink({
  link,
  onEdit,
  onDelete,
}: {
  link: Link;
  onEdit: (link: Link) => void;
  onDelete: (id: string) => void;
}) {
  const { attributes, listeners, setNodeRef, transform, transition } = useSortable({ id: link.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className="flex items-center gap-3 rounded-lg border border-gray-200 bg-white p-4"
    >
      {/* Drag Handle */}
      <button
        {...attributes}
        {...listeners}
        className="cursor-grab text-gray-400 hover:text-gray-600 active:cursor-grabbing"
      >
        <MdDragIndicator size={20} />
      </button>

      {/* Link Info */}
      <div className="flex-1">
        <h3 className="font-medium text-gray-900">{link.title}</h3>
        <a
          href={link.url}
          target="_blank"
          rel="noopener noreferrer"
          className="text-sm text-blue-600 hover:underline flex items-center gap-1 mt-1"
        >
          {link.url.slice(0, 50)}
          {link.url.length > 50 && '...'}
          <FiExternalLink size={12} />
        </a>
        {link.description && <p className="text-sm text-gray-500 mt-1">{link.description}</p>}
      </div>

      {/* Stats */}
      <div className="text-center">
        <p className="text-2xl font-bold text-gray-900">{link.clickCount}</p>
        <p className="text-xs text-gray-500">clicks</p>
      </div>

      {/* Actions */}
      <div className="flex gap-2">
        <Button variant="outline" size="sm" onClick={() => onEdit(link)}>
          <FiEdit2 size={16} />
        </Button>
        <Button variant="destructive" size="sm" onClick={() => onDelete(link.id)}>
          <FiTrash2 size={16} />
        </Button>
      </div>
    </div>
  );
}

export default function LinksPage() {
  const [links, setLinks] = useState<Link[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingLink, setEditingLink] = useState<Link | null>(null);
  const [error, setError] = useState<string | null>(null);

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  );

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    reset,
  } = useForm<LinkFormData>({
    resolver: zodResolver(linkSchema),
  });

  // Cargar links
  useEffect(() => {
    loadLinks();
  }, []);

  const loadLinks = async () => {
    try {
      const response = await apiClient.get('/links');
      setLinks(response.data);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Error al cargar links');
    } finally {
      setLoading(false);
    }
  };

  // Crear/Editar link
  const onSubmit = async (data: LinkFormData) => {
    setError(null);
    try {
      if (editingLink) {
        // Actualizar
        const response = await apiClient.patch(`/links/${editingLink.id}`, data);
        setLinks(links.map(l => (l.id === editingLink.id ? response.data : l)));
      } else {
        // Crear
        const response = await apiClient.post('/links', data);
        setLinks([...links, response.data]);
      }
      setDialogOpen(false);
      reset();
      setEditingLink(null);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Error al guardar link');
    }
  };

  // Eliminar link
  const handleDelete = async (id: string) => {
    if (!window.confirm('¿Eliminar este enlace?')) return;

    try {
      await apiClient.delete(`/links/${id}`);
      setLinks(links.filter(l => l.id !== id));
    } catch (err: any) {
      setError(err.response?.data?.message || 'Error al eliminar link');
    }
  };

  // Editar link
  const handleEdit = (link: Link) => {
    setEditingLink(link);
    reset({
      title: link.title,
      url: link.url,
      description: link.description || '',
      icon: link.icon || '',
    });
    setDialogOpen(true);
  };

  // Nuevo link
  const handleNew = () => {
    setEditingLink(null);
    reset({ title: '', url: '', description: '', icon: '' });
    setDialogOpen(true);
  };

  // Drag & Drop
  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event;

    if (over && active.id !== over.id) {
      const oldIndex = links.findIndex(l => l.id === active.id);
      const newIndex = links.findIndex(l => l.id === over.id);

      const newLinks = arrayMove(links, oldIndex, newIndex);
      setLinks(newLinks);

      // Reordenar en backend
      try {
        await apiClient.patch('/links/reorder', {
          linkIds: newLinks.map(l => l.id),
        });
      } catch (err: any) {
        setError('Error al reordenar. Recargando...');
        loadLinks();
      }
    }
  };

  if (loading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-blue-600 border-t-transparent"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Mis Enlaces</h1>
          <p className="mt-2 text-gray-600">Gestiona tus enlaces y su orden</p>
        </div>
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={handleNew}>
              <FiPlus size={16} className="mr-2" />
              Nuevo Enlace
            </Button>
          </DialogTrigger>
          <DialogContent>
            <form onSubmit={handleSubmit(onSubmit)}>
              <DialogHeader>
                <DialogTitle>{editingLink ? 'Editar Enlace' : 'Nuevo Enlace'}</DialogTitle>
                <DialogDescription>
                  {editingLink
                    ? 'Actualiza la información del enlace'
                    : 'Agrega un nuevo enlace a tu perfil'}
                </DialogDescription>
              </DialogHeader>

              {error && (
                <Alert variant="destructive" className="mb-4">
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}

              <div className="space-y-4">
                <div>
                  <Label htmlFor="title">Título *</Label>
                  <Input id="title" {...register('title')} placeholder="Mi GitHub" />
                  {errors.title && (
                    <p className="mt-1 text-sm text-red-600">{errors.title.message}</p>
                  )}
                </div>

                <div>
                  <Label htmlFor="url">URL *</Label>
                  <Input id="url" {...register('url')} placeholder="https://github.com/usuario" />
                  {errors.url && <p className="mt-1 text-sm text-red-600">{errors.url.message}</p>}
                </div>

                <div>
                  <Label htmlFor="description">Descripción (opcional)</Label>
                  <Textarea
                    id="description"
                    {...register('description')}
                    placeholder="Breve descripción..."
                    rows={3}
                  />
                  {errors.description && (
                    <p className="mt-1 text-sm text-red-600">{errors.description.message}</p>
                  )}
                </div>
              </div>

              <DialogFooter>
                <Button type="button" variant="outline" onClick={() => setDialogOpen(false)}>
                  Cancelar
                </Button>
                <Button type="submit" disabled={isSubmitting}>
                  {isSubmitting ? 'Guardando...' : editingLink ? 'Actualizar' : 'Crear'}
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Links List */}
      {links.length === 0 ? (
        <Card>
          <CardHeader>
            <CardTitle>No tienes enlaces</CardTitle>
            <CardDescription>Crea tu primer enlace para comenzar</CardDescription>
          </CardHeader>
          <CardContent>
            <Button onClick={handleNew}>
              <FiPlus size={16} className="mr-2" />
              Crear Primer Enlace
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-3">
          <p className="text-sm text-gray-500">Arrastra para reordenar</p>
          <DndContext
            sensors={sensors}
            collisionDetection={closestCenter}
            onDragEnd={handleDragEnd}
          >
            <SortableContext items={links.map(l => l.id)} strategy={verticalListSortingStrategy}>
              {links.map(link => (
                <SortableLink
                  key={link.id}
                  link={link}
                  onEdit={handleEdit}
                  onDelete={handleDelete}
                />
              ))}
            </SortableContext>
          </DndContext>
        </div>
      )}
    </div>
  );
}
