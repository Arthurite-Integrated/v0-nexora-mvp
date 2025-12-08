// app/api/auth/signup/route.ts
import { supabase } from "@/lib/supabaseClient";
import { createClient } from '@supabase/supabase-js';
import { NextRequest, NextResponse } from "next/server";

// Service role client for admin operations
const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function POST(req: NextRequest) {
    try {
        const { email, password, name, role = 'caregiver' } = await req.json();

        if (!email || !password) {
            return NextResponse.json(
                { error: "Email and password are required" }, 
                { status: 400 }
            );
        }

        const { data, error: signupError } = await supabase.auth.signUp({
            email,
            password,
        });

        if (signupError) {
            console.error("Supabase signup error:", signupError);
            return NextResponse.json(
                { error: signupError.message }, 
                { status: 400 }
            );
        }

        // Insert user data into users table
        if (data.user) {
            console.log("Attempting to insert user:", {
                id: data.user.id,
                email: data.user.email,
                name: name || email.split('@')[0],
                role: role
            });

            const { error: insertError } = await supabaseAdmin
                .from('users')
                .insert({
                    id: data.user.id,
                    email: data.user.email,
                    name: name || email.split('@')[0],
                    role: role
                });

            if (insertError) {
                console.error("Error inserting user data:", insertError);
                return NextResponse.json(
                    { error: "Failed to create user profile: " + insertError.message }, 
                    { status: 500 }
                );
            }
            
            console.log("User inserted successfully");
        }

        return NextResponse.json(
            { 
                message: "Signup successful", 
                user: data.user,
                session: data.session 
            }, 
            { status: 201 }
        );
    } catch (error) {
        console.error("Signup error:", error);
        return NextResponse.json(
            { error: error instanceof Error ? error.message : "Signup failed" }, 
            { status: 500 }
        );
    }
}