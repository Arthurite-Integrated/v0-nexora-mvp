import { supabase } from "@/lib/supabaseClient";
import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  try {
    const { email, password } = await req.json();

    if (!email || !password) {
      return NextResponse.json(
        { error: "Email and password are required" }, 
        { status: 400 }
      );
    }

    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      console.error("Login API: Supabase auth error:", error);
      return NextResponse.json(
        { error: error.message }, 
        { status: 400 }
      );
    }

    // Return session data for client-side setup
    return NextResponse.json({ 
      data,
      session: data.session,
      user: data.user 
    }, { status: 200 });
  } catch (error) {
    console.error("Login API: Unexpected error:", error);
    return NextResponse.json(
      { error: "Internal server error" }, 
      { status: 500 }
    );
  }
}