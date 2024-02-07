import React, {useEffect, useState, useContext, useReducer} from 'react';
import {View, FlatList, Alert, Dimensions} from 'react-native';
import {ProductPedido} from '../components/ProductPedido';
import {ProductPedidoTablet} from '../components/ProductPedidoTablet';
import styled from 'styled-components/native';
import {FontsDefault} from '../styles/fonts';
import {FontAwesomeIcon} from '@fortawesome/react-native-fontawesome';
import {faDollarSign} from '@fortawesome/free-solid-svg-icons';
import {ModalConferenceTablet} from '../components/ModalConferenceTablet';
import {ModalConference} from '../components/ModalConference';
import {ModalFinish} from '../components/ModalFinish';
import {ModalInitProcess} from '../components/ModalInitProcess';
import {SendPrint} from '../components/SendPrint';

import {ButtonDefault} from '../components/ButtonDefault';
import {ButtonWithBorder} from '../components/ButtonWithBorder';
import {BackGroundComponent} from '../components/BackGroundComponent';
import {Apis} from '../services/api';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {
  ResponseNoteDetail,
  ObjectNoteProduct,
  ObjectNoteProductStock,
} from '../models/NoteProductProps';
import {ResponseNote} from '../models/NoteProps';
import {Indicator} from '../components/Indicator';
import {OrderContext} from '../context/OrderContext';

interface PrintProps {
  printList: Array<string>;
  printLink: string;
}

