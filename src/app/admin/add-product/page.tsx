
import ProductForm from '@/components/admin/ProductForm';
import PageTitle from '@/components/shared/PageTitle';
import Section from '@/components/shared/Section';

export default function AddProductPage() {
  return (
    <>
      <PageTitle title="Panel de Administración" subtitle="Añadir Nuevo Producto" />
      <Section className="py-8">
        <ProductForm />
      </Section>
    </>
  );
}
