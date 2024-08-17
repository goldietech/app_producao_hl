import React, {useState, useEffect, useContext} from 'react';
import BluetoothSerial from 'react-native-bluetooth-serial-next';
import {
  View,
  FlatList,
  ScrollView,
  Platform,
  Dimensions,
  Alert,
  PermissionsAndroid,
  ActivityIndicator,
} from 'react-native';
import {FontAwesomeIcon} from '@fortawesome/react-native-fontawesome';
import styled from 'styled-components/native';
import {FontsDefault} from '../styles/fonts';
import {ModalIndicateMaterial} from '../components/ModalIndicateMaterial';
import {ModalDevices} from '../components/ModalDevices';

import {ButtonDefault} from '../components/ButtonDefault';
import {BackGroundComponent} from '../components/BackGroundComponent';
import {ItemList} from '../components/ItemList';
import {ItemListMaterial} from '../components/ItemListMaterial';
import {
  ObjectProduct,
  ResponseOrder,
  ObjectSubProduct,
} from '../models/OrderProps';

import {faTimes, faWarning} from '@fortawesome/free-solid-svg-icons';
import {OrderContext} from '../context/OrderContext';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {Apis} from '../services/api';
import {ModalBoxFinished} from '../components/ModalBoxFinished';
import {heightPercentageToDP as hp} from 'react-native-responsive-screen';
import assets from '../services/imagesExports';
import {ModalBoxFloor} from '../components/ModalBoxFloor';
import {SendPrint} from '../components/SendPrint';
import {ModalDefault} from '../components/ModalDefault';
import {ButtonWithBorder} from '../components/ButtonWithBorder';

interface BoxProps {
  code: string;
  name: string;
  weight: number;
}

interface PrintProps {
  printList: Array<string>;
  printLink: string;
}

