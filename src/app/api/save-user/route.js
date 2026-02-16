// app/api/save-user/route.js
import { NextResponse } from 'next/server';

export async function POST(request) {
    console.log('=== SAVE USER API ===');

    try {
        const userData = await request.json();

        console.log('Saving user:', {
            name: userData.name,
            email: userData.email,
            role: userData.role
        });

        const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
        const supabaseKey = process.env.SUPABASE_SERVICE_KEY;

        if (!supabaseUrl || !supabaseKey) {
            console.log('Supabase not configured - skipping save');
            return NextResponse.json({
                success: false,
                message: 'Supabase not configured'
            }, { status: 200 });
        }

        // Save to Supabase
        const response = await fetch(`${supabaseUrl}/rest/v1/users`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'apikey': supabaseKey,
                'Authorization': `Bearer ${supabaseKey}`,
                'Prefer': 'return=minimal'
            },
            body: JSON.stringify(userData)
        });

        if (!response.ok) {
            const errorText = await response.text();
            console.error('Supabase error:', errorText);
            return NextResponse.json({
                success: false,
                error: errorText
            }, { status: 500 });
        }

        console.log('✅ User saved successfully');
        return NextResponse.json({ success: true });

    } catch (error) {
        console.error('Error saving user:', error);
        return NextResponse.json({
            success: false,
            error: error.message
        }, { status: 500 });
    }
}