const DetalhesPedido: React.FC = ({route, navigation}) => {
  const context = useContext(OrderContext);
  useEffect(() => {
    const getNoteDetail = async () => {
      setLoading(true);
      const {data} = route.params;

      let asyncToken: Promise<string | null> = await AsyncStorage.getItem(
        '@user:token',
      );
      let token = JSON.parse(asyncToken);
      try {
        const resNote = await Apis.apiPlugin.get(
          `${token}/orders/HLplastOrders/HLplastOrderObjects/read?order_id=${data.id}&prepareData=true`,
        );

        console.log({aaaaaa: resNote.data.orderObjectsData});

        context.populateNoteProducts(resNote.data.orderObjectsData);
        setNoteDetail({note: data, products: resNote.data.orderObjectsData});
        setLoading(false);
        // setData(resNotes.data.deliveriesData);
      } catch (error) {
        console.log('opss');
        setLoading(false);
      }
    };

    getNoteDetail();
  }, []);
  const [, forceUpdate] = useReducer(x => x + 1, 0);
  const [visibleModalConference, setVisibleModalConference] = useState(false);
  const [visibleModalDelivery, setVisibleModalDelivery] = useState(false);
  const [visibleModalLastStep, setVisibleModalLastStep] = useState(false);
  const [visible, setVisible] = useState(false);
  const [modeConference, setModeConference] = useState(false);
  const [loading, setLoading] = useState(false);
  const [loadingConference, setLoadingConference] = useState(false);
  const [loadingModal, setLoadingModal] = useState(false);
  const [loadingCompleteProcess, setLoadingCompleteProcess] = useState(false);
  const [totalReady, setTotalReady] = useState(false);
  const [prevDataModal, setPrevDataModal] = useState<
    ResponseNoteDetail | undefined
  >(undefined);
  const [prinData, setPrintData] = useState<PrintProps>({
    printLink: '',
    printList: [],
  });
  const [noteDetail, setNoteDetail] = useState({
    note: null as null | ResponseNote,
    products: [] as [] | ResponseNoteDetail[],
  });

  // const [data, setData] = useState<>([]);

  const activeModeConference = async () => {
    setLoadingModal(true);
    // utilizar rota aqui de produção
    let asyncToken: string | null = await AsyncStorage.getItem('@user:token');
    let token = JSON.parse(asyncToken);
    try {
      const resNoteObj = await Apis.apiPlugin.post(
        `${token}/orders/HLplastOrders/HLplastOrders/startConference
        `,
        {
          orderId: noteDetail?.note.id,
        },
      );
      let newNoteDetail = noteDetail;
      newNoteDetail.note.status = 'conference';
      setNoteDetail(newNoteDetail);
      setVisibleModalConference(false);
      setModeConference(true);
      context.setNoteStatus(resNoteObj.data.orderData.id, 'conference');
      setVisible(false);
      setLoadingModal(false);
    } catch (error) {
      setLoadingModal(false);
      console.log('opss');
    }
  };
  const activeModeEnd = async () => {
    setLoadingModal(true);
    // utilizar rota aqui de produção
    let asyncToken: string | null = await AsyncStorage.getItem('@user:token');
    let token = JSON.parse(asyncToken);
    try {
      const resNoteObj = await Apis.apiPlugin.post(
        `${token}/orders/HLplastOrders/HLplastOrders/endConference
        `,
        {
          orderId: noteDetail?.note.id,
        },
      );
      let newNoteDetail = noteDetail;
      newNoteDetail.note.status = 'separated';
      setNoteDetail(newNoteDetail);
      setVisibleModalLastStep(false);
      setModeConference(true);
      context.setNoteStatus(resNoteObj.data.orderData.id, 'separated');
      setVisible(false);
      setLoadingModal(false);
    } catch (error) {
      setLoadingModal(false);
      console.log('opss');
    }
  };
  const activeModeDelivery = async () => {
    setLoadingModal(true);
    // utilizar rota aqui de produção
    let asyncToken: string | null = await AsyncStorage.getItem('@user:token');
    let token = JSON.parse(asyncToken);
    try {
      const resNoteObj = await Apis.apiPlugin.post(
        `${token}/orders/HLplastOrders/HLplastOrders/deliveryOrder
        `,
        {
          orderId: noteDetail?.note.id,
        },
      );
      let newNoteDetail = noteDetail;
      newNoteDetail.note.status = 'done';
      setNoteDetail(newNoteDetail);
      setVisibleModalDelivery(false);
      setModeConference(true);
      context.setNoteStatus(resNoteObj.data.orderData.id, 'done');
      setVisible(false);
      setLoadingModal(false);
    } catch (error) {
      setLoadingModal(false);
      console.log('opss');
    }
  };
  const confirmConferenceObject = (noteObj: ResponseNoteDetail) => {
    if (noteObj.status == 'conference') {
      setPrevDataModal(noteObj);
      if (Dimensions.get('screen').width < 520) {
        setVisible(true);
      } else {
        navigation.push('ConferenciaNota', {data: noteObj});
      }
    } else {
      Alert.alert(
        'Deseja imprimir as etiquetas: ' + noteObj.obj_description,
        '',
        [
          {
            text: 'Cancel',
            onPress: () => {},
            style: 'cancel',
          },
          {
            text: 'OK',
            onPress: async () => {
              await handleChangeStatusObjectNote(noteObj.id, 'conference');
            },
          },
        ],
        {cancelable: true},
      );
    }
  };

  const handleChangeStatusObjectNote = async (
    paramId: number,
    status: string,
  ) => {
    setLoadingCompleteProcess(true);
    let asyncToken: string | null = await AsyncStorage.getItem('@user:token');
    let token = JSON.parse(asyncToken);
    console.log({
      aaaaa: {
        objOrderId: paramId,
        status: status,
      },
    });

    try {
      const resNoteObj = await Apis.apiPlugin.post(
        `${token}/orders/HLplastOrders/HLplastOrderObjects/objectPrint
        `,
        {
          objOrderId: paramId,
          status: status,
        },
      );

      console.log({resNoteObj: resNoteObj.data});
      if (resNoteObj.data.printLink) {
        setPrintData({
          printLink: resNoteObj.data.printLink,
          printList: resNoteObj.data.printList,
        });
      }
      let newDetail = noteDetail;
      newDetail.product = noteDetail.products.map(data => {
        if (data.id == paramId) {
          data.label_status = 1;
        }
        return data;
      });
      context.setNoteProductStatus(paramId, 'done');
      setNoteDetail(newDetail);
      setTimeout(() => {
        setPrintData({
          printLink: '',
          printList: [],
        });
      }, 2000);
      // setLoadingCompleteProcess(false);
      // setVisible(false);
    } catch (error) {
      // setLoadingCompleteProcess(false);
      console.log({error: error.response.data});
    }
  };

  const verifyStatus = () => {
    return true;
  };

  const finishNote = async () => {
    setLoadingCompleteProcess(true);
    let asyncToken: string | null = await AsyncStorage.getItem('@user:token');
    let token = JSON.parse(asyncToken);
    try {
      const resProduction = await Apis.apiPlugin.post(
        `${token}/purchase/%20PurchaseDelivery/PurchaseDeliveries/preDone
        `,
        {
          deliveryId: noteDetail.note?.id,
        },
      );
      context.setNoteStatus(noteDetail.note?.id, 'pre_finish');
      setLoadingCompleteProcess(false);
      setVisibleModalLastStep(false);

      setTimeout(() => {
        navigation.goBack();
      }, 800);
    } catch (error) {
      setLoadingCompleteProcess(false);
      console.log('opss');
      // navigation.push('Login');
    }
  };

  const getTotalMoney = (arrProduct: Array<ResponseNoteDetail>) => {
    let totalParse = arrProduct.map(product => {
      if (product != null) {
        return Number(product.purchaseObjData.price);
      }
    });

    let total = totalParse.reduce((a, b) => Number(a) + Number(b), 0);
    return total?.toFixed(3);
  };

  const getTotaladd = (arrProducts: Array<ResponseNoteDetail>) => {
    let totalQtd = 0;
    let totalParse = arrProducts.map(product => {
      totalQtd = totalQtd + product.stockData.length;
    });
    return totalQtd;
  };

  const getTotalAddWeight = (arrProducts: Array<ResponseNoteDetail>) => {
    let weights: Array<string> = [];
    arrProducts.map(prod => {
      prod.stockData.map((stock: ObjectNoteProductStock) => {
        weights.push(stock.total_weight);
      });
    });

    let total = weights.reduce((a, b) => Number(a) + Number(b), 0);
    return total?.toFixed(3);
  };
  const getStatusString = (status: string) => {
    if (status == 'done') {
      return 'FINALIZADO';
    } else if (status == 'conference') {
      return 'EM SEPARAÇÃO';
    } else if (status == 'waiting') {
      return 'AGUARDANDO SEPARAÇÃO';
    } else if (status == 'separated') {
      return 'AGUARDANDO ENTREGA';
    }
  };

  const getAllStatus = () => {
    let total = context
      .getNoteProducts()
      .filter((obj: ResponseNote) => obj.status == 'conference');
    if (total.length > 0) {
      return false;
    } else {
      return true;
    }
  };

  const Content = React.memo(() => (
    <LeftSide>
      <>
        <Card>
          <OrderNumber>Pedido {'#' + noteDetail.note?.code}</OrderNumber>
          <OrderTitle>{noteDetail.note?.part_data.name_real}</OrderTitle>
          <DateRow>
            <DateWrapper>
              {noteDetail.note?.shipData && (
                <>
                  <LabelNote>Forma de entrega</LabelNote>
                  <LabelValue>{noteDetail.note?.shipData.shipName}</LabelValue>
                  {noteDetail.note?.shipData.carrier_id && (
                    <LabelValue>
                      {noteDetail.note?.shipData.carrierData.name_real}
                    </LabelValue>
                  )}
                </>
              )}
            </DateWrapper>
          </DateRow>
          <ProductStatusTab status={noteDetail.note?.status}>
            <ProductStatusText>
              {getStatusString(noteDetail.note?.status)}
            </ProductStatusText>
          </ProductStatusTab>
        </Card>
      </>

      {/* <Card>
        <Label>E-mail(s)</Label>
        {noteDetail.note?.purchaseData.contact_emails.map((emails) => (
          <Value>{emails}</Value>
        ))}

        <View style={{marginTop: 20}}>
          <Label>Endereço(s)</Label>
          {noteDetail.note?.purchaseData.address_data.map((ad) => (
            <Value>{`${ad.address} - ${ad.city}`}</Value>
          ))}
        </View>
      </Card> */}

      <CardTotal>
        <View>
          <CardTotalText>Total de caixas</CardTotalText>
          <CardTotalHeight>15 Caixa(s)</CardTotalHeight>
        </View>
        <CardTotalIcon icon={faDollarSign} size={30} />
      </CardTotal>
    </LeftSide>
  ));

  return (
    <BackGroundComponent>
      {loading ? (
        <Indicator />
      ) : (
        <Container>
          {Dimensions.get('screen').width < 520 ? (
            <>
              <FlatList
                data={[0]}
                renderItem={({item, index}) => (
                  <>
                    <Content />
                    <FlatList
                      style={{marginBottom: 100}}
                      data={noteDetail.products}
                      renderItem={({item, index}) => (
                        <ProductPedido
                          data={item}
                          status={item.status}
                          arrayStock={item.stockData}
                          actionDelete={() => {}}
                          actionEdit={() => {}}
                          active={false}
                          blocked={noteDetail.note?.status == 'waiting'}
                          onPress={() => confirmConferenceObject(item)}
                        />
                      )}
                      keyExtractor={(item, index) => index.toString()}
                    />
                  </>
                )}
                keyExtractor={(item, index) => index.toString()}
              />
              <RowBtnsFloat>
                <>
                  <BtnWrapperFloat>
                    <ButtonWithBorder
                      text="Voltar"
                      onPress={() => navigation.goBack()}
                    />
                  </BtnWrapperFloat>

                  <BtnWrapperFloat>
                    {console.log({
                      daaaaaa: noteDetail.products.filter(
                        newData => newData.label_status == 0,
                      ),
                    })}
                    {noteDetail.note?.status == 'conference' &&
                    noteDetail.products.filter(
                      newData => newData.label_status == 0,
                    ).length <= 0 ? (
                      <ButtonDefault
                        text="Finalizar"
                        onPress={() => setVisibleModalLastStep(true)}
                      />
                    ) : (
                      noteDetail.note?.status == 'conference' &&
                      noteDetail.products.filter(
                        newData => newData.label_status == 0,
                      ).length >= 1 && (
                        <ButtonDefault
                          disabled={true}
                          text="Finalizar"
                          onPress={() => setVisibleModalLastStep(true)}
                        />
                      )
                    )}
                    {noteDetail.note?.status == 'separated' && (
                      <ButtonDefault
                        text="Entregue"
                        onPress={() => setVisibleModalDelivery(true)}
                      />
                    )}

                    {noteDetail.note?.status != 'separated' &&
                      noteDetail.note?.status != 'conference' &&
                      noteDetail.note?.status != 'done' && (
                        <ButtonDefault
                          text={'Separar'}
                          onPress={() => setVisibleModalConference(true)}
                        />
                      )}
                  </BtnWrapperFloat>
                </>
              </RowBtnsFloat>
            </>
          ) : (
            <>
              <Content />
              <RightSide>
                <RowLabels>
                  <LabelWrapper style={{width: '40%'}}>
                    <LabelCategory style={{marginLeft: 28}}>
                      Produto
                    </LabelCategory>
                  </LabelWrapper>

                  <LabelWrapper style={{width: '12%'}}>
                    <LabelCategory>Volume</LabelCategory>
                  </LabelWrapper>

                  <LabelWrapper style={{width: '13%'}}>
                    <LabelCategory>Preço</LabelCategory>
                  </LabelWrapper>

                  <LabelWrapper style={{width: '15%'}} />
                </RowLabels>
                <FlatList
                  data={noteDetail.products}
                  renderItem={({item, index}) => (
                    <ProductPedidoTablet
                      data={item}
                      status={item.status}
                      actionDelete={() => {}}
                      actionEdit={() => {}}
                      active={false}
                      blocked={noteDetail.note?.status == 'waiting'}
                      onPress={() => confirmConferenceObject(item)}
                    />
                  )}
                  keyExtractor={(item, index) => index.toString()}
                />
                <RowBtns>
                  <>
                    <BtnWrapperFloat>
                      <ButtonWithBorder
                        text="Voltar"
                        onPress={() => navigation.goBack()}
                      />
                    </BtnWrapperFloat>

                    <BtnWrapperFloat>
                      {console.log({
                        daaaaaa: noteDetail.products.filter(
                          newData => newData.label_status == 0,
                        ),
                      })}
                      {noteDetail.note?.status == 'conference' &&
                      noteDetail.products.filter(
                        newData => newData.label_status == 0,
                      ).length <= 0 ? (
                        <ButtonDefault
                          text="Finalizar"
                          onPress={() => setVisibleModalLastStep(true)}
                        />
                      ) : (
                        noteDetail.note?.status == 'conference' &&
                        noteDetail.products.filter(
                          newData => newData.label_status == 0,
                        ).length >= 1 && (
                          <ButtonDefault
                            disabled={true}
                            text="Finalizar"
                            onPress={() => setVisibleModalLastStep(true)}
                          />
                        )
                      )}
                      {noteDetail.note?.status == 'separated' && (
                        <ButtonDefault
                          text="Entregue"
                          onPress={() => setVisibleModalDelivery(true)}
                        />
                      )}

                      {noteDetail.note?.status != 'separated' &&
                        noteDetail.note?.status != 'conference' &&
                        noteDetail.note?.status != 'done' && (
                          <ButtonDefault
                            text={'Separar'}
                            onPress={() => setVisibleModalConference(true)}
                          />
                        )}
                    </BtnWrapperFloat>
                  </>
                </RowBtns>
              </RightSide>
            </>
          )}
          {prinData.printList.length > 0 && (
            <SendPrint
              setPrintData={data => setPrintData(data)}
              print={true}
              printLink={prinData.printLink}
              printList={prinData.printList}
            />
          )}
          <ModalInitProcess
            loading={loadingModal}
            text="Deseja iniciar conferencia?"
            confirm={() => activeModeConference()}
            visible={visibleModalConference}
            change={() => setVisibleModalConference(false)}
          />
          <ModalInitProcess
            loading={loadingModal}
            text="Deseja finalizar conferencia?"
            confirm={() => activeModeEnd()}
            visible={visibleModalLastStep}
            change={() => setVisibleModalLastStep(false)}
          />

          <ModalInitProcess
            loading={loadingModal}
            text="Deseja informar o pedido como entregue?"
            confirm={() => activeModeDelivery()}
            visible={visibleModalDelivery}
            change={() => setVisibleModalDelivery(false)}
          />

          {Dimensions.get('screen').width < 520 ? (
            <ModalConference
              itemDetail={prevDataModal}
              visible={visible}
              change={() => setVisible(false)}
              confirm={id => handleChangeStatusObjectNote(id, 'finished')}
              loadingFinished={loadingCompleteProcess}
            />
          ) : (
            <ModalConferenceTablet
              itemDetail={prevDataModal}
              loadingFinished={loadingCompleteProcess}
              visible={visible}
              change={() => setVisible(false)}
              confirm={id => handleChangeStatusObjectNote(id, 'finished')}
            />
          )}
        </Container>
      )}
    </BackGroundComponent>
  );
};