('production_orders/ProductionOrdersObjectsMade/read');
const Producao: React.FC = ({route, navigation}) => {
  // STORAGE

  const [hasProductReady, setHasProductReady] = useState(false);
  const [loading, setLoading] = useState(false);
  const [visible, setVisible] = useState(false);
  const [visibleModalBox, setVisibleModalBox] = useState(false);
  const [visibleModalBluetooth, setVisibleModalBluetooth] = useState(false);

  const [productionData, setOrderData] = useState({});
  const [product, setProduct] = useState<ObjectProduct | null>(null);
  const [boxList, setBoxList] = useState<BoxProps[] | []>([]);
  const [turnOffOptions, setTurnOffOptions] = useState([]);
  const [weight, setWeight] = useState(0);
  const [finalWeight, setFinalWeight] = useState(0);
  const [userData, setUserData] = useState({});
  const getUser = async (): Promise<any> => {
    let user = await AsyncStorage.getItem('@user:user').then(json => {
      let res: string = JSON.parse(json);
      return res;
    });
    setUserData(user);
  };
  const requestBluScanPermission = async () => {
    try {
      const granted = await PermissionsAndroid.request(
        PermissionsAndroid.PERMISSIONS.BLUETOOTH_SCAN,
        {
          title: 'Permissão necessária',
          message:
            'Libere escanear bluetooth, ' +
            'assim podemos conectar com a balança.',
          buttonNegative: 'Não',
          buttonPositive: 'Permitir',
        },
      );
      if (granted === PermissionsAndroid.RESULTS.GRANTED) {
        init();
      } else {
        Alert.alert('Acesso BluetoothScan negado!');
        return false;
      }
    } catch (err) {
      Alert.alert('Erro Bluetooth:'+ err);
    }
  };
  const requestBluPermission = async () => {
    try {
      const granted = await PermissionsAndroid.request(
        PermissionsAndroid.PERMISSIONS.BLUETOOTH_CONNECT,
        {
          title: 'Permissão necessária',
          message:
            'Libere acesso ao bluetooth, ' +
            'assim podemos conectar com a balança.',
          buttonNegative: 'Não',
          buttonPositive: 'Permitir',
        },
      );
      if (granted === PermissionsAndroid.RESULTS.GRANTED) {
         requestBluScanPermission()
      } else {
        Alert.alert('Acesso Bluetooth negado!');
        return false;
      }
    } catch (err) {
      Alert.alert('Erro Bluetooth:'+ err);
    }
  };
  const [opcaoMaquina, setOpcaoMaquina] = useState(0);
  const [opcaoProducao, setOpcaoProducao] = useState(0);
  const [balanceActive, setBalanceActive] = useState(false);
  const [balanceWaitingActive, setBalanceWaitingActive] = useState(false);
  const [showBtnBalance, setShowBtnBalance] = useState(false);
  const [bluetoothInterval, setBluetoothInterval] = useState<any>({time: null});
  const [devices, setDevices] = useState<any>([]);
  const [deviceConnected, setDeviceConnected] = useState<string>('');
  const [idSaved, setIdSave] = useState<string>('');
  const [boxFloorNumbers, setBoxFloorNumbers] = useState<number[]>([]);
  const [prevWeightFloor, setPrevWeightFloor] = useState<number>(0);
  const [visibleModalFloor, setVisibleModalFloor] = useState(false);
  const [visibleModalWarningFloor, setVisibleModalWarningFloor] =
    useState(false);
  const [modalTarugoWeight, setModalTarugoWeight] = useState(false);
  const [boxLevels, setBoxLevels] = useState([]);
  const [materialData, setMaterialData] = useState(null);
  const [tarugoWeight, setTarugoWeight] = useState(0);
  const [iamChecking, setIamChecking] = useState(0);
  const [visibleModalStatusMaquina, setVisibleModalStatusMaquina] =
    useState(false);
  const [visibleModalStatusProducao, setVisibleModalStatusProducao] =
    useState(false);
  const [prinData, setPrintData] = useState<PrintProps>({
    printLink: '',
    printList: [],
  });
  const [rollWeightLeft, setRollWeightLeft] = useState(0);
  const [materiaSelecionada, setMateriaSelecionada] = useState(0);
  const [modalRollLeft, setModalRollLeft] = useState(false);
  const context = useContext(OrderContext);

  const setItem = async (item: String): Promise<any> => {
    return await AsyncStorage.setItem('@user:devices', JSON.stringify(item));
  };

  const getItem = async (): Promise<string> => {
    return await AsyncStorage.getItem('@user:devices').then(json => {
      let res: string = JSON.parse(json);
      return res;
    });
  };

  const getListSaved = async () => {
    let response = await getItem();

    if (response) {
      try {
        const device = await BluetoothSerial.device(response);

        let connected = device.connect();

        setDeviceConnected(response);
        context.setDevice(connected.address);
      } catch (error) {
        alert('Sem sinal com a balança');
        setBalanceActive(false);
      }
    } else {
      setVisibleModalBluetooth(true);
    }
  };
  const continueGetListSaved = async () => {
  
  }

  useEffect(() => {
    getUser();
    const {orderData, data} = route.params;
    setOrderData(orderData);
    console.log({ordsssserData: orderData.maquinaData});

    setTurnOffOptions(route.params.turnOffOptions);

    setProduct(data);

    if (data.rawObjects) {
      let pendingObjects = [];
      let prodObjects = [];
      let doneObjects = [];
      data.rawObjects.map(data => {
        if (data.status_production == 'pending') {
          pendingObjects = [...pendingObjects, data];
        } else if (data.status_production == 'production') {
          prodObjects = [...prodObjects, data];
        } else if (data.status_production == 'done') {
          doneObjects = [...doneObjects, data];
        }
      });

      let first = [...prodObjects, ...pendingObjects];
      data.rawObjects = [...first, ...doneObjects];
    }

    context.populateMaterials(data.rawObjects);
    let total = data?.rawObjects.filter(
      (obj: ObjectSubProduct) => obj.status_production == 'production',
    );

    if (total?.length > 0) {
      setShowBtnBalance(true);
    }



    // getListSaved();
    var version = Platform.Version;
    if(version < 31){
      init();
    }else{
    requestBluPermission();

    }
    storageWeight();
    getBoxes(data);
    getFloorBoxFromProduct(data);
    return () => cancelInterval();
  }, []);
  const init = async () => {
    let isActive = await BluetoothSerial.enable();
    if (!isActive) {
      await BluetoothSerial.requestEnable();
    }
    let list = await BluetoothSerial.list();
    setDevices(list);
  };
  const storageWeight = async () => {
    let asyncWeight = await JSON.parse(
      await AsyncStorage.getItem('@user:weightorder' + productionData.id),
    );
    context.setStorageWeight(asyncWeight);
  };
  const getFloorBoxFromProduct = async data => {
    let asyncWeight = await JSON.parse(
      await AsyncStorage.getItem('@user:weightorder' + productionData.id),
    );

    if (data?.weight.boxAlert) {
      let newOne = data?.weight.boxAlert.filter(arrNum => {
        let max = Number(arrNum) + Number(data.weight.box_unit_weight);
        let min = Number(arrNum) - Number(data.weight.box_unit_weight);
        if (
          Number(asyncWeight) <= arrNum &&
          asyncWeight < max &&
          asyncWeight < min
        ) {
          return arrNum;
        }
      });
      console.log({florrrr: newOne});
      setBoxLevels(newOne);
      await AsyncStorage.setItem('@user:boxfloor', JSON.stringify(newOne));
    }
  };

  const getBoxes = async param => {
    let asyncToken: string | null = await AsyncStorage.getItem('@user:token');
    let token = JSON.parse(asyncToken);
    try {
      const resApi = await Apis.api.get(
        `${token}/production_orders/ProductionOrdersObjectsMade/read&order_object_id=${param.id}`,
      );
      let listGetBoxes = resApi.data?.objectsMadeData.map(material => {
        let newData = {
          code: material.id,
          name: `Caixa: ${material.sku}`,
          weight: material.weight.toString(),
        };
        return newData;
      });

      setBoxList(listGetBoxes);
    } catch (error) {
      setBoxList([]);
    }
  };

  const verifyBoxFloor = async (weightActual, balanceNumber) => {
    // if (visibleModalFloor === false || !visibleModalFloor) {
    setIamChecking(1);
    let asyncBoxFloor = JSON.parse(
      await AsyncStorage.getItem('@user:boxfloor'),
    );

    let exists = 0;
    let asyncWeight = await JSON.parse(
      await AsyncStorage.getItem('@user:weightorder' + productionData.id),
    );

    asyncWeight += product?.weight?.box_weight;
    let diff = 0;
    asyncBoxFloor.forEach(function (value) {
      if (Number(weightActual) >= value) {
        setPrevWeightFloor(value);
        exists += 1;
      }
    });

    let newOne = asyncBoxFloor.filter(arrNum => {
      if (Number(weightActual) < arrNum) {
        return arrNum;
      }
    });

    if (exists >= 1) {
      setVisibleModalFloor(true);
      setBoxLevels(newOne);
      await AsyncStorage.setItem('@user:boxfloor', JSON.stringify(newOne));
    }
    // } else {
    //   setIamChecking(0);

    // }
  };

  const responseInterval = async () => {
    let timer = JSON.parse(await AsyncStorage.getItem('@user:timer'));

    let asyncWeight = await JSON.parse(
      await AsyncStorage.getItem('@user:weightorder' + productionData.id),
    );
    let boolSavedWeight = await JSON.parse(
      await AsyncStorage.getItem('@user:afterSaveWeight'),
    );

    BluetoothSerial.readFromDevice().then(async data => {
      // setWeight(data);

      if (data != '' || !data) {
        let balanceNumber = data;

        if (!balanceNumber && balanceNumber != '') {
          setWeight(0);
        } else {
          balanceNumber = balanceNumber.substr(1, 6);
          if (boolSavedWeight) {
            setBalanceWaitingActive(true);
            if (Number(balanceNumber) > 0) {
              await AsyncStorage.setItem('@user:loopTimes', JSON.stringify(0));
            }
            let loopTimes = await JSON.parse(
              await AsyncStorage.getItem('@user:loopTimes'),
            );
            if (Number(balanceNumber) == 0 && loopTimes <= 7) {
              loopTimes += 1;

              await AsyncStorage.setItem(
                '@user:loopTimes',
                JSON.stringify(loopTimes),
              );
            } else if (Number(balanceNumber) == 0 && loopTimes > 7) {
              await AsyncStorage.setItem(
                '@user:afterSaveWeight',
                JSON.stringify(false),
              );
              setBalanceWaitingActive(false);
              boolSavedWeight = false;
              await AsyncStorage.setItem('@user:loopTimes', JSON.stringify(0));
            }
          }

          if (boolSavedWeight && Number(balanceNumber) > 0) {
          } else if (!boolSavedWeight) {
            // console.log({sem: Number(balanceNumber)});
            setWeight(Number(balanceNumber));
            // Number(product?.weight.box_weight)
            verifyBoxFloor(
              Number(balanceNumber) + Number(asyncWeight),
              balanceNumber,
            );
            if (
              Number(balanceNumber) + Number(asyncWeight) >=
              Number(product?.weight.box_weight)
            ) {
              // clearInterval(timer);
              setFinalWeight(Number(balanceNumber) + Number(asyncWeight));
              if (!visibleModalBox) {
                setVisibleModalBox(true);
              }
            }
          }
        }
      }
    });
  };

  const modifyMaterial = async (
    code: number,
    isProduction: boolean = false,
  ) => {
    product?.rawObjects.map(materialItem => {
      if (materialItem.id == code) {
        materialItem.status = isProduction ? 'production' : 'checking';
      }
      return materialItem;
    });

    setProduct(product);
    if (!isProduction) {
      setVisible(false);
    }
  };

  const getAllMaterialStatus = () => {
    let total = context
      .getOrderMaterials()
      .filter((obj: ObjectSubProduct) => obj.status_production == 'production');
    if (total.length > 0) {
      return false;
    } else {
      return true;
    }
  };
  const saveRollLeft = async weight => {
    await changeStatusMaterialDone(materialData, 0, weight);
    setBalanceActive(false);
    setHasProductReady(true);
    cancelInterval();
  };
  const saveTarugoWeight = async weight => {
    await changeStatusMaterialDone(materialData, weight);
    setBalanceActive(false);
    setHasProductReady(true);
    cancelInterval();
  };
  const cancelModalRollLeft = () => {
    setRollWeightLeft('');
    setModalRollLeft(false);
    setMaterialData(null);
  };
  const cancelTarugoWeight = () => {
    setTarugoWeight('');
    setModalTarugoWeight(false);
    setMaterialData(null);
  };
  const setOrderReady = () => {
    let total = context
      .getOrderMaterials()
      .filter((obj: ObjectSubProduct) => obj.status_production == 'done');
    if (total.length == context.getOrderMaterials().length) {
      return true;
    } else {
      return false;
    }
  };

  const connectDevice = async (id: string) => {
    setLoading(true);
    try {
      setIdSave(id);
      const device = await BluetoothSerial.device(id);
      await device.connect();
      const isConnected = await device.isConnected();
      if (isConnected) {
        setVisibleModalBluetooth(false);
        setDeviceConnected(id);
        setItem(id);
        setLoading(false);
      }
    } catch (error) {
      setLoading(false);
      alert('não conectou');
    }
  };

  const initConnection = async () => {
    const device = await BluetoothSerial.device(deviceConnected);
    let isWrite = await device.write('05');
    if (isWrite) {
      await AsyncStorage.setItem('@user:loopTimes', JSON.stringify(0));
      let myInterval = setInterval(responseInterval, 1000);

      await AsyncStorage.setItem('@user:timer', JSON.stringify(myInterval));
      setBluetoothInterval({
        time: myInterval,
      });
    }
  };

  const disconnectDevice = async () => {
    let response = await getItem();

    if (response) {
      try {
        const device = await BluetoothSerial.device(response);
        let disconnect = device.disconnect();
      } catch (error) {}
    }
  };

  const setNewMaterialToProduct = async (code: number) => {
    product?.rawObjects.map(async mat => {
      if (mat.id == code) {
        if (
          mat.status_production == 'production' ||
          mat.status_production == 'done'
        ) {
          alert('material já está em uso');
        } else {
          await changeStatusMaterialProduction(code);
          modifyMaterial(code);
          setShowBtnBalance(true);
          // setBalanceActive(false);
          // setHasProductReady(true);
          // cancelInterval();
        }
      }
    });
  };

  const confirmDoneMaterial = (material: ObjectSubProduct) => {
    Alert.alert(
      'A bobina tem alguma sobra?',
      '',
      [
        {
          text: 'Não',
          style: 'cancel',
          onPress: () => {},
        },
        {
          text: 'INDICAR KG SOBRA',
          onPress: async () => {
            setMaterialData(material.id);
            setModalRollLeft(true);
          },
        },
      ],
      {cancelable: true},
    );
  };
  const confirmEndMaterial = (material: ObjectSubProduct) => {
    Alert.alert(
      'Finalizar a utilização da matéria prima?',
      '*************** TARUGO ***************',
      [
        {
          text: 'NÃO',
          onPress: () => {
            confirmDoneMaterial(material);
          },
          style: 'cancel',
        },
        {
          text: 'INDICAR KG TARUGO',
          onPress: async () => {
            setTarugoWeight(String(weight));
            setTimeout(() => {
              setModalTarugoWeight(true);
              setMaterialData(material.id);
            }, 100);
          },
        },
      ],
      {cancelable: true},
    );
  };
  const changeStatusMaterialProduction = async (materialId: number) => {
    setLoading(true);
    let asyncToken: string | null = await AsyncStorage.getItem('@user:token');
    let token = JSON.parse(asyncToken);

    try {
      const resAddBox = await Apis.api.post(
        `${token}/production_orders/ProductionOrderApi/startObjectRaw
        `,
        {
          id: materialId,
        },
      );

      context.changeStatusOrderObjectMaterial(resAddBox.data.orderObjData);
      context.updateSpecificObjOrder(resAddBox.data.createObj.orderObjectData);
      modifyMaterial(materialId, true);
      setLoading(false);
    } catch (error) {
      setLoading(false);
      console.log(error);
      // navigation.push('Login');
    }
  };

  const changeStatusMaterialDone = async (
    materialId: number,
    weight: number,
    leftWeight: number,
  ) => {
    let asyncToken: string | null = await AsyncStorage.getItem('@user:token');
    let token = JSON.parse(asyncToken);
    try {
      const resAddBox = await Apis.api.post(
        `${token}/production_orders/ProductionOrderApi/endObjectRaw
        `,
        {
          id: materialId,
          tarugo_weight: weight,
          weight_left: leftWeight,
        },
      );
      setRollWeightLeft(0);
      setTarugoWeight(0);
      setModalTarugoWeight(false);
      setModalRollLeft(false);
      setMaterialData(null);

      if (resAddBox.data.printLink) {
        setPrintData({
          printLink: resAddBox.data.printLink,
          printList: resAddBox.data.printList,
        });
      }

      setTimeout(() => {
        setPrintData({
          printLink: '',
          printList: [],
        });
      }, 1000);
      context.changeStatusOrderObjectMaterial(resAddBox.data.orderObjData);

      // context.updateSpecificObjOrder(resAddBox.data.createObj.orderObjectData);
    } catch (error) {
      setLoading(false);
      console.log(error);
      // navigation.push('Login');
    }
  };

  const boxCreate = async () => {
    await AsyncStorage.setItem('@user:afterSaveWeight', JSON.stringify(true));
    setLoading(true);
    // api
    let asyncToken: string | null = await AsyncStorage.getItem('@user:token');
    let token = JSON.parse(asyncToken);
    try {
      const resAddBox = await Apis.apiPlugin.post(
        `${token}/production_orders/ControlStatusProduction/ControlStatusProductionApi/productionAddBox
        `,
        {
          weight: finalWeight.toString(),
          orderId: product?.order_id.toString(),
          objId: product?.id.toString(),
          newVersion: 1,
          // sku: '45166454',
        },
      );
      if(resAddBox.data.status == 'no'){
        Alert.alert(
          'Problemas ao fechar a caixa: '+resAddBox.data.notification_html,
          '',
          [
            {
              text: 'OK',
              style: 'cancel',
              onPress: () => {},
            },
           
          ],
          {cancelable: true},
        );
        return;
      }
      context.updateSpecificObjOrder(resAddBox.data.createObj.orderObjectData);

      // if (true) {
      //   console.log('pode imprimir');
      // }
      setBoxList([
        ...boxList,
        {
          code: resAddBox.data?.createObj?.objectMadeData?.id.toString(),
          name: `Caixa: ${resAddBox.data?.createObj?.objectMadeData?.sku}`,
          weight: finalWeight,
        },
      ]);

      const resetFloor = async () => {
        setBoxLevels(product?.weight?.boxAlert);

        await AsyncStorage.setItem(
          '@user:boxfloor',
          JSON.stringify(product?.weight?.boxAlert),
        );
      };

      if (resAddBox.data.printLink) {
        setPrintData({
          printLink: resAddBox.data.printLink,
          printList: resAddBox.data.printList,
        });
      }

      setTimeout(() => {
        resetFloor();
        setLoading(false);
        setVisibleModalBox(false);
        setFinalWeight(0);
        clearStorageWeight();
        setWeight(0);

        setPrintData({
          printLink: '',
          printList: [],
        });
        closeModalfinished();
      }, 1000);
    } catch (error) {
      setLoading(false);
      console.log(error);
      // navigation.push('Login');
    }
  };

  const confirmProduction = async (productObj: ObjectProduct) => {
    let asyncToken: string | null = await AsyncStorage.getItem('@user:token');
    let token = JSON.parse(asyncToken);
    try {
      const resProduction = await Apis.api.post(
        `${token}/production_orders/ProductionOrderApi/endObjectProduction
        `,
        {
          order_id: productObj?.order_id,
          id: productObj.id,
        },
      );
      context.setOrderObjectStatus(resProduction.data.orderObjData.id, 'done');
      clearStorageWeight();
      navigation.goBack();
    } catch (error) {
      console.log('opss');
      // navigation.push('Login');
    }
  };

  const cancelInterval = async () => {
    disconnectDevice();
    setBalanceActive(false);
    let res = JSON.parse(await AsyncStorage.getItem('@user:timer'));
    clearInterval(res);
  };
  const selectMateria = (id: number) => {
    if (productionData.status_maquina == 1) {
      setMateriaSelecionada(id);
      setTimeout(() => {
        setVisible(true);
      }, 100);
    }
  };
  const getVolume = (arrProduct: Array<BoxProps>) => {
    let totalParse = arrProduct.map(product => {
      if (product != null) {
        return Number(product.weight);
      }
    });

    let total = totalParse.reduce((a, b) => Number(a) + Number(b), 0);

    return total?.toFixed(3);
  };

  // const closeBox = async () => {
  //   if (weight >= 0.01) {
  //     let asyncWeight = await JSON.parse(
  //       await AsyncStorage.getItem('@user:weightorder'+productionData.id),
  //     );
  //     if (asyncWeight) {
  //       cancelInterval();
  //       setFinalWeight(Number(weight) + Number(asyncWeight));
  //       context.setStorageWeight(Number(weight) + Number(asyncWeight));
  //       setVisibleModalBox(true);
  //     } else {
  //       cancelInterval();
  //       setFinalWeight(Number(weight));
  //       // context.setStorageWeight(Number(weight));
  //       setVisibleModalBox(true);
  //     }
  //   } else {
  //     alert('necessário mais peso');
  //   }
  // };

  const sendPrevWeight = async () => {
    let floor = await JSON.parse(await AsyncStorage.getItem('@user:boxfloor'));

    cancelInterval();
    // if (visibleModalFloor) {
    setVisibleModalFloor(false);
    setVisibleModalWarningFloor(true);
    // }
    await AsyncStorage.setItem('@user:afterSaveWeight', JSON.stringify(true));
    setBalanceWaitingActive(true);
    if (weight >= 0.001) {
      let asyncWeight = await JSON.parse(
        await AsyncStorage.getItem('@user:weightorder' + productionData.id),
      );
      if (asyncWeight) {
        await AsyncStorage.setItem(
          '@user:weightorder' + productionData.id,
          JSON.stringify(Number(weight) + Number(asyncWeight)),
        );
        context.setStorageWeight(Number(weight) + Number(asyncWeight));
        setTimeout(() => {
          initBalance();
        }, 1000);
      } else {
        await AsyncStorage.setItem(
          '@user:afterSaveWeight',
          JSON.stringify(true),
        );
        await AsyncStorage.setItem(
          '@user:weightorder' + productionData.id,
          JSON.stringify(Number(weight)),
        );
        context.setStorageWeight(Number(weight));
        setTimeout(() => {
          initBalance();
        }, 1000);
      }
    } else {
      alert('Necessário mais peso!');
    }
  };
  const clearStorage = async () => {
    if (
      productionData &&
      (productionData.status_maquina == 1 ||
        productionData.status_producao == 1)
    ) {
      alert('Necessário desligar a maquina e a produção');
      return;
    }
    let asyncToken: string | null = await AsyncStorage.getItem('@user:token');
    let token = JSON.parse(asyncToken);
    const turnOffAll = await Apis.apiPlugin.post(
      `${token}/production_orders/ControlStatusProduction/ControlStatusProductionApi/turnOffAll`,
      {
        orderId: 1,
      },
    );
    var pesoSalvoAtual = await JSON.parse(
      await AsyncStorage.getItem('@user:weightorder' + productionData.id),
    );
    AsyncStorage.clear();
    await AsyncStorage.setItem(
      '@user:weightorder' + productionData.id,
      JSON.stringify(Number(weight) + Number(pesoSalvoAtual)),
    );
    setTimeout(() => {
      navigation.navigate('Login');
    }, 200);
  };
  const clearStorageWeight = async () => {
    await AsyncStorage.setItem(
      '@user:weightorder' + productionData.id,
      JSON.stringify(Number(0)),
    );
    context.setStorageWeight(0);
  };
  const statusMaquina = async () => {
    setTimeout(() => {
      setVisibleModalStatusMaquina(true);
      setOpcaoMaquina(1);

      // setWeight('0,800');
    }, 100);
  };
  const statusProducao = async () => {
    setTimeout(() => {
      setVisibleModalStatusProducao(true);
      setOpcaoProducao(1);

      // setWeight('0,800');
    }, 100);
  };
  const initBalance = async () => {
    setBalanceActive(true);
    setShowBtnBalance(false);
    await getListSaved();
    storageWeight();

    setTimeout(async () => {
      setVisible(false);

      await initConnection();
      // setWeight('0,800');
    }, 500);
  };

  const closeModalfinished = () => {
    setVisibleModalBox(false);
    // setTimeout(async () => {
    //   await initConnection();
    // }, 1500);
  };
  const handleTarugoRePrint = async (id: number) => {
    let asyncToken: string | null = await AsyncStorage.getItem('@user:token');
    let token = JSON.parse(asyncToken);
    const resNoteAddProduct = await Apis.api.post(
      `${token}/production_orders/ProductionOrderApi/rePrintTarugo
      `,
      {
        objId: id,
      },
    );

    if (resNoteAddProduct.data.printLink) {
      setPrintData({
        printLink: resNoteAddProduct.data.printLink,
        printList: resNoteAddProduct.data.printList,
      });
      setTimeout(() => {
        setPrintData({
          printLink: '',
          printList: [],
        });
      }, 2000);
    }
  };

  const turnMaquina = async (statusMaquina: int) => {
    let asyncToken: string | null = await AsyncStorage.getItem('@user:token');
    let token = JSON.parse(asyncToken);

    const resStatusMaquina = await Apis.apiPlugin.post(
      `${token}/production_orders/ControlStatusProduction/ControlStatusProductionApi/maquinaStatusControl`,
      {
        orderId: productionData.id,
        reasonId: opcaoMaquina,
        statusMaquina: statusMaquina,
      },
    );

    console.log({respostaPRINCIAPL: resStatusMaquina.data});

    if (resStatusMaquina.data.status == 'ok') {
      let newProd = {
        ...productionData,
        status_maquina: statusMaquina,
        status_producao:
          resStatusMaquina.data.productionOrderData.status_producao,
        motivo_status_producao:
          resStatusMaquina.data.productionOrderData.motivo_status_producao,
        motivo_status_maquina: resStatusMaquina.data.motivo,
        usuario_status_producao:
          resStatusMaquina.data.productionOrderData.usuario_status_producao,
        usuario_status_maquina:
          resStatusMaquina.data.productionOrderData.usuario_status_maquina,
      };
      setOrderData(newProd);
      route.params.changeOrderData(newProd);
      setVisibleModalStatusMaquina(false);
    }
  };
  const turnProducao = async (statusProducao: int) => {
    let asyncToken: string | null = await AsyncStorage.getItem('@user:token');
    let token = JSON.parse(asyncToken);

    const resStatusProducao = await Apis.apiPlugin.post(
      `${token}/production_orders/ControlStatusProduction/ControlStatusProductionApi/producaoStatusControl`,
      {
        orderId: productionData.id,
        reasonId: opcaoProducao,
        statusProducao: statusProducao,
        status_producao:
          resStatusProducao.data.productionOrderData.status_producao,
        motivo_status_producao:
          resStatusProducao.data.productionOrderData.motivo_status_producao,
        motivo_status_maquina: resStatusProducao.data.motivo,
        usuario_status_producao:
          resStatusProducao.data.productionOrderData.usuario_status_producao,
        usuario_status_maquina:
          resStatusProducao.data.productionOrderData.usuario_status_maquina,
      },
    );

    console.log({respostaPRINCIAPL: resStatusProducao.data});

    if (resStatusProducao.data.status == 'ok') {
      let newProd = {
        ...productionData,
        status_producao: statusProducao,
        status_maquina:
          resStatusProducao.data.productionOrderData.status_maquina,
        motivo_status_maquina:
          resStatusProducao.data.productionOrderData.motivo_status_maquina,
        motivo_status_producao: resStatusProducao.data.motivo,
      };
      setOrderData(newProd);
      route.params.changeOrderData(newProd);
      setVisibleModalStatusProducao(false);
    }
  };
  const handleRePrint = async (id: number) => {
    let asyncToken: string | null = await AsyncStorage.getItem('@user:token');
    let token = JSON.parse(asyncToken);
    const resNoteAddProduct = await Apis.apiPlugin.post(
      `${token}/production_orders/ControlStatusProduction/ControlStatusProductionApi/rePrintProductionAdded
    `,
      {
        stockDataId: id,
      },
    );

    if (resNoteAddProduct.data.printLink) {
      setPrintData({
        printLink: resNoteAddProduct.data.printLink,
        printList: resNoteAddProduct.data.printList,
      });
    }

    setTimeout(() => {
      setPrintData({
        printLink: '',
        printList: [],
      });
    }, 500);
  };

  return (
    <BackGroundComponent>
      <Container>
        {Dimensions.get('screen').width < 520 ? (
          <>
            <FlatList
              data={[0]}
              renderItem={({item, index}) => (
                <Content style={{marginBottom: 100}}>
                  <Card>
                    <View>
                      <OrderNumber>
                        Ordem #{product?.order_id.toString()}
                      </OrderNumber>
                      <OrderTitle>{product?.obj_description}</OrderTitle>
                      <ProductStatusTab>
                        <ProductStatusText
                          style={{fontSize: 15, color: '#000'}}>
                          {productionData?.maquinaData?.descricao}
                        </ProductStatusText>
                      </ProductStatusTab>
                    </View>

                    {/* <View>
                      <Label>Volume</Label>
                      <Value>{product?.obj_quantity}</Value>
                    </View> */}
                  </Card>

                  <Wrapper>
                    <CardTotal style={{backgroundColor: '#069'}}>
                      <View>
                        <CardTotalText>Ordem</CardTotalText>
                        <CardTotalText>Produção</CardTotalText>
                      </View>
                      <View style={{justifyContent: 'flex-end'}}>
                        <CardSmallHeight>
                          {product?.obj_quantity} vol
                        </CardSmallHeight>
                        <CardSmallHeight>
                          {product?.obj_quantity /
                            (product?.weight.box_weight /
                              product?.weight.box_unit_weight)}{' '}
                          FARDOS
                        </CardSmallHeight>
                      </View>
                    </CardTotal>
                  </Wrapper>

                  {boxList.length > 0 && (
                    <Card style={{marginVertical: 16}}>
                      {boxList.length > 0 ? (
                        <FlatList
                          data={boxList.sort(
                            (a, b) => Number(b.code) - Number(a.code),
                          )}
                          renderItem={({item, index}) => (
                            <ItemList
                              rePrint={() => handleRePrint(Number(item.code))}
                              text={`${item.code} ${item.name}`}
                              productWeight={Number(item.weight).toFixed(3)}
                              onPress={() => {}}
                            />
                          )}
                          keyExtractor={(item, index) => index.toString()}
                        />
                      ) : (
                        <FloatImage source={assets.boxAnimationEmpty} />
                      )}

                      {/* <ProgressBarContainer>
                      <ProgressBar progressPercent={40} />
                    </ProgressBarContainer> */}
                    </Card>
                  )}

                  {product && (
                    <Wrapper>
                      <Card>
                        <Label>Matéria prima</Label>
                        <Divider />
                        <FlatList
                          data={context.getOrderMaterials()}
                          renderItem={({item, index}) => (
                            <ItemListMaterial
                              blocked={!getAllMaterialStatus()}
                              code={item.obj_id}
                              handleTarugoRePrint={() =>
                                handleTarugoRePrint(item.id)
                              }
                              status={item.status_production}
                              title={item.obj_description}
                              confirm={() =>
                                item.status_production == 'production'
                                  ? confirmEndMaterial(item)
                                  : selectMateria(item.id)
                              }
                            />
                          )}
                          keyExtractor={(item, index) => index.toString()}
                        />
                      </Card>
                    </Wrapper>
                  )}

                  <VolumeCard>
                    <CardTotalText>Totais Fabricados:</CardTotalText>

                    <RowWrapper>
                      <ValueWeight>
                        {Number(
                          parseFloat(getVolume(boxList).toString()) /
                            Number(product?.weight.box_unit_weight),
                        ).toFixed(1)}{' '}
                        Volumes
                      </ValueWeight>
                    </RowWrapper>
                    <RowWrapper>
                      <RowWrapper>
                        <View>
                          <CardTotalHeight>
                            {Number(
                              Number(
                                parseFloat(getVolume(boxList).toString()) /
                                  Number(product?.weight.box_unit_weight),
                              ).toFixed(1) /
                                (product?.weight.box_weight /
                                  product?.weight.box_unit_weight),
                            ).toFixed(0)}{' '}
                            caixa(s)
                          </CardTotalHeight>
                        </View>
                      </RowWrapper>
                    </RowWrapper>

                    <ProgressBarContainer>
                      <ProgressBarVolume
                        progressPercent={(
                          Number(
                            Number(
                              parseFloat(getVolume(boxList).toString()) /
                                Number(product?.weight.box_unit_weight),
                            ).toFixed(1) * 100,
                          ) / Number(product?.obj_quantity)
                        ).toFixed(0)}
                      />
                    </ProgressBarContainer>
                  </VolumeCard>

                  {context.getStorageWeight() >= 0.01 && (
                    <CardStorageWeight style={{marginVertical: 10}}>
                      <CardStorageWeightRow>
                        <CardTotalText>Peso salvo</CardTotalText>
                        <CardTotalHeight>
                          {Number(context.getStorageWeight().toFixed(3))}
                        </CardTotalHeight>
                      </CardStorageWeightRow>

                      <CardStorageBtn onPress={() => clearStorageWeight()}>
                        <FontAwesomeIcon icon={faTimes} size={30} />
                      </CardStorageBtn>
                    </CardStorageWeight>
                  )}

                  <CardTotal
                    style={{
                      marginTop: 'auto',
                      justifyContent: 'center',
                      flexDirection: 'column',
                    }}>
                    {balanceActive && context.getDevice() != '' && (
                      <Warning>
                        <WarningText>Balança conectada!</WarningText>
                      </Warning>
                    )}
                    <CardTotalHeight>{weight} KG</CardTotalHeight>
                    {boxList.length > 0 && !setOrderReady() && (
                      <Divider style={{marginTop: 16}} />
                    )}
                    {weight > 0.01 && !setOrderReady() && (
                      <WeightActionArea>
                        {/* <WeightAction onPress={() => closeBox()}>
                          <WeightActionText>Fechar caixa</WeightActionText>
                        </WeightAction> */}

                        <WeightAction onPress={() => sendPrevWeight()}>
                          <WeightActionText>Salvar peso</WeightActionText>
                        </WeightAction>
                      </WeightActionArea>
                    )}

                    <RowWeightProgress>
                      <RowWeightProgressBar
                        percent={
                          ((Number(context.getStorageWeight()) +
                            Number(weight)) *
                            100) /
                          Number(product?.weight.box_weight)
                        }
                      />
                      <RowWeightProgressBarTextLeft>
                        {Number(
                          (Number(context.getStorageWeight()) +
                            Number(weight)) /
                            Number(product?.weight.box_unit_weight),
                        ).toFixed(0)}{' '}
                        vol |{' '}
                        {Number(
                          Number(context.getStorageWeight()) + Number(weight),
                        ).toFixed(3)}{' '}
                        kg
                      </RowWeightProgressBarTextLeft>

                      <RowWeightProgressBarTextRight>
                        {Number(product?.weight.box_weight).toFixed(3)} kg
                      </RowWeightProgressBarTextRight>
                    </RowWeightProgress>
                    {boxLevels && boxLevels.length >= 1 && (
                      <BalanceWaitingFloatLevel>
                        <WarningWaitingText>
                          {' '}
                          Alerta(s):
                          {boxLevels &&
                            boxLevels.length >= 1 &&
                            boxLevels.map(data => ' ' + Number(data) + ' KG |')}
                          {iamChecking === 1
                            ? 'CHECKING'
                            : iamChecking === 2
                            ? 'PASSEI'
                            : iamChecking === 3
                            ? 'WAITING'
                            : ''}
                        </WarningWaitingText>
                      </BalanceWaitingFloatLevel>
                    )}

                    {/* {balanceActive && weight > 1 && cancelInterval()} */}
                  </CardTotal>
                  <View
                    style={{
                      justifyContent: 'right',
                      flex: 1,
                      background: '#fff',
                    }}>
                    <Titulo>Olá, {userData?.first_name}</Titulo>
                    <BtnConfirm onPress={() => clearStorage()}>
                      <BtnConfirmText>SAIR</BtnConfirmText>
                    </BtnConfirm>
                  </View>
                  {getAllMaterialStatus()
                    ? !setOrderReady() &&
                      !showBtnBalance && (
                        <Card style={{width: '100%', marginTop: 8}}>
                          <ButtonDefault
                            text="Indicar Matéria"
                            onPress={() => {}}
                          />
                        </Card>
                      )
                    : showBtnBalance &&
                      !setOrderReady() && (
                        <>
                          <Card style={{width: '100%', marginTop: 8}}>
                            <ButtonDefault
                              text="Ativar balança"
                              onPress={() =>
                                productionData.status_maquina == 1
                                  ? initBalance()
                                  : {}
                              }
                            />
                          </Card>
                        </>
                      )}

                  {/* {showBtnBalance && !setOrderReady() && (
                    <Card style={{width: '100%', marginTop: 8}}>
                      <ButtonDefault
                        text="Ativar balança"
                        onPress={() => initBalance()}
                      />
                    </Card>
                  )} */}
                </Content>
              )}
              keyExtractor={(item, index) => index.toString()}
            />

            {setOrderReady() && (
              <RowBtnsFloat>
                <BtnWrapperFloat>
                  <Card>
                    <ButtonDefault
                      text="Concluir"
                      onPress={() => confirmProduction(product)}
                    />
                  </Card>
                </BtnWrapperFloat>
              </RowBtnsFloat>
            )}
          </>
        ) : (
          <Content>
            <Top>
              <TopLeftContent
                style={{flexDirection: 'row', justifyContent: 'space-between'}}>
                <Card style={{width: '58%'}}>
                  <RowWrapper>
                    <View>
                      <OrderNumber>
                        ordem #{product?.order_id.toString()}
                      </OrderNumber>
                      <OrderTitle>{product?.obj_description}</OrderTitle>
                      <ProductStatusTab>
                        <ProductStatusText
                          style={{fontSize: 15, color: '#000'}}>
                          {productionData?.maquinaData?.descricao}
                        </ProductStatusText>
                      </ProductStatusTab>
                    </View>

                    <RowLabels>
                      {/* <View>
                            <Label>Volume</Label>
                            <Value>{product?.obj_quantity}</Value>
                          </View> */}
                    </RowLabels>
                  </RowWrapper>
                </Card>

                <View style={{width: '38%'}}>
                  {productionData && productionData.status_maquina == 1 ? (
                    <ContainerStatusMaquina
                      style={{
                        height: 50,
                        marginBottom: 10,
                        alignContent: 'center',
                        alignItems: 'center',
                        justifyContent: 'center',
                        paddingVertical: 0,
                      }}
                      onPress={() => statusMaquina()}>
                      <BtnText>
                        Maquina Ligada - {productionData.usuario_status_maquina}
                      </BtnText>
                    </ContainerStatusMaquina>
                  ) : (
                    <ContainerStatusMaquina
                      style={{
                        backgroundColor: '#c33',
                        marginBottom: 10,
                        height: 50,
                        alignContent: 'center',
                        alignItems: 'center',
                        justifyContent: 'center',
                        paddingVertical: 0,
                      }}
                      onPress={() => statusMaquina()}>
                      <BtnText style={{color: '#fff'}}>
                        Maquina Desligada{' '}
                        {productionData.motivo_status_maquina
                          ? '- ' + productionData.motivo_status_maquina
                          : ''}
                      </BtnText>
                    </ContainerStatusMaquina>
                  )}

                  {productionData && productionData.status_producao == 1 ? (
                    <ContainerStatusMaquina
                      style={{
                        height: 50,
                        alignContent: 'center',
                        alignItems: 'center',
                        justifyContent: 'center',
                        paddingVertical: 0,
                      }}
                      onPress={() => statusProducao()}>
                      <BtnText>
                        Produção Ativa -{' '}
                        {productionData.usuario_status_producao}
                      </BtnText>
                    </ContainerStatusMaquina>
                  ) : (
                    <ContainerStatusMaquina
                      style={{
                        backgroundColor: '#c33',
                        height: 50,
                        alignContent: 'center',
                        alignItems: 'center',
                        justifyContent: 'center',
                        paddingVertical: 0,
                      }}
                      onPress={() => statusProducao()}>
                      <BtnText style={{color: '#fff'}}>
                        Produção desativada{' '}
                        {productionData.motivo_status_producao
                          ? '- ' + productionData.motivo_status_producao
                          : ''}
                      </BtnText>
                    </ContainerStatusMaquina>
                  )}
                </View>
              </TopLeftContent>
              <TopRightContent>
                {/* {getAllMaterialStatus() && !setOrderReady() && !showBtnBalance && (
                  <Card>
                    <ButtonDefault
                      text="Indicar Matéria"
                      onPress={() => setVisible(true)}
                    />
                  </Card>
                )} */}
                <View
                  style={{
                    justifyContent: 'space-between',
                    flex: 1,
                    flexDirection: 'row',

                    paddingHorizontal: 10,
                    borderRadius: 5,
                    paddingVertical: 5,
                    backgroundColor: '#e9722c',
                  }}>
                  <Titulo
                    style={{
                      color: '#fff',
                      width: '50%',
                    }}>
                    {userData?.first_name}
                  </Titulo>
                  <BtnConfirm onPress={() => clearStorage()}>
                    <BtnConfirmText>SAIR</BtnConfirmText>
                  </BtnConfirm>
                </View>
                {setOrderReady() && (
                  <Card>
                    <ButtonDefault
                      text="Concluir"
                      onPress={() => {
                        confirmProduction(product);
                      }}
                    />
                  </Card>
                )}

                {getAllMaterialStatus() && !setOrderReady() ? (
                  <Card style={{width: '100%', marginTop: 8, padding: 5}}>
                    <ButtonDefault text="Indicar Matéria" onPress={() => {}} />
                  </Card>
                ) : (
                  showBtnBalance &&
                  !setOrderReady() && (
                    <>
                      <Card style={{width: '100%', marginTop: 8, padding: 5}}>
                        <ButtonDefault
                          text="Ativar balança"
                          styleB={{height: 40}}
                          onPress={() =>
                            productionData.status_maquina == 1
                              ? initBalance()
                              : {}
                          }
                        />
                      </Card>
                    </>
                  )
                )}
              </TopRightContent>
            </Top>

            <Main>
              <MainLeftContent>
                <Card style={{height: hp(38)}}>
                  {boxList.length > 0 ? (
                    <FlatList
                      data={boxList.sort(
                        (a, b) => Number(b.code) - Number(a.code),
                      )}
                      renderItem={({item, index}) => (
                        <ItemList
                          rePrint={id => handleRePrint(Number(item.code))}
                          text={`${item.code} ${item.name}`}
                          productWeight={Number(item.weight).toFixed(3)}
                          onPress={() => {}}
                        />
                      )}
                      keyExtractor={(item, index) => index.toString()}
                    />
                  ) : (
                    <FloatImage source={assets.boxAnimationEmpty} />
                  )}

                  {/* <ProgressBarContainer>
                      <ProgressBar progressPercent={40} />
                    </ProgressBarContainer> */}
                </Card>
              </MainLeftContent>
              <MainRightContent>
                {product && (
                  <Wrapper>
                    <Card style={{height: hp(38)}}>
                      <Label>Matéria prima</Label>
                      <Divider />
                      <FlatList
                        data={context.getOrderMaterials()}
                        renderItem={({item, index}) => (
                          <ItemListMaterial
                            blocked={!getAllMaterialStatus()}
                            code={item.obj_id}
                            status={item.status_production}
                            handleTarugoRePrint={() =>
                              handleTarugoRePrint(item.id)
                            }
                            title={item.obj_description}
                            confirm={() =>
                              item.status_production == 'production'
                                ? confirmEndMaterial(item)
                                : selectMateria(item.id)
                            }
                          />
                        )}
                        keyExtractor={(item, index) => index.toString()}
                      />
                    </Card>
                  </Wrapper>
                )}
              </MainRightContent>
            </Main>

            <FooterContent>
              <MainLeftContent style={{width: '33%'}}>
                <CardTotal style={{flexDirection: 'column'}}>
                  {context.getStorageWeight() >= 0.01 && (
                    <WeightSaved>
                      <WeightSavedText>
                        Peso salvo:{' '}
                        {Number(context.getStorageWeight().toFixed(3))} kg
                      </WeightSavedText>
                      <CardStorageBtn
                        style={{marginLeft: 'auto'}}
                        onPress={() => clearStorageWeight()}>
                        <FontAwesomeIcon icon={faTimes} size={20} />
                      </CardStorageBtn>
                    </WeightSaved>
                  )}

                  {!showBtnBalance && (
                    <View
                      style={{
                        marginTop: 4,
                        flexDirection: 'row',
                        justifyContent:
                          balanceActive || context.getDevice() != ''
                            ? 'space-between'
                            : 'flex-end',
                        alignItems:
                          balanceActive || context.getDevice() != ''
                            ? 'center'
                            : 'flex-start',
                      }}>
                      <CardTotalHeight>{weight} KG</CardTotalHeight>

                      {weight > 0.01 && !setOrderReady() && (
                        <>
                          {/* <WeightActionTablet onPress={() => closeBox()}>
                            <WeightActionTabletText>
                              Fechar caixa
                            </WeightActionTabletText>
                          </WeightActionTablet> */}
                          {/*
                          <WeightActionTablet onPress={() => sendPrevWeight()}>
                            <WeightActionTabletText>
                              Salvar peso
                            </WeightActionTabletText>
                          </WeightActionTablet> */}
                        </>
                      )}
                    </View>
                  )}

                  {balanceWaitingActive == true ? (
                    <RowWeightProgress>
                      <RowWeightProgressBar percent={0} />
                      <RowWeightProgressBarTextLeft>
                        ----
                      </RowWeightProgressBarTextLeft>

                      <RowWeightProgressBarTextRight>
                        ---
                      </RowWeightProgressBarTextRight>
                    </RowWeightProgress>
                  ) : (
                    <>
                      <RowWeightProgress>
                        <RowWeightProgressBar
                          percent={
                            ((Number(context.getStorageWeight()) +
                              Number(weight)) *
                              100) /
                            Number(product?.weight.box_weight)
                          }
                        />
                        <View>
                          <RowWeightProgressBarTextLeft>
                            {Number(
                              (Number(context.getStorageWeight()) +
                                Number(weight)) /
                                Number(product?.weight.box_unit_weight),
                            ).toFixed(0)}{' '}
                            vol |{' '}
                            {Number(
                              Number(context.getStorageWeight()) +
                                Number(weight),
                            ).toFixed(3)}{' '}
                            kg
                          </RowWeightProgressBarTextLeft>

                          <RowWeightProgressBarTextRight>
                            {Number(product?.weight.box_weight).toFixed(3)} kg
                          </RowWeightProgressBarTextRight>
                        </View>
                      </RowWeightProgress>
                    </>
                  )}

                  {balanceActive && balanceWaitingActive == false && (
                    <BalanceActiveFloat>
                      <WarningText>Balança ativa!</WarningText>
                    </BalanceActiveFloat>
                  )}
                  {balanceWaitingActive == true && (
                    <BalanceWaitingFloat>
                      <WarningWaitingText>Retire o peso!</WarningWaitingText>
                    </BalanceWaitingFloat>
                  )}
                  {boxLevels && boxLevels.length >= 1 && (
                    <BalanceWaitingFloatLevel>
                      <WarningWaitingText>
                        {' '}
                        Alerta(s):
                        {boxLevels &&
                          boxLevels.length >= 1 &&
                          boxLevels.map(data => ' ' + Number(data) + ' KG |')}
                        {iamChecking === 1
                          ? 'CHECKING'
                          : iamChecking === 2
                          ? 'PASSEI'
                          : iamChecking === 3
                          ? 'WAITING'
                          : ''}
                      </WarningWaitingText>
                    </BalanceWaitingFloatLevel>
                  )}
                </CardTotal>
              </MainLeftContent>

              <MainCenterContent>
                <Card style={{width: '100%', marginTop: 8}}>
                  <ButtonDefault
                    disabled={
                      !(
                        weight > 0.01 &&
                        balanceWaitingActive == false &&
                        !setOrderReady()
                      )
                    }
                    text="Salvar peso"
                    onPress={() => sendPrevWeight()}
                  />
                </Card>
              </MainCenterContent>

              <MainRightContent style={{width: '33%'}}>
                {/* Card amarelo */}
                <VolumeCard>
                  <CardTotalText>Totais Fabricados:</CardTotalText>

                  <RowWrapper>
                    <ValueWeight>
                      {Number(
                        parseFloat(getVolume(boxList).toString()) /
                          Number(product?.weight.box_unit_weight),
                      ).toFixed(1)}{' '}
                      Volumes
                    </ValueWeight>
                  </RowWrapper>
                  <RowWrapper>
                    <RowWrapper>
                      <View>
                        <CardTotalHeight>
                          {Number(
                            Number(
                              parseFloat(getVolume(boxList).toString()) /
                                Number(product?.weight.box_unit_weight),
                            ).toFixed(1) /
                              (product?.weight.box_weight /
                                product?.weight.box_unit_weight),
                          ).toFixed(0)}{' '}
                          Fardo(s)
                        </CardTotalHeight>
                      </View>
                    </RowWrapper>
                  </RowWrapper>

                  <ProgressBarContainer>
                    <ProgressBarVolume
                      progressPercent={(
                        Number(
                          Number(
                            parseFloat(getVolume(boxList).toString()) /
                              Number(product?.weight.box_unit_weight),
                          ).toFixed(1) * 100,
                        ) / Number(product?.obj_quantity)
                      ).toFixed(0)}
                    />
                  </ProgressBarContainer>
                </VolumeCard>

                {/* Fim Card amarelo */}
              </MainRightContent>
            </FooterContent>

            {/* {verifyBoxFloor() && <FloatImage source={assets.boxAnimation} />} */}
          </Content>
        )}
        {modalTarugoWeight == true && (
          <ModalDefault
            visible={modalTarugoWeight}
            change={() => setModalTarugoWeight(false)}
            children={
              <ContainerTab
                style={{
                  backgroundColor: '#ffffff',
                  borderRadius: 10,
                  padding: 20,
                }}>
                <Text>Peso do Tarugo</Text>
                <Text style={{fontSize: 13}}>Finalizando matéria prima</Text>
                <InputArea>
                  <InputLabel>Peso em KG</InputLabel>
                  <InputText
                    keyboardType="phone-pad"
                    value={String(tarugoWeight)}
                    onChangeText={w => setTarugoWeight(w)}
                    placeholder="Digite aqui.."
                  />
                </InputArea>
                <RowBtns>
                  <BtnWrapper
                    style={{
                      marginLeft: Dimensions.get('screen').width < 520 ? 5 : 0,
                    }}>
                    <ButtonWithBorder
                      text="Cancelar"
                      onPress={() => cancelTarugoWeight()}
                    />
                  </BtnWrapper>

                  <BtnWrapper>
                    {loading ? (
                      <ModalIndicator />
                    ) : (
                      <ButtonDefault
                        text="Finalizar"
                        onPress={() => {
                          if (tarugoWeight == '') {
                            alert('campo vazio');
                          } else {
                            saveTarugoWeight(Number(tarugoWeight));
                          }
                        }}
                      />
                    )}
                  </BtnWrapper>
                </RowBtns>
              </ContainerTab>
            }
          />
        )}
        <ModalDefault
          visible={modalRollLeft}
          change={() => setModalRollLeft(false)}
          children={
            <ContainerTab
              style={{
                backgroundColor: '#ffffff',
                borderRadius: 10,
                padding: 20,
              }}>
              <Text>Peso restante da bobina</Text>
              <Text style={{fontSize: 13}}>Finalizando matéria prima</Text>
              <InputArea>
                <InputLabel>Peso em KG</InputLabel>
                <InputText
                  keyboardType="phone-pad"
                  value={rollWeightLeft}
                  onChangeText={weight => setRollWeightLeft(weight)}
                  placeholder="Digite aqui.."
                />
              </InputArea>
              <RowBtns>
                <BtnWrapper
                  style={{
                    marginLeft: Dimensions.get('screen').width < 520 ? 5 : 0,
                  }}>
                  <ButtonWithBorder
                    text="Cancelar"
                    onPress={() => cancelModalRollLeft()}
                  />
                </BtnWrapper>

                <BtnWrapper>
                  {loading ? (
                    <ModalIndicator />
                  ) : (
                    <ButtonDefault
                      text="Finalizar"
                      onPress={() => {
                        if (rollWeightLeft == '') {
                          alert('campo vazio');
                        } else {
                          saveRollLeft(Number(rollWeightLeft));
                        }
                      }}
                    />
                  )}
                </BtnWrapper>
              </RowBtns>
            </ContainerTab>
          }
        />
        <ModalDevices
          data={devices}
          confirm={id => connectDevice(id)}
          visible={visibleModalBluetooth}
          change={() => setVisibleModalBluetooth(false)}
          loading={loading}
        />
        {visible && (
          <ModalIndicateMaterial
            confirm={code => setNewMaterialToProduct(code)}
            visible={visible}
            materiaSelecionada={Number(materiaSelecionada)}
            change={() => setVisible(false)}
            loading={loading}
          />
        )}

        <ModalBoxFinished
          change={() => setVisibleModalBox(false)}
          visible={visibleModalBox}
          cancel={() => closeModalfinished()}
          confirm={() => boxCreate()}
          loading={loading}
          finalWeight={finalWeight}
          weightToCompare={product?.weight?.box_weight}
          max={
            Number(product?.weight?.box_weight) +
            Number(product?.weight?.box_unit_weight)
          }
          min={
            Number(product?.weight?.box_weight) -
            Number(product?.weight?.box_unit_weight)
          }
          weightActual={Number(weight) + Number(context.getStorageWeight())}
          unitWeight={product?.weight?.box_unit_weight}
        />
        <ModalDefault
          change={() => setVisibleModalStatusMaquina(false)}
          visible={visibleModalStatusMaquina}
          children={
            <ContainerTab
              style={{
                backgroundColor: '#ffffff',
                borderRadius: 10,
                padding: 20,
                height: '100%',
              }}>
              {productionData && productionData.status_maquina == 1 ? (
                <>
                  <Text style={{fontSize: 15}}>
                    Tem certeza que deseja desligar a maquina?
                  </Text>
                  {turnOffOptions && turnOffOptions.maquina.length >= 1 && (
                    <List>
                      {turnOffOptions.maquina.map(d => (
                        <BotaoList
                          active={opcaoMaquina == d.id}
                          onPress={() => setOpcaoMaquina(d.id)}>
                          <Text style={{fontSize: 16}}>{d.description}</Text>
                        </BotaoList>
                      ))}
                    </List>
                  )}
                  <ContainerStatusMaquina
                    style={{backgroundColor: '#c33', paddingVertical: 20}}
                    onPress={() => turnMaquina(0)}>
                    <BtnText
                      style={{
                        fontSize: 20,
                        justifyContent: 'center',
                        color: '#fff',
                      }}>
                      Sim! DESLIGAR a Maquina
                    </BtnText>
                  </ContainerStatusMaquina>
                </>
              ) : (
                <>
                  <Text style={{fontSize: 15}}>
                    Tem certeza que deseja ligar a maquina?
                  </Text>

                  <ContainerStatusMaquina
                    style={{paddingVertical: 20}}
                    onPress={() => turnMaquina(1)}>
                    <BtnText style={{fontSize: 20, justifyContent: 'center'}}>
                      Sim! LIGAR a Maquina
                    </BtnText>
                  </ContainerStatusMaquina>
                </>
              )}
            </ContainerTab>
          }
        />
        <ModalDefault
          change={() => setVisibleModalStatusProducao(false)}
          visible={visibleModalStatusProducao}
          children={
            <ContainerTab
              style={{
                backgroundColor: '#efb3b3',
                borderRadius: 10,
                padding: 20,
                height: '100%',
              }}>
              {productionData && productionData.status_producao == 1 ? (
                <>
                  <Text style={{fontSize: 15}}>
                    Tem certeza que deseja desativar a produção?
                  </Text>
                  {turnOffOptions && turnOffOptions.producao.length >= 1 && (
                    <List>
                      {turnOffOptions.producao.map(d => (
                        <BotaoList
                          active={opcaoProducao == d.id}
                          onPress={() => setOpcaoProducao(d.id)}>
                          <Text style={{fontSize: 16}}>{d.description}</Text>
                        </BotaoList>
                      ))}
                    </List>
                  )}
                  <ContainerStatusMaquina
                    style={{backgroundColor: '#c33', paddingVertical: 20}}
                    onPress={() => turnProducao(0)}>
                    <BtnText
                      style={{
                        fontSize: 20,
                        justifyContent: 'center',
                        color: '#fff',
                      }}>
                      Sim! DESATIVAR a Produção
                    </BtnText>
                  </ContainerStatusMaquina>
                </>
              ) : (
                <>
                  <Text style={{fontSize: 15}}>
                    Tem certeza que deseja ATIVAR a Produção?
                  </Text>

                  <ContainerStatusMaquina
                    style={{paddingVertical: 20}}
                    onPress={() => turnProducao(1)}>
                    <BtnText style={{fontSize: 20, justifyContent: 'center'}}>
                      Sim! ATIVAR a Produção
                    </BtnText>
                  </ContainerStatusMaquina>
                </>
              )}
            </ContainerTab>
          }
        />
        <ModalBoxFloor
          change={() => setVisibleModalFloor(false)}
          visible={visibleModalFloor}
          confirm={() => sendPrevWeight()}
          loading={loading}
          balanceWeight={Number(weight)}
          weightActual={Number(weight) + Number(context.getStorageWeight())}
          weightTarget={prevWeightFloor}
          unitWeight={product?.weight?.box_unit_weight}
          max={
            Number(prevWeightFloor) + Number(product?.weight?.box_unit_weight)
          }
          min={
            Number(prevWeightFloor) - Number(product?.weight?.box_unit_weight)
          }
        />
        <ModalDefault
          change={() => setVisibleModalWarningFloor(false)}
          visible={visibleModalWarningFloor}
          children={
            <ContainerTab
              style={{
                backgroundColor: '#c33',
                borderRadius: 10,
                padding: 20,
                height: '400',
              }}>
              {productionData && productionData.status_producao == 1 ? (
                <>
                  <FontAwesomeIcon
                    icon={faWarning}
                    size={120}
                    style={{
                      color: '#faaa48',
                      position: 'absolute',
                      left: 50,
                      top: -40,
                    }}
                  />
                  <Text style={{fontSize: 30, color: '#fff', marginTop: 70}}>
                    PESO SALVO! Necessário armazenar o volume
                  </Text>

                  <ContainerStatusMaquina
                    style={{backgroundColor: '#a43b3b', paddingVertical: 20}}
                    onPress={() => setVisibleModalWarningFloor(false)}>
                    <BtnText
                      style={{
                        fontSize: 20,
                        justifyContent: 'center',
                        color: '#fff',
                      }}>
                      Feito!
                    </BtnText>
                  </ContainerStatusMaquina>
                </>
              ) : (
                <>
                  <Text style={{fontSize: 15}}>
                    Tem certeza que deseja ATIVAR a Produção?
                  </Text>

                  <ContainerStatusMaquina
                    style={{paddingVertical: 20}}
                    onPress={() => turnProducao(1)}>
                    <BtnText style={{fontSize: 20, justifyContent: 'center'}}>
                      Sim! ATIVAR a Produção
                    </BtnText>
                  </ContainerStatusMaquina>
                </>
              )}
            </ContainerTab>
          }
        />
        {prinData.printList.length > 0 && (
          <SendPrint
            print={true}
            printLink={prinData.printLink}
            printList={prinData.printList}
          />
        )}
      </Container>
    </BackGroundComponent>
  );
};

