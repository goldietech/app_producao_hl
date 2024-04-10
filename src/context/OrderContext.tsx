import React, {useState, useReducer} from 'react';
import {
  ObjectProduct,
  ObjectSubProduct,
  ResponseOrder,
} from '../models/OrderProps';
import {
  ObjectNoteProduct,
  ResponseNoteDetail,
  ObjectNoteProductStock,
} from '../models/NoteProductProps';
import {ResponseNote} from '../models/NoteProps';
import {WeightText} from 'src/components/ItemListOrder';

export const OrderContext = React.createContext({});

const OrderContextComponent: React.FC = ({children}) => {
  const [orders, setOrders] = useState<ResponseOrder[] | []>([]);
  const [objProduct, setObjProduct] = useState<ObjectProduct[] | []>([]);

  const [productMaterials, setProductMaterials] = useState<
    ObjectSubProduct[] | []
  >([]);

  const [notes, setNotes] = useState<ResponseNote[] | []>([]);
  const [noteProduct, setNoteProduct] = useState<ResponseNoteDetail[] | []>([]);
  const [, forceUpdate] = useReducer(x => x + 1, 0);
  const [balanceDevice, setBalance] = useState<string>('');
  const [weight, setWeight] = useState<number>(0);
  const [globalInterval, setGlobalInterval] = useState(0);

  const store = {
    getOrders: () => orders,
    populateOrders: (param: ResponseOrder[]) => setOrders(param),
    updateSpecificOrder: (param: ResponseOrder, status: string) => {
      orders?.map((obj: ResponseOrder) => {
        if (obj?.id == param.id) {
          obj.status = status;
        }
      });
      setOrders(orders);
      forceUpdate();
    },
    getOrderProducts: () => objProduct,
    getOrderMaterials: () => productMaterials,
    populateObj: (param: ObjectProduct[]) => setObjProduct(param),
    populateMaterials: (param: ObjectSubProduct[]) =>
      setProductMaterials(param),
    updateSpecificObjOrder: (param: ObjectProduct) => {
      objProduct?.map(obj => {
        if (obj?.id == param?.id) {
          obj = param;
        }
      });
      setObjProduct(objProduct);
      forceUpdate();
    },
    setOrderObjectStatus: (param: number, status: string) => {
      objProduct?.map(obj => {
        if (obj?.id == param) {
          obj.status_production = status;
        }
      });
      setObjProduct(objProduct);
      forceUpdate();
    },
    changeStatusOrderObjectMaterial: (param: ObjectSubProduct) => {
      productMaterials?.map(material => {
        if (material?.id == param.id) {
          material.status_production = param.status_production;
        }
        return material;
      });

      let pendingObjects = [];
      let prodObjects = [];
      let doneObjects = [];
      productMaterials.map(data => {
        if (data.status_production == 'pending') {
          pendingObjects = [...pendingObjects, data];
        } else if (data.status_production == 'production') {
          prodObjects = [...prodObjects, data];
        } else if (data.status_production == 'done') {
          doneObjects = [...doneObjects, data];
        }
      });

      let first = [...prodObjects, ...pendingObjects];
      let newProductions = [...first, ...doneObjects];

      setProductMaterials(newProductions);
      forceUpdate();
    },
    getNotes: () => notes,
    populateNotes: (param: ResponseNote[]) => setNotes(param),
    setNoteStatus: (id: number, status: 'conference' | 'pre_finish') => {
      notes.map((noteObj: ResponseNote) => {
        if (noteObj.id == id) {
          noteObj.status = status;
        }
        return noteObj;
      });
      setNotes(notes);
      forceUpdate();
    },
    getNoteProducts: () => noteProduct,
    populateNoteProducts: (param: ResponseNoteDetail[]) =>
      setNoteProduct(param),
    setNoteProductStatus: (id: number, status: string) => {
      noteProduct.map((noteObj: ResponseNoteDetail) => {
        if (noteObj.id == id) {
          noteObj.status = status;
        }
        return noteObj;
      });
      setNoteProduct(noteProduct);
      forceUpdate();
    },
    setNewItemInNote: (idNote: number, obj: ObjectNoteProductStock) => {
      noteProduct.map((noteObj: ResponseNoteDetail) => {
        if (noteObj.id == idNote) {
          noteObj.stockData = [obj, ...noteObj.stockData];
        }
        return noteObj;
      });
      setNoteProduct(noteProduct);
      forceUpdate();
    },
    getDevice: () => balanceDevice,
    setDevice: (param: string) => setBalance(param),
    getStorageWeight: () => weight,
    setStorageWeight: (weightParam: number) => setWeight(weightParam),
    setInterval: (interval: number) => setGlobalInterval(interval),
    getGlobalInterval: () => globalInterval,
  };

  return (
    <OrderContext.Provider value={store}>{children}</OrderContext.Provider>
  );
};

export {OrderContextComponent};
