import supabase from "@/app/services/supabase";

export async function GET(request) {
  const { data, error } = await supabase
    .from("cars_full_view")
    .select("*")
    .eq("id", 184)
    .single();

  if (error) {
    console.error("Error fetching data:", error.message);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }

  return new Response(JSON.stringify({ data }), {
    status: 200,
    headers: { "Content-Type": "application/json" },
  });
}
