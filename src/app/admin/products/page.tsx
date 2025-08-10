
import { createClient } from '@supabase/supabase-js'; // CORREGIDO
import Link from 'next/link';
import Image from 'next/image';
import { MoreHorizontal } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import PageTitle from '@/components/shared/PageTitle';
import Section from '@/components/shared/Section';
import { Badge } from '@/components/ui/badge';
import { deleteProduct } from './actions';
import { Product } from '@/lib/types';

// Se debe inicializar el cliente admin para operaciones de lectura en el servidor
const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export default async function AdminProductsPage() {
  const { data: products, error } = await supabaseAdmin.from('products').select('*').order('created_at', { ascending: false });

  if (error) {
    return <Section><p>Error al cargar productos: {error.message}. Asegúrate de haber habilitado las políticas RLS para lectura en la tabla 'products'.</p></Section>;
  }

  return (
    <>
      <PageTitle title="Panel de Administración" subtitle="Gestionar Productos" />
      <Section className="py-8">
        <Card>
          <CardHeader>
            <CardTitle>Productos Registrados</CardTitle>
            <CardDescription>
              Aquí puedes ver, editar o eliminar los productos de tu tienda.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-right mb-4">
              <Button asChild>
                <Link href="/admin/add-product">Añadir Nuevo Producto</Link>
              </Button>
            </div>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="hidden w-[100px] sm:table-cell">Imagen</TableHead>
                  <TableHead>Nombre</TableHead>
                  <TableHead>Categoría</TableHead>
                  <TableHead className="hidden md:table-cell">Precio</TableHead>
                  <TableHead><span className="sr-only">Acciones</span></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {products.map((product: Product) => (
                  <TableRow key={product.id}>
                    <TableCell className="hidden sm:table-cell">
                        <Image
                          alt={product.name}
                          className="aspect-square rounded-md object-cover"
                          height={64}
                          src={product.image_url || '/placeholder.svg'}
                          width={64}
                        />
                    </TableCell>
                    <TableCell className="font-medium">{product.name} {product.is_featured && <Badge>Destacado</Badge>}</TableCell>
                    <TableCell>{product.category}</TableCell>
                    <TableCell className="hidden md:table-cell">${product.price?.toFixed(2)}</TableCell>
                    <TableCell>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button aria-haspopup="true" size="icon" variant="ghost">
                            <MoreHorizontal className="h-4 w-4" />
                            <span className="sr-only">Toggle menu</span>
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem asChild><Link href={`/admin/products/edit/${product.id}`}>Editar</Link></DropdownMenuItem>
                          <form action={async () => {
                              "use server";
                              if(!product.id) return;
                              await deleteProduct(product.id);
                          }}>
                              <button type="submit" className="w-full text-left">
                                  <DropdownMenuItem>Eliminar</DropdownMenuItem>
                              </button>
                          </form>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
             {products.length === 0 && <p className="text-center text-muted-foreground py-8">No hay productos registrados todavía.</p>}
          </CardContent>
        </Card>
      </Section>
    </>
  );
}
