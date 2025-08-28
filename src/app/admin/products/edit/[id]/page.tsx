
import { notFound } from 'next/navigation';
import ProductForm from '@/components/admin/ProductForm';
import PageTitle from '@/components/shared/PageTitle';
import Section from '@/components/shared/Section';
import { getAllProducts } from '@/lib/data-service';

export default async function EditProductPage({ params }: { params: { id: string } }) {
  try {
    const products = await getAllProducts();
    const product = products.find(p => p.id === params.id);

    if (!product) {
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
  } catch (error) {
    console.error('Error fetching product:', error);
    notFound();
  }
}