const LabelNote = styled.Text`
  font-size: ${FontsDefault.medium};
  color: ${({theme}) => theme.color};
  font-family: ${({theme}) => theme.fontSecondary};
  font-weight: bold;
  margin-top: 10px;
`;

const LabelValue = styled.Text`
  font-size: ${FontsDefault.medium};
  color: ${({theme}) => theme.color};
  font-family: ${({theme}) => theme.fontSecondary};
  margin-bottom: 10px;
`;
const ProductStatusTab = styled.View<{status: string}>`
  background-color: ${({theme, status}) =>
    status == 'done' ? theme.green : theme.lightBlue};
  justify-content: center;
  align-items: center;
  width: 250px;
  border-radius: 15px;
  padding: 5px;
  margin: 8px 0;
`;

const ProductStatusText = styled.Text`
  color: ${({theme}) => theme.dark};
  font-family: ${({theme}) => theme.fontSecondary};
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

const RowLabels = styled.View`
  flex-direction: row;
  align-items: center;
  justify-content: space-around;
`;

const LabelWrapper = styled.View``;

const Label = styled.Text`
  font-size: ${FontsDefault.large};
  color: ${({theme}) => theme.color};
  font-family: ${({theme}) => theme.fontPrimary};
  margin-bottom: 5px;