const InputArea = styled.View`
  margin: 36px 0;
`;
const ContainerTab = styled.View`
  ${Dimensions.get('screen').width < 520 && 'flex: 1'};
  ${Dimensions.get('screen').width > 520 && 'width: 600px'};
  background-color: ${({theme}) => theme.cardBackGround};
  border-radius: 20px;
  padding: ${Dimensions.get('screen').width < 520 ? '16px 8px' : '16px 56px'};
  align-self: center;
`;

const InputLabel = styled.Text`
  margin-bottom: 10px;
  color: ${({theme}) => theme.color};
`;
type InputTextProps = {
  myTheme?: string;
};
const InputText = styled.TextInput.attrs<InputTextProps>(props => ({
  placeholderTextColor: props.theme.gray,
}))<InputTextProps>`
  background-color: ${({theme, myTheme}) =>
    myTheme == 'dark' ? theme.cardBackGround : theme.background};
  border-radius: 30px;
  padding: 10px;
  width: 100%;
  color: ${({theme}) => theme.color};
  text-align: center;
`;

const RowBtns = styled.View`
  flex-direction: row;
  align-items: center;
  justify-content: space-between;
  margin: 16px 0;
`;

const BtnWrapper = styled.View`
  width: ${Dimensions.get('screen').width < 520 ? '42%' : '40%'};
  margin: ${Dimensions.get('screen').width < 520 ? '0 18px' : '0 16px'};
`;

