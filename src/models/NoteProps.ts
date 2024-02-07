export interface ResponseNote {
  id: number;
  reference_number: string;
  total: string;
  purchase_id: number;
  status:
    | 'delivering'
    | 'stock_count'
    | 'pre_finish'
    | 'conference'
    | 'finished';
  volume: string;
  itens: string;
  created_at: string;
  delivered_date: string;
  purchaseData: {
    id: number;
    object_id: number;
    object_name: string;
    contact_emails: Array<string>;
    supplier_name: string;
    address_data: Array<{
      address: string;
      post_code: string;
      number: string;
      extras: string;
      suburb: string;
      city: string;
      state: string;
    }>;
  };
}
