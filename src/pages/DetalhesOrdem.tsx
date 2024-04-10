import React, {useState, useEffect, useContext} from 'react';
import {
  View,
  FlatList,
  ScrollView,
  Dimensions,
  Alert,
  ActivityIndicator,
} from 'react-native';
import styled from 'styled-components/native';
import {FontsDefault} from '../styles/fonts';
import {FontAwesomeIcon} from '@fortawesome/react-native-fontawesome';
import {
  faExclamationTriangle,
  faWeightHanging,
  faClock,
} from '@fortawesome/free-solid-svg-icons';
import {ModalInitProcess} from '../components/ModalInitProcess';
import {ButtonDefault} from '../components/ButtonDefault';
import {ButtonWithBorder} from '../components/ButtonWithBorder';
import {BackGroundComponent} from '../components/BackGroundComponent';
import {Order} from '../components/Order';
import {ObjectProduct, ResponseOrder} from '../models/OrderProps';
import {Indicator} from '../components/Indicator';
import {OrderContext} from '../context/OrderContext';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {Apis} from '../services/api';
const DetalhesOrdem: React.FC = ({route, navigation}) => {
  const context = useContext(OrderContext);
  const [turnOffOptions, setTurnOffOptions] = useState([]);
  useEffect(() => {
    const {data, turnOffOptions} = route.params;
    setTurnOffOptions(turnOffOptions);
    setOrder(data);
    context.populateObj(data.OrdersObject);
  }, []);

  const [visible, setVisible] = useState(false);
  const [loadingModal, setLoadingModal] = useState(false);
  const [modeProduction, setModeProduction] = useState(false);
  const [order, setOrder] = useState<ResponseOrder | undefined>(undefined);

  const initProduction = () => {
    setVisible(true);
  };

  const activeModeProduction = async () => {
    setLoadingModal(true);
    let asyncToken: string | null = await AsyncStorage.getItem('@user:token');
    let token = JSON.parse(asyncToken);
    try {
      const resProduction = await Apis.api.post(
        `${token}/production_orders/ProductionOrderApi/updateToProduction
        `,
        {
          id: order?.id,
          status: 'production',
        },
      );
      setLoadingModal(false);
      setVisible(false);
      setModeProduction(true);
      context.updateSpecificOrder(
        resProduction.data.productionOrderData,
        'production',
      );
    } catch (error) {
      setLoadingModal(false);
      console.log('opss');
      // navigation.push('Login');
    }
  };

  const handleSendObjectToProduction = async (productObj: ObjectProduct) => {
    let asyncToken: string | null = await AsyncStorage.getItem('@user:token');
    let token = JSON.parse(asyncToken);
    try {
      const resProduction = await Apis.api.post(
        `${token}/production_orders/ProductionOrderApi/startObjectProduction
        `,
        {
          order_id: productObj?.order_id,
          id: productObj.id,
        },
      );

      context.setOrderObjectStatus(
        resProduction.data.orderObjData.id,
        'production',
      );
      console.log({mdmdmdmdm: order});

      navigation.push('Producao', {
        orderData: order,
        turnOffOptions: turnOffOptions,
        changeOrderData: d => setOrder(d),
        data: productObj,
      });
    } catch (error) {
      console.log('opss');
      // navigation.push('Login');
    }
  };

  const confirmProductionObject = (orderObj: ObjectProduct) => {
    if (orderObj.status_production == 'production') {
      orderObj.order_id = order?.code;
      navigation.push('Producao', {
        orderData: order,
        turnOffOptions: turnOffOptions,
        changeOrderData: d => setOrder(d),
        data: orderObj,
      });
    } else {
      Alert.alert(
        `Deseja iniciar a produção de ${orderObj.obj_description}`,
        '',
        [
          {
            text: 'Cancel',
            onPress: () => {},
            style: 'cancel',
          },
          {
            text: 'OK',
            onPress: async () => await handleSendObjectToProduction(orderObj),
          },
        ],
        {cancelable: true},
      );
    }
  };

  const handleEndOrderProduction = async (productObj: ObjectProduct) => {
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
    } catch (error) {
      console.log('opss');
      // navigation.push('Login');
    }
  };

  const endProductionObject = (orderObj: ObjectProduct) => {
    Alert.alert(
      `Deseja finalizar a produção de ${orderObj.obj_description}`,
      '',
      [
        {
          text: 'Cancel',
          onPress: () => {},
          style: 'cancel',
        },
        {
          text: 'OK',
          onPress: () => handleEndOrderProduction(orderObj),
        },
      ],
      {cancelable: true},
    );
  };

  const finishOrder = async () => {
    let asyncToken: string | null = await AsyncStorage.getItem('@user:token');
    let token = JSON.parse(asyncToken);
    try {
      const resProduction = await Apis.api.post(
        `${token}/production_orders/ProductionOrderApi/updateToProduction
        `,
        {
          id: order?.id,
          status: 'checking',
        },
      );
      context.updateSpecificOrder(
        resProduction.data.productionOrderData,
        'checking',
      );
      setTimeout(() => {
        navigation.goBack();
      }, 500);
    } catch (error) {
      console.log('opss');
      // navigation.push('Login');
    }
  };

  const getAllStatus = () => {
    let total = context
      .getOrderProducts()
      .filter((obj: ObjectProduct) => obj.status_production == 'production');
    if (total.length > 0) {
      return false;
    } else {
      return true;
    }
  };

  const verifyStatus = () => {
    let orderNote = order?.OrdersObject.filter(
      (obj: ObjectProduct) => obj.status_production == 'done',
    );
    if (orderNote?.length == order?.OrdersObject.length) {
      return true;
    } else {
      return false;
    }
  };

  const getVolume = (arrProduct: Array<ObjectProduct>) => {
    let totalParse = arrProduct.map(product => {
      if (product != null) {
        return Number(product.obj_quantity);
      }
    });

    let total = totalParse.reduce((a, b) => Number(a) + Number(b), 0);
    return total;
  };

  const getStatusString = (status: string) => {
    if (status == 'production') {
      return 'produção';
    } else if (status == 'checking') {
      return 'pronto';
    } else if (status == 'preparing') {
      return 'em espera';
    }
  };

  const Content = React.memo(() => (
    <LeftSide>
      <ScrollView>
        <Card>
          <OrderNumber>ordem #{order?.code}</OrderNumber>
          <OrderTitle>ID: {order?.id}</OrderTitle>
          <ProductStatusTab>
            <ProductStatusText style={{fontSize: 15}}>
              {order.maquinaData.descricao}
            </ProductStatusText>
          </ProductStatusTab>
          <DateRow>
            <DateWrapper>
              <Label>Criado em</Label>
              <Value>{order?.start_date.split('-').reverse().join('-')}</Value>
            </DateWrapper>

            {/* <DateWrapper style={{marginLeft: 30}}>
              <Label>Entregue</Label>
              <Value>20/07/2020</Value>
            </DateWrapper> */}
          </DateRow>
        </Card>

        <Card>
          <BarStatus>
            <IconBar icon={faExclamationTriangle} />
            <BarStatusText>{getStatusString(order?.status)}</BarStatusText>
          </BarStatus>

          <PeriodArea>
            <View>
              <PeriodLabel>Periodo</PeriodLabel>
              <PeriodTime>
                {Math.floor(order?.OrdersObject[0].minutos_producao / 60)}
                {':'}
                {Math.floor(order?.OrdersObject[0].minutos_producao % 60)} Horas
              </PeriodTime>
            </View>
            <PeriodIcon icon={faClock} size={30} />
          </PeriodArea>
        </Card>

        <CardTotal>
          <View>
            <CardTotalText>Previsão</CardTotalText>
            <CardTotalHeight>
              {order?.OrdersObject[0].total_caixas} fardos
            </CardTotalHeight>
          </View>
          <CardTotalIcon icon={faWeightHanging} size={30} />
        </CardTotal>

        {modeProduction && (
          <CardTotal>
            <View>
              <CardTotalText>Total de volumes fabricados</CardTotalText>
              <CardTotalHeight>1111</CardTotalHeight>
            </View>
            <CardTotalIcon icon={faWeightHanging} size={30} />
          </CardTotal>
        )}
      </ScrollView>
    </LeftSide>
  ));

  return (
    <BackGroundComponent>
      {!order ? (
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
                      data={order?.OrdersObject}
                      renderItem={({item, index}) => (
                        <Order
                          productionMode={modeProduction}
                          itemsData={item}
                          blocked={
                            !getAllStatus() || order.status != 'production'
                          }
                          volume={item.obj_quantity.toString()}
                          onPress={() => confirmProductionObject(item)}
                        />
                      )}
                      keyExtractor={(item, index) => index.toString()}
                    />
                  </>
                )}
                keyExtractor={(item, index) => index.toString()}
              />
              <RowBtnsFloat>
                <BtnWrapperFloat>
                  <ButtonWithBorder
                    text="Voltar"
                    onPress={() => navigation.goBack()}
                  />
                </BtnWrapperFloat>
                <BtnWrapperFloat>
                  {verifyStatus() && (
                    <ButtonDefault
                      disabled={order.status == 'checking'}
                      text={
                        order.status == 'checking' ? 'Finalizada' : 'Finalizar'
                      }
                      onPress={() => finishOrder()}
                    />
                  )}
                  {!verifyStatus() && (
                    <ButtonDefault
                      disabled={order.status == 'production'}
                      text={
                        order.status == 'production' ? 'Produzindo' : 'Produção'
                      }
                      onPress={() => initProduction()}
                    />
                  )}
                </BtnWrapperFloat>
              </RowBtnsFloat>
            </>
          ) : (
            <>
              <Content />
              <RightSide>
                <RowLabels>
                  <LabelWrapper style={{width: '100%'}}>
                    <LabelCategory style={{marginLeft: 48}}>
                      Produto
                    </LabelCategory>
                  </LabelWrapper>

                  <LabelWrapper style={{width: '15%'}} />
                </RowLabels>
                <FlatList
                  numColumns={Dimensions.get('screen').width < 520 ? 1 : 2}
                  data={order?.OrdersObject}
                  renderItem={({item, index}) => (
                    <Order
                      productionMode={modeProduction}
                      itemsData={item}
                      blocked={!getAllStatus() || order.status != 'production'}
                      status={item.status_production}
                      volume={item.obj_quantity.toString()}
                      onPress={() => confirmProductionObject(item)}
                    />
                  )}
                  keyExtractor={(item, index) => index.toString()}
                />
                <RowBtns>
                  <BtnWrapper>
                    <ButtonWithBorder
                      text="Voltar"
                      onPress={() => navigation.goBack()}
                    />
                  </BtnWrapper>
                  <BtnWrapper>
                    {verifyStatus() && (
                      <ButtonDefault
                        disabled={order.status == 'done'}
                        text={
                          order.status == 'done'
                            ? 'Finalizada'
                            : 'Finalizar produção'
                        }
                        onPress={() => finishOrder()}
                      />
                    )}
                    {!verifyStatus() && (
                      <ButtonDefault
                        disabled={order.status == 'production'}
                        text={
                          order.status == 'production'
                            ? 'Em produção'
                            : 'Iniciar produção'
                        }
                        onPress={() => initProduction()}
                      />
                    )}
                  </BtnWrapper>
                </RowBtns>
              </RightSide>
            </>
          )}

          <ModalInitProcess
            text="Deseja iniciar produção?"
            confirm={() => activeModeProduction()}
            visible={visible}
            change={() => setVisible(false)}
            loading={loadingModal}
          />
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
  margin-top: 16px;
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
const ProductStatusTab = styled.View<{status: string}>`
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
const BarStatus = styled.View`
  flex-direction: row;
  align-items: center;
  background-color: ${({theme}) => theme.red};
  border-radius: 15px;
  padding: 5px 10px;
