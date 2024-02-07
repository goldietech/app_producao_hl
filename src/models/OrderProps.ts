export interface ObjectSubProduct {
  id: number;
  obj_description: string;
  obj_id: number;
  obj_quantity: string;
  obj_unit: string;
  object_name: string;
  status: 'checking' | 'done' | 'waiting ' | 'preparing' | 'production';
  status_production: string;
  order_id: number;
  obj_quantity_producted: string;
  obj_return_quantity: string;
  object_id: number;
  object_id_extra: string;
  use_as?: string;
  use_to_id?: number;
  checked?: boolean;
}

export interface WeightObj {
  id: number;
  box_weight: string;
  box_unit_weight: string;
  boxAlert: Array<string>
}

export interface ObjectProduct {
  id: number;
  obj_description: string;
  obj_id: number;
  obj_quantity: string;
  obj_unit: string;
  order_id: number;
  rawObjects: Array<ObjectSubProduct>;
  status: string;
  status_production: string;
  weight: WeightObj;
}

export interface ResponseOrder {
  id: number;
  start_date: string;
  status: string;
  code: string;
  OrdersObject: Array<ObjectProduct>;
}