const ModalIndicator = styled(ActivityIndicator).attrs(props => ({
  color: props.theme.primary,
  size: 30,
}))`
  align-self: center;
`;

const Text = styled.Text`
  font-size: 32px;
  font-weight: bold;
  text-transform: uppercase;
  color: ${({theme}) => theme.color};
  font-family: ${({theme}) => theme.fontPrimary};
  margin: 16px 0;
`;
export const Container = styled.View`
  flex: 1;
  flex-direction: ${Dimensions.get('screen').width < 520 ? 'column' : 'row'};
`;

export const LeftSide = styled.View`
  width: ${Dimensions.get('screen').width < 520 ? '100%' : '35%'};
`;

export const RightSide = styled.View`
  width: ${Dimensions.get('screen').width < 520 ? '100%' : '65%'};
`;

const Content = styled.View`
  flex: 1;
  padding: 16px;
`;

const Top = styled.View`
  width: 100%;
  flex-direction: row;
  align-items: center;
  justify-content: space-around;
`;

const TopLeftContent = styled.View`
  width: 68%;
`;

const TopRightContent = styled.View`
  width: 27%;
`;

const Main = styled.View`
  width: 100%;
  margin: 6px 0;
  flex-direction: row;
  justify-content: space-between;
  padding: 16px;
`;
const CardTotalIcon = styled(FontAwesomeIcon)`
  margin-left: auto;
  color: ${({theme}) => theme.white};
`;
const ProductStatusTab = styled.View`
  background-color: ${({theme, status}) =>
    status == 'waiting' ? theme.green : theme.lightBlue};
  justify-content: center;
  align-items: center;
  border-radius: 15px;
  padding: 5px;
  margin: 8px 0;
`;

