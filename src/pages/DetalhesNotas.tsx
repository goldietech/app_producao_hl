import React, {useEffect, useState, useContext, useReducer} from 'react';
import {View, FlatList, Alert, Dimensions} from 'react-native';
import {Product} from '../components/Product';
import {ProductTablet} from '../components/ProductTablet';
import styled from 'styled-components/native';
import {FontsDefault} from '../styles/fonts';
import {FontAwesomeIcon} from '@fortawesome/react-native-fontawesome';
import {faWeightHanging} from '@fortawesome/free-solid-svg-icons';
import {ModalConferenceTablet} from '../components/ModalConferenceTablet';
import {ModalConference} from '../components/ModalConference';
import {ModalFinish} from '../components/ModalFinish';
import {ModalInitProcess} from '../components/ModalInitProcess';

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

const DetalhesNotas: React.FC = ({route, navigation}) => {
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
          `${token}/purchase/PurchaseDelivery/PurchaseDeliveriesObj/read?delivery_id=${data.id}&prepareData=true&stockRead=true`,
        );

        let total = resNote.data.deliveryObjData.filter(
          (obj: ResponseNoteDetail) => obj.purchaseObjData.status == 'done',
        );
        // if (total.length == resNote.data.deliveryObjData.length) {
        //   setTotalReady(true);
        // } else {
        //   setTotalReady(false);
        // }
        context.populateNoteProducts(resNote.data.deliveryObjData);
        setNoteDetail({note: data, products: resNote.data.deliveryObjData});
        setLoading(false);
        // setData(resNotes.data.deliveriesData);
      } catch (error) {
        console.log({opss: error});
        setLoading(false);
      }
    };

    getNoteDetail();
  }, []);
  const [, forceUpdate] = useReducer(x => x + 1, 0);
  const [visibleModalConference, setVisibleModalConference] = useState(false);
  const [visibleModalLastStep, setVisibleModalLastStep] = useState(false);
  const [visible, setVisible] = useState(false);
  const [modeConference, setModeConference] = useState(false);
  const [loading, setLoading] = useState(false);
  const [loadingConference, setLoadingConference] = useState(false);
  const [loadingModal, setLoadingModal] = useState(false);
  const [loadingCompleteProcess, setLoadingCompleteProcess] = useState(false);

  const [prevDataModal, setPrevDataModal] = useState<
    ResponseNoteDetail | undefined
  >(undefined);
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
        `${token}/purchase/%20PurchaseDelivery/PurchaseDeliveries/startDone
        `,
        {
          deliveryId: noteDetail?.note.id,
        },
      );
      setVisibleModalConference(false);
      setModeConference(true);
      context.setNoteStatus(
        resNoteObj.data.objData.purchaseData.id,
        'conference',
      );
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
        `Deseja iniciar a conferencia de ${noteObj.purchaseObjData.obj_description}`,
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
              setPrevDataModal(noteObj);
              if (Dimensions.get('screen').width < 520) {
                setVisible(true);
              } else {
                navigation.push('ConferenciaNota', {data: noteObj});
              }
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
    try {
      const resNoteObj = await Apis.apiPlugin.post(
        `${token}/purchase/PurchaseDelivery/PurchaseDeliveriesObj/deliveryStatus
        `,
        {
          id: paramId,
          status: status,
        },
      );

      context.setNoteProductStatus(paramId, status);
      setLoadingCompleteProcess(false);
      setVisible(false);
    } catch (error) {
      setLoadingCompleteProcess(false);
      console.log('opss');
    }
  };

  const verifyStatus = () => {
    let notesReady = noteDetail?.products.filter(
      (obj: ResponseNoteDetail) => obj.status == 'finished',
    );
    if (notesReady?.length == noteDetail.products.length) {
      return true;
    } else {
      return false;
    }
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
      <Card>
        <OrderNumber>
          compra {`#${noteDetail.note?.reference_number}`}
        </OrderNumber>
        <OrderTitle>{noteDetail.note?.purchaseData.supplier_name}</OrderTitle>
        <DateRow>
          <DateWrapper>
            <Label>Criado em</Label>
            <Value>
              {`${noteDetail.note?.created_at
                .split(' ')[0]
                .split('-')
                .reverse()
                .join('-')} ${noteDetail.note?.created_at.split(' ')[1]}`}
            </Value>
          </DateWrapper>
        </DateRow>
      </Card>

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
          <CardTotalText>Total da nota</CardTotalText>
          <CardTotalHeight>{noteDetail.note?.volume} KG</CardTotalHeight>
        </View>
        <CardTotalIcon icon={faWeightHanging} size={30} />
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
                        <Product
                          data={item.purchaseObjData}
                          status={item.status}
                          arrayStock={item.stockData}
                          actionDelete={() => {}}
                          actionEdit={() => {}}
                          active={false}
                          blocked={
                            !getAllStatus() ||
                            noteDetail.note?.status != 'conference'
                          }
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
                {noteDetail.note?.status == 'pre_finish' ? (
                  <>
                    <BtnWrapperFloat>
                      <ButtonWithBorder
                        text="Voltar"
                        onPress={() => navigation.goBack()}
                      />
                    </BtnWrapperFloat>

                    <BtnWrapperFloat>
                      <ButtonDefault
                        disabled
                        text="Finalizada"
                        onPress={() => setVisibleModalLastStep(true)}
                      />
                    </BtnWrapperFloat>
                  </>
                ) : (
                  <>
                    <BtnWrapperFloat>
                      <ButtonWithBorder
                        text="Voltar"
                        onPress={() => navigation.goBack()}
                      />
                    </BtnWrapperFloat>

                    <BtnWrapperFloat>
                      {verifyStatus() && (
                        <ButtonDefault
                          text="Finalizar"
                          onPress={() => setVisibleModalLastStep(true)}
                        />
                      )}

                      {!verifyStatus() && (
                        <ButtonDefault
                          disabled={noteDetail.note?.status == 'conference'}
                          text={
                            noteDetail.note?.status == 'conference'
                              ? 'Conferindo'
                              : 'Conferir'
                          }
                          onPress={() => setVisibleModalConference(true)}
                        />
                      )}
                    </BtnWrapperFloat>
                  </>
                )}
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

                  <LabelWrapper style={{width: '25%'}}>
                    <LabelCategory>Volume</LabelCategory>
                  </LabelWrapper>

                  <LabelWrapper style={{width: '15%'}} />
                </RowLabels>
                <FlatList
                  data={noteDetail.products}
                  renderItem={({item, index}) => (
                    <ProductTablet
                      data={item.purchaseObjData}
                      status={item.status}
                      arrayStock={item.stockData}
                      actionDelete={() => {}}
                      actionEdit={() => {}}
                      active={false}
                      blocked={
                        !getAllStatus() ||
                        noteDetail.note?.status != 'conference'
                      }
                      onPress={() => confirmConferenceObject(item)}
                    />
                  )}
                  keyExtractor={(item, index) => index.toString()}
                />
                <RowBtns>
                  {noteDetail.note?.status == 'pre_finish' ? (
                    <>
                      <BtnWrapper>
                        <ButtonWithBorder
                          text="Voltar"
                          onPress={() => navigation.goBack()}
                        />
                      </BtnWrapper>
                      <BtnWrapper>
                        <ButtonDefault
                          disabled
                          text="Nota finalizada"
                          onPress={() => setVisibleModalLastStep(true)}
                        />
                      </BtnWrapper>
                    </>
                  ) : (
                    <>
                      <BtnWrapper>
                        <ButtonWithBorder
                          text="Voltar"
                          onPress={() => navigation.goBack()}
                        />
                      </BtnWrapper>

                      <BtnWrapper>
                        {verifyStatus() && (
                          <ButtonDefault
                            text="Finalizar"
                            onPress={() => setVisibleModalLastStep(true)}
                          />
                        )}

                        {!verifyStatus() && (
                          <ButtonDefault
                            disabled={noteDetail.note?.status == 'conference'}
                            text={
                              noteDetail.note?.status == 'conference'
                                ? 'Conferindo'
                                : 'Iniciar conferência'
                            }
                            onPress={() => setVisibleModalConference(true)}
                          />
                        )}
                      </BtnWrapper>
                    </>
                  )}
                </RowBtns>
              </RightSide>
            </>
          )}

          <ModalInitProcess
            loading={loadingModal}
            text="Deseja iniciar conferencia?"
            confirm={() => activeModeConference()}
            visible={visibleModalConference}
            change={() => setVisibleModalConference(false)}
          />

          <ModalFinish
            itemToModal={noteDetail.note}
            totalItens={noteDetail.products.length}
            totalItensAdd={getTotaladd(noteDetail.products)}
            totalItensWeight={getTotalAddWeight(noteDetail.products)}
            totalMoney={getTotalMoney(noteDetail.products)}
            visible={visibleModalLastStep}
            change={() => setVisibleModalLastStep(false)}
            confirm={() => finishNote()}
            loading={loadingCompleteProcess}
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

export {DetalhesNotas};