`;

export const Card = styled.View`
  border-radius: 15px;
  padding: 16px;
  background-color: ${({theme}) => theme.cardBackGround};
  margin: 16px;
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

const DateRow = styled.View`
  flex-direction: row;
  align-items: center;
`;

const DateWrapper = styled.View``;

const LabelCategory = styled.Text`
  font-size: ${FontsDefault.medium};
  color: ${({theme}) => theme.color};
  font-family: ${({theme}) => theme.fontSecondary};
  font-weight: bold;
  margin-top: 10px;
  margin-bottom: 5px;
`;

const Value = styled.Text`
  font-size: ${FontsDefault.medium};
  color: ${({theme}) => theme.color};
  font-family: ${({theme}) => theme.fontSecondary};
  margin-bottom: 10px;
`;

const CardTotal = styled.View`
  border-radius: 15px;
  padding: 16px;
  background-color: ${({theme}) => theme.primary};
  margin: 4px 16px;
  flex-direction: row;
  align-items: center;
`;

const CardTotalText = styled.Text`
  font-size: ${FontsDefault.large};
  color: ${({theme}) => theme.white};
  font-family: ${({theme}) => theme.fontSecondary};
`;

const CardTotalHeight = styled.Text`
  text-transform: uppercase;
  font-weight: bold;
  font-size: 32px;
  color: ${({theme}) => theme.white};
  font-family: ${({theme}) => theme.fontPrimary};
`;

const CardTotalIcon = styled(FontAwesomeIcon)`
  margin-left: auto;
  color: ${({theme}) => theme.white};
`;

const RowBtns = styled.View`
  flex-direction: row;
  align-items: center;
  justify-content: flex-end;
  padding: 16px 0;
`;

const BtnWrapper = styled.View`
  width: 280px;
  margin: 0 16px;
`;

const RowBtnsFloat = styled.View`
  flex-direction: row;
  align-items: center;
  justify-content: space-between;
  margin: 16px 0;
  position: absolute;
  bottom: 0;
`;

const BtnWrapperFloat = styled.View`
  width: 41%;
  margin: 0 16px;
`;

export {DetalhesPedido};
