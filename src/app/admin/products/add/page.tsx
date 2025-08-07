
import React from 'react';
import PageTitle from '@/components/shared/PageTitle';
import Section from '@/components/shared/Section';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import ProductForm from '@/components/admin/ProductForm';


export default function AddProductPage() {
    return (
        <>
            <PageTitle title="Panel de Administración" subtitle="Añadir Nuevo Producto" />
            <Section className="py-8 md:py-12">
                <Card className="max-w-4xl mx-auto shadow-lg">
                    <CardHeader>
                        <CardTitle>Detalles del Producto</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <ProductForm />
                    </CardContent>
                </Card>
            </Section>
        </>
    );
}