const ProductStatusText = styled.Text`
  color: ${({theme}) => theme.dark};
  font-family: ${({theme}) => theme.fontSecondary};
  font-size: 10px;
`;
const MainLeftContent = styled.View`
  width: 49%;
`;

const MainCenterContent = styled.View`
  width: 30%;
`;

const MainRightContent = styled.View`
  width: 47.5%;
`;

const Card = styled.View`
  border-radius: 15px;
  padding: 16px;
  background-color: ${({theme}) => theme.cardBackGround};
`;

const RowWrapper = styled.View`
  flex-direction: row;
  align-items: center;
`;

const Label = styled.Text`
  font-size: ${FontsDefault.large};
  color: ${({theme}) => theme.color};
  font-family: ${({theme}) => theme.fontPrimary};
`;

const Value = styled.Text`
  font-size: ${FontsDefault.medium};
  color: ${({theme}) => theme.color};
  font-family: ${({theme}) => theme.fontSecondary};
`;

const ValueWeight = styled.Text`
  font-size: ${FontsDefault.medium};
  color: ${({theme}) => theme.white};
  font-family: ${({theme}) => theme.fontSecondary};
`;

const RowLabels = styled.View`
  flex-direction: row;
  margin-left: auto;
`;

const OrderNumber = styled.Text`
  font-size: ${FontsDefault.medium};
  color: ${({theme}) => theme.primary};
  font-family: ${({theme}) => theme.fontPrimary};
`;

