export interface Item {
  id: string;
  seller_id: string;
  title: string;
  price: number;
  description: string;
  category: string;
  sub_category: string;
  condition: string;
  images: string[];
  meetup_area: string;
  campus: string;
  status: "available" | "sold" | "deleted";
  buyer_id?: string | null;
  show_contact_info?: boolean;
  created_at: string;
  seller?: {
    full_name: string | null;
    campus: string;
  };
}

export interface Profile {
  id: string;
  email: string;
  full_name: string | null;
  campus: "Main" | "Engineering" | "Health";
  matric_no: string | null;
  ic_document_path: string | null;
  verification_status: "pending" | "verified" | "rejected";
  created_at: string;
}
