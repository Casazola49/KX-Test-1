
import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { pilotData, newsData, trackData, raceEventsData, galleryData, qualifyingData, rankingsData, auspiciosData } from '@/lib/mock-data-seeding';

export const dynamic = 'force-dynamic';

async function seedDatabase() {
    if (process.env.NODE_ENV !== 'development') {
        return NextResponse.json({ message: "Seeding is only available in development environment." }, { status: 403 });
    }

    if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.SUPABASE_SERVICE_ROLE_KEY) {
        throw new Error("Supabase URL or Service Role Key is not configured. Please check your .env.local file.");
    }

    const supabaseAdmin = createClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL,
        process.env.SUPABASE_SERVICE_ROLE_KEY
    );
    
    const pilotsWithFullName = pilotData.map(p => ({
        ...p,
        name: `${p.firstName} ${p.lastName}`.trim()
    }));

    const tablesInOrder = [
        { name: 'gallery', data: galleryData },
        { name: 'pilots', data: pilotsWithFullName },
        { name: 'news', data: newsData },
        { name: 'tracks', data: trackData },
        { name: 'raceevents', data: raceEventsData },
        { name: 'qualifyingresults', data: qualifyingData },
        { name: 'rankings', data: rankingsData },
        { name: 'auspicios', data: auspiciosData },
    ];
    
    for (const table of tablesInOrder) {
        try {
            await supabaseAdmin.rpc('execute_sql', { sql: `ALTER TABLE public.${table.name} DISABLE ROW LEVEL SECURITY;` });
        } catch (e) {
            console.warn(`Could not disable RLS on ${table.name}. This might be okay if it doesn't exist yet.`);
        }
    }

    console.log("Cleaning existing data from tables...");
    for (const table of [...tablesInOrder].reverse()) {
        console.log(`Cleaning table: ${table.name}...`);
        const { error: deleteError } = await supabaseAdmin.from(table.name).delete().neq('id', '00000000-0000-0000-0000-000000000000');
        if (deleteError) {
            console.warn(`Could not delete data from ${table.name}: ${deleteError.message}. This might be normal if the table was empty.`);
        } else {
            console.log(`Table ${table.name} cleaned successfully.`);
        }
    }
    console.log("All specified tables cleaned.");

    console.log("Seeding new data...");
    for (const table of tablesInOrder) {
        console.log(`Seeding table: ${table.name}...`);
        if (table.data && table.data.length > 0) {
            const { error: insertError } = await supabaseAdmin.from(table.name).insert(table.data as any); 
            if (insertError) {
                const errorMessage = `Error seeding table "${table.name}": ${JSON.stringify(insertError, null, 2)}`;
                throw new Error(errorMessage);
            }
            console.log(`Table ${table.name} seeded successfully.`);
        } else {
            console.log(`No data to seed for table: ${table.name}.`);
        }
    }
    
    for (const table of tablesInOrder) {
        try {
            console.log(`Creating RLS policy for public read on ${table.name}...`);
            const policyName = `allow_public_read_for_${table.name}`;
            // Drop a policy with the same name if it exists
            await supabaseAdmin.rpc('execute_sql', { sql: `DROP POLICY IF EXISTS "${policyName}" ON public.${table.name};` });
            // Create the policy
            await supabaseAdmin.rpc('execute_sql', {
                sql: `CREATE POLICY "${policyName}" ON public.${table.name} FOR SELECT USING (true);`
            });
            await supabaseAdmin.rpc('execute_sql', { sql: `ALTER TABLE public.${table.name} ENABLE ROW LEVEL SECURITY;` });
            console.log(`RLS policy created and enabled for ${table.name}.`);
        } catch (e: any) {
            console.warn(`Could not manage RLS for ${table.name}: ${e.message}`);
        }
    }

    console.log("Database seeded successfully, with RLS policies created and enabled.");
    return { message: "Database seeded successfully and public read policies created!" };
}


export async function GET() {
  try {
    const result = await seedDatabase();
    return NextResponse.json(result);
  } catch (error: any) {
    console.error("Seeding failed:", error);
    return NextResponse.json(
      { message: "Seeding failed", error: error.message, details: error.details || 'No details provided' },
      { status: 500 }
    );
  }
}