const OrderTitle = styled.Text`
  font-size: ${FontsDefault.large};
  color: ${({theme}) => theme.color};
  text-transform: uppercase;
  font-weight: bold;
  font-family: ${({theme}) => theme.fontPrimary};
`;

const ProgressBarContainer = styled.View`
  flex-direction: row;
  height: 16px;
  border-radius: 15px;
  background-color: ${({theme}) => theme.background};
  width: 100%;
  margin-top: 8px;
  align-items: center;
  padding: 1.5px;
`;

type ProgressBarProps = {
  progressPercent: number;
};
const ProgressBar = styled.View<ProgressBarProps>`
  width: ${({progressPercent}) => `${progressPercent}%`};
  flex-direction: row;
  padding: 0 2px;
  height: 14px;
  border-radius: 15px;
  background-color: ${({theme}) => theme.primary};
`;

const ProgressBarVolume = styled.View<ProgressBarProps>`
  width: ${({progressPercent}) => `${progressPercent}%`};
  flex-direction: row;
  height: 14px;
  border-radius: 15px;
  background-color: ${({theme}) => theme.lightYellow};
`;

const FooterContent = styled.View`
  flex-direction: row;
  align-items: center;
  justify-content: space-between;
  width: 100%;
  padding: 1px 16px;
`;

