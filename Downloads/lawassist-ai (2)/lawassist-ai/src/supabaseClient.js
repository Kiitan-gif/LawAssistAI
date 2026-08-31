import { createClient } from "@supabase/supabase-js";

const supabaseUrl = "https://ospgadkukveguukrmasq.supabase.co";
const supabaseKey = "sb_publishable_Zhy2CTydn4E79-RSuPURCA_FHf09AtS";

export const supabase = createClient(supabaseUrl, supabaseKey);
