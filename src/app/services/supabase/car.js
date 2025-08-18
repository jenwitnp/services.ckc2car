import supabase from "../supabase";

export const carAutocomplete = async (carInput) => {
  const { data, error } = await supabase
    .from("cars")
    .select("id,no_car,title,thumbnail")
    .ilike("no_car", `%${carInput}%`);
  if (error) throw error;
  return data;
};