const VolumeCard = styled.View`
  border-radius: 15px;
  padding: 16px;
  background-color: #f58506;
  margin: 6px 0;
`;

const Divider = styled.View`
  height: 2px;
  width: 100%;
  background-color: ${({theme}) => theme.background};
`;

const Wrapper = styled.View``;

const CardStorageWeight = styled.View`
  border-radius: 15px;
  padding: ${Dimensions.get('screen').width < 520 ? '24px 16px' : '2px 16px'};
  background-color: ${({theme}) => theme.primary};
`;

const CardStorageWeightRow = styled.View`
  flex-direction: row;
  align-items: center;
  justify-content: space-between;
`;
const List = styled.ScrollView``;
const BotaoList = styled.TouchableOpacity`
  padding: 10px;
  border-color: ${({active}) => (active ? '#063' : '#ccc')};
  background-color: ${({active}) => (active ? '#bbe1ce' : '#fff')};
  border-width: 1;
  margin: 5px 0;
  border-radius: 10px;
`;
const ContainerStatusMaquina = styled.TouchableOpacity`
  background: #48f49e;
  margin-top: 5px;
  border-radius: 10px;
`;
const CardStorageBtn = styled.TouchableOpacity`
  height: 30px;
  width: 30px;
  border-radius: 25px;
  justify-content: center;
  align-items: center;
  background-color: ${({theme}) => theme.red};
  align-self: center;
`;
const BtnText = styled.Text`
  font-weight: bold;
  text-align: center;
  font-size: 16px;
  color: #3f3f3e;
`;
const CardStorageBtnText = styled.Text`
  font-weight: bold;
  font-size: ${FontsDefault.large};
  color: ${({theme}) => theme.white};
`;

