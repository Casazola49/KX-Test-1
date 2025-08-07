
import { createClient } from '@supabase/supabase-js'; // CORREGIDO
import { notFound } from 'next/navigation';
import ProductForm from '@/components/admin/ProductForm';
import PageTitle from '@/components/shared/PageTitle';
import Section from '@/components/shared/Section';

// Se debe inicializar el cliente admin para operaciones de lectura en el servidor
const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export default async function EditProductPage({ params }: { params: { id: string } }) {
  const { data: product, error } = await supabaseAdmin
    .from('products')
    .select('*')
    .eq('id', params.id)
    .single();

  if (error || !product) {
    notFound();
  }

  return (
    <>
      <PageTitle title="Panel de Administración" subtitle={`Editando: ${product.name}`} />
      <Section className="py-8">
        <ProductForm product={product} />
      </Section>
    </>
  );
}