`;

const IconBar = styled(FontAwesomeIcon)`
  color: ${({theme}) => theme.white};
  margin-right: 10px;
`;

const BarStatusText = styled.Text`
  font-size: ${FontsDefault.small};
  color: ${({theme}) => theme.white};
  font-family: ${({theme}) => theme.fontSecondary};
`;

const PeriodArea = styled.View`
  flex-direction: row;
  align-items: center;
  margin-top: 26px;
`;
const PeriodLabel = styled.Text`
  font-size: ${FontsDefault.medium};
  color: ${({theme}) => theme.color};
  font-family: ${({theme}) => theme.fontSecondary};
`;
const PeriodTime = styled.Text`
  font-size: 30px;
  color: ${({theme}) => theme.color};
  font-family: ${({theme}) => theme.fontSecondary};
  font-weight: bold;
`;
const PeriodIcon = styled(FontAwesomeIcon)`
  color: ${({theme}) => theme.primary};
  margin-left: auto;
`;

const CardTotal = styled.View`
  border-radius: 15px;
  padding: 16px;
  background-color: ${({theme}) => theme.primary};
  margin: 16px;
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

const LoadingIndicator = styled(ActivityIndicator).attrs(props => ({
  color: props.theme.primary,
  size: 30,
}))`
  align-self: center;
`;

export {DetalhesOrdem};