const CardTotal = styled.View`
  border-radius: 15px;
  padding: 24px 16px;
  background-color: ${({theme}) => theme.primary};
  flex-direction: row;
  align-items: center;
  justify-content: space-between;
`;

const CardTotalText = styled.Text`
  font-size: ${FontsDefault.large};
  color: ${({theme}) => theme.white};
  font-family: ${({theme}) => theme.fontSecondary};
`;

const CardSmallHeight = styled.Text`
  text-transform: uppercase;
  font-weight: bold;
  font-size: 25px;
  color: ${({theme}) => theme.white};
  font-family: ${({theme}) => theme.fontPrimary};
`;

const CardTotalHeight = styled.Text`
  text-transform: uppercase;
  font-weight: bold;
  font-size: 32px;
  color: ${({theme}) => theme.white};
  font-family: ${({theme}) => theme.fontPrimary};
`;

const Warning = styled.View`
  flex-direction: row;
  align-items: center;
  margin-bottom: 16px;
  border-radius: 22px;
  width: 100%;
  justify-content: center;
  align-items: center;
  background-color: ${({theme}) => theme.green};
`;

const WarningWaitingText = styled.Text`
  text-transform: uppercase;
  font-weight: bold;
  font-size: 16px;
  color: #fff;
  font-family: ${({theme}) => theme.fontPrimary};
`;

const WarningText = styled.Text`
  text-transform: uppercase;
  font-weight: bold;
  font-size: 16px;
  color: ${({theme}) => theme.color};
  font-family: ${({theme}) => theme.fontPrimary};
`;

const WeightSaved = styled.View`
  flex-direction: row;
  align-items: center;
  margin-bottom: 6px;
  border-radius: 22px;
  width: 100%;
  align-items: center;
`;

const WeightSavedText = styled.Text`
  text-transform: uppercase;
  font-weight: bold;
  font-size: 16px;
  color: ${({theme}) => theme.color};
  font-family: ${({theme}) => theme.fontPrimary};
  background-color: ${({theme}) => theme.red};
`;

const WeightActionArea = styled.View`
  flex-direction: row;
  align-items: center;
  margin-top: 16px;
`;

const WeightAction = styled.TouchableOpacity`
  border: 1px solid ${({theme}) => theme.color};
  padding: 16px;
  justify-content: center;
  align-items: center;
  margin: 0 16px;
  border-radius: 26px;
`;

const WeightActionTablet = styled.TouchableOpacity`
  border: 1px solid ${({theme}) => theme.color};
  padding: 10px;
  height: 46px;
  justify-content: center;
  align-items: center;
  margin: 0 6px;
  border-radius: 12px;
`;

const WeightActionTabletText = styled.Text`
  text-transform: uppercase;
  font-weight: bold;
  font-size: 20px;
  color: ${({theme}) => theme.white};
  font-family: ${({theme}) => theme.fontPrimary};
`;

const WeightActionText = styled.Text`
  text-transform: uppercase;
  font-weight: bold;
  font-size: 14px
  color: ${({theme}) => theme.white};
  font-family: ${({theme}) => theme.fontPrimary};
`;

const CardReady = styled.TouchableOpacity`
  border-radius: 15px;
  padding: 24px 16px;
  background-color: ${({theme}) => theme.cardBackGround};
  justify-content: center;
  align-items: center;
  margin-top: 16px;
`;

const RowBtnsFloat = styled.View`
  width: 100%;
  padding: 5px 0;
  position: absolute;
  bottom: 0;
`;

const BtnWrapperFloat = styled.View`
  padding: 0 16px;
`;

const RowWeightProgress = styled.View`
  margin: 16px 0;
  width: 100%;
  border-radius: 12px;
  background-color: ${({theme}) => theme.cardBackGround};
`;

const RowWeightProgressBar = styled.View<{percent: number}>`
  width: ${({percent}) => `${percent}%`};
  height: 12px;
  background-color: ${({theme}) => theme.green};
  border-radius: 12px;
`;

const FloatImage = styled.ImageBackground`
  width: 300px;
  height: ${Dimensions.get('screen').width < 520 ? '150px' : '200px'};
  border-radius: 10px;
  align-self: center;
  top: ${Dimensions.get('screen').width < 520 ? '0px;' : '-5px'};
  position: absolute;
  /* align-self: center; */
`;

const RowWeightProgressBarTextLeft = styled.Text`
  font-size: 20px;
  font-weight: bold;
  color: ${({theme}) => theme.white};
  position: absolute;
  left: 0;
  top: 16px;
`;

const RowWeightProgressBarTextRight = styled.Text`
  font-size: 20px;
  font-weight: bold;
  color: ${({theme}) => theme.white};
  position: absolute;
  right: 0;
  top: 16px;
`;
const BalanceWaitingFloatLevel = styled.View`
  width: auto;
  padding: 2px 5px;
  height: 20px;
  position: absolute;
  top: -15px;
  align-self: center;
  background-color: #aa3131;
  justify-content: center;
  align-items: center;
  z-index: 1000;
  border-radius: 12px;
`;
const Titulo = styled.Text`
  font-size: 25px;
  color: #3f3f3e;
  font-weight: bold;
  width: auto;
  justify-content: center;
  align-items: center;
  flex: 1;
  vertical-align: middle;
`;
const BtnConfirm = styled.TouchableOpacity`
  border-radius: 15px;
  padding: 5px 10px;
  justify-content: center;
  align-items: center;
  flex: 1;
  vertical-align: middle;
  background-color: #fff;
  width: 50px;
`;

const BtnConfirmText = styled.Text`
  color: #c33;
  font-weight: bold;
  font-size: 16px;
`;
const BalanceWaitingFloat = styled.View`
  width: 200px;
  height: 20px;
  position: absolute;
  top: 4px;
  align-self: center;
  background-color: #aa3131;
  justify-content: center;
  align-items: center;
  z-index: 1000;
  border-radius: 12px;
`;

const BalanceActiveFloat = styled.View`
  width: 200px;
  height: 20px;
  position: absolute;
  top: 4px;
  align-self: center;
  background-color: ${({theme}) => theme.green};
  justify-content: center;
  align-items: center;
  z-index: 1000;
  border-radius: 12px;
`;

export {Producao};
