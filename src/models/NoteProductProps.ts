export interface ObjectNoteProductStock {
  control_rolls_opt: string;
  created_at: string;
  gross_weight: string;
  id: number;
  net_weight: string;
  number: number;
  object_cost: string;
  object_cost_total: string;
  object_id: number;
  object_id_extra: string;
  object_name: string;
  object_tag: string;
  status: string;
  stock_id: 9;

  total_weight: string;
}
export interface ObjectNoteProduct {
  id: number;
  obj_code: string;
  obj_description: string;
  object_id: number;
  object_id_extra: string;
  object_name: string;
  price: string;
  purchase_id: number;
  quantity: string;
  status: string;
  total: string;
  unit_abbreviation: string;
  unit_description: string;
  delivery_id: number;
}

export interface ResponseNoteDetail {
  id: number;
  block_company_id: number;
  block_customer_id: number;
  delivery_id: number;
  price: string;
  purchaseObjData: ObjectNoteProduct;
  purchase_id: number;
  purchase_object_id: string;
  quantity: string;
  status: string;
  total: string;
  number: number;
  stockData: Array<ObjectNoteProductStock>;
}
