import React, {useState, useRef, useEffect, useContext} from 'react';
import {
  View,
  ActivityIndicator,
  FlatList,
  ScrollView,
  Dimensions,
} from 'react-native';
import {ModalDefault} from '../components/ModalDefault';
import {BackGroundComponent} from '../components/BackGroundComponent';
import styled from 'styled-components/native';
import {FontsDefault} from '../styles/fonts';
import {ButtonDefault} from '../components/ButtonDefault';
import {ItemList} from '../components/ItemList';
import {
  ObjectNoteProduct,
  ResponseNoteDetail,
  ObjectNoteProductStock,
} from '../models/NoteProductProps';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {Apis} from '../services/api';
import {Indicator} from '../components/Indicator';
import {SendPrint} from '../components/SendPrint';
import {OrderContext} from '../context/OrderContext';

interface PrintProps {
  printList: Array<string>;
  printLink: string;
}

const ConferenciaNota: React.FC = ({navigation, route}) => {
  useEffect(() => {
    const myParam: ResponseNoteDetail = route.params.data;
    setData(myParam);
  }, []);
  const [text, setText] = useState('');
  const [active, setActive] = useState(false);
  const [loading, setLoading] = useState(false);
  const [loadingFinish, setLoadingFinish] = useState(false);
  const [data, setData] = useState<ResponseNoteDetail>();
  const [prinData, setPrintData] = useState<PrintProps>({
    printLink: '',
    printList: [],
  });
  let refScroll = useRef();
  const context = useContext(OrderContext);

  const handleAddProduct = async () => {
    setLoading(true);

    let asyncToken: string | null = await AsyncStorage.getItem('@user:token');
    let token = JSON.parse(asyncToken);
    try {
      const resNoteAddProduct = await Apis.apiPlugin.post(
        `${token}/purchase/PurchaseDelivery/PurchaseDeliveriesObj/stockAdd
        `,
        {
          weigth: text.toString(),
          delivery_obj_id: data?.id,
        },
      );
      context.setNewItemInNote(data?.id, resNoteAddProduct.data.stockRollData);

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
        setText('');
      }, 1000);
      setLoading(false);
    } catch (error) {
      setLoading(false);
      alert('erro ao adicionar');
    }
  };

  const handleFinisheObj = async (id: number) => {
    setLoadingFinish(true);
    let asyncToken: string | null = await AsyncStorage.getItem('@user:token');
    let token = JSON.parse(asyncToken);
    try {
      setLoadingFinish(false);
      const resNoteObj = await Apis.apiPlugin.post(
        `${token}/purchase/PurchaseDelivery/PurchaseDeliveriesObj/deliveryStatus
        `,
        {
          id: id,
          status: 'finished',
        },
      );

      context.setNoteProductStatus(id, 'finished');
      setText('');
      setTimeout(() => {
        navigation.goBack();
      }, 500);
    } catch (error) {
      setLoadingFinish(false);
      console.log('opss');
    }
  };

  const getVolume = (arrProduct: Array<ObjectNoteProductStock>) => {
    let totalParse = arrProduct.map(product => {
      if (product != null) {
        return Number(product.total_weight);
      }
    });

    let total = totalParse.reduce((a, b) => Number(a) + Number(b), 0);
    return total?.toFixed(3);
  };

  const handleRePrint = async (id: number) => {
    let asyncToken: string | null = await AsyncStorage.getItem('@user:token');
    let token = JSON.parse(asyncToken);
    const resNoteAddProduct = await Apis.apiPlugin.post(
      `${token}/purchase/PurchaseDelivery/PurchaseDeliveriesObj/rePrintStockAdded
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
      {!data ? (
        <Indicator />
      ) : (
        <Container>
          <Card style={{marginBottom: active ? 200 : 0}}>
            <InfoArea>
              <InfoProduct>
                <Label>Dados do produto</Label>
                <InfoProductTitle>
                  {' '}
                  {data?.purchaseObjData?.obj_description}
                </InfoProductTitle>

                <InfosRow>
                  <InfoWrapper>
                    <InfoLabel>Id</InfoLabel>
                    <InfoValue>{data?.purchaseObjData?.object_id}</InfoValue>
                  </InfoWrapper>

                  <InfoWrapper style={{marginLeft: 30}}>
                    <InfoLabel>Volume</InfoLabel>
                    <InfoValue>{data?.quantity}</InfoValue>
                  </InfoWrapper>
                </InfosRow>

                <DividerHorizontal />

                <HeightValueToConfirm>
                  {data?.total} kg a conferir
                </HeightValueToConfirm>
              </InfoProduct>
            </InfoArea>

            <DividerArea>
              <Divider />
            </DividerArea>

            <ListArea>
              <InputArea>
                <InputLabel>Peso unitário</InputLabel>
                <InputText
                  value={text}
                  onBlur={() => {
                    setActive(false);
                  }}
                  onFocus={() => {
                    setActive(true);
                    // setTimeout(() => {
                    //   refScroll.current.scrollToEnd();
                    // }, 200);
                  }}
                  onChangeText={text => setText(text)}
                  placeholder="digite o peso"
                  keyboardType="number-pad"
                />
              </InputArea>

              {active ? (
                <>
                  <ButtonDefault
                    text="Adicionar"
                    onPress={() => {
                      if (text == '') {
                        alert('Campo vazio, digite um peso!');
                      } else {
                        handleAddProduct();
                      }
                    }}
                  />
                  <LoadingIndicator />
                </>
              ) : (
                <>
                  <BtnConfirmArea>
                    {loading ? (
                      <LoadingIndicator />
                    ) : (
                      <ButtonDefault
                        text="Adicionar"
                        onPress={() => {
                          if (text == '') {
                            alert('Campo vazio, digite um peso!');
                          } else {
                            handleAddProduct();
                          }
                        }}
                      />
                    )}
                  </BtnConfirmArea>
                  <FlatList
                    style={{height: Dimensions.get('screen').height - 480}}
                    data={data.stockData}
                    renderItem={({item, index}) => (
                      <ItemList
                        rePrint={id => handleRePrint(id)}
                        numberInfo={item.number}
                        text={item.id.toString()}
                        productWeight={item.total_weight}
                        onPress={() => {}}
                      />
                    )}
                    ListEmptyComponent={() => (
                      <InputLabel>Lista vazia</InputLabel>
                    )}
                    keyExtractor={(item, index) => index.toString()}
                  />

                  <CardWeight>
                    <WeightLabel>Conferido</WeightLabel>
                    <WeightTotal>{getVolume(data.stockData)} kg</WeightTotal>
                  </CardWeight>

                  {data.stockData.length > 0 &&
                    (loadingFinish ? (
                      <LoadingIndicator />
                    ) : (
                      <ButtonDefault
                        text="Finalizar"
                        onPress={() => handleFinisheObj(data?.id)}
                      />
                    ))}
                </>
              )}
            </ListArea>
          </Card>

          {prinData.printList.length > 0 && (
            <SendPrint
              print={true}
              printLink={prinData.printLink}
              printList={prinData.printList}
            />
          )}
        </Container>
      )}
    </BackGroundComponent>
  );
};

const Container = styled.View`
  flex: 1;
  background-color: ${({theme}) => theme.cardBackGround};
`;

const Card = styled.View`
  flex: 1;
  flex-direction: row;
  justify-content: space-around;
  padding: 16px;
  background-color: ${({theme}) => theme.cardBackGround};
  border-radius: 12px;
  box-shadow: 2px 2px 2px #ddd;
`;

const InfoArea = styled.View`
  width: 45%;
`;

const DividerArea = styled.View`
  width: 5%;
  align-items: center;
  justify-content: center;
`;

const Divider = styled.View`
  width: 2px;
  height: 95%;
  background-color: ${({theme}) => theme.gray};
`;

const DividerHorizontal = styled.View`
  width: 95%;
  height: 2px;
  background-color: ${({theme}) => theme.gray};
`;

const ListArea = styled.View`
  width: 45%;
`;

const InfoProduct = styled.View`
  width: 100%;
  padding: 16px;
  background-color: ${({theme}) => theme.background};
  border-radius: 15px;
`;

const Label = styled.Text`
  color: ${({theme}) => theme.primary};
  font-size: ${FontsDefault.medium};
  font-family: ${({theme}) => theme.fontPrimary};
`;

const InfoProductTitle = styled.Text`
  color: ${({theme}) => theme.color};
  font-size: ${FontsDefault.large};
  text-transform: uppercase;
  font-weight: bold;
`;

const InfosRow = styled.View`
  flex-direction: row;
  align-items: center;
`;

const InfoWrapper = styled.View``;

const InfoLabel = styled.Text`
  font-size: ${FontsDefault.medium};
  color: ${({theme}) => theme.color};
  font-family: ${({theme}) => theme.fontSecondary};
  font-weight: bold;
  margin-top: 10px;
  margin-bottom: 5px;
`;

const InfoValue = styled.Text`
  font-size: ${FontsDefault.medium};
  color: ${({theme}) => theme.color};
  font-family: ${({theme}) => theme.fontSecondary};
  margin-bottom: 10px;
`;

const HeightValueToConfirm = styled.Text`
  text-align: center;
  font-size: ${FontsDefault.large};
  color: ${({theme}) => theme.primary};
  font-family: ${({theme}) => theme.fontPrimary};
  font-weight: bold;
  text-transform: uppercase;
  margin: 16px;
`;

const InputArea = styled.View`
  margin: 10px 0;
`;
const InputLabel = styled.Text`
  margin-bottom: 10px;
  color: ${({theme}) => theme.gray};
`;
const InputText = styled.TextInput.attrs(props => ({
  placeholderTextColor: props.theme.gray,
}))`
  background-color: ${({theme}) => theme.background};
  border-radius: 30px;
  padding: 10px;
  width: 100%;
  color: ${({theme}) => theme.color};
  text-align: center;
`;

const BtnConfirmArea = styled.View`
  margin-top: auto;
`;

const CardWeight = styled.View`
  background-color: ${({theme}) => theme.primary};
  flex-direction: row;
  align-items: center;
  justify-content: space-between;
  padding: 35px 16px;
  border-radius: 15px;
  margin: 16px 0;
`;

const WeightLabel = styled.Text`
  font-size: ${FontsDefault.medium};
  color: ${({theme}) => theme.white};
  font-family: ${({theme}) => theme.fontSecondary};
  text-transform: uppercase;
`;

const WeightTotal = styled.Text`
  font-size: 30px;
  color: ${({theme}) => theme.white};
  font-family: ${({theme}) => theme.fontPrimary};
  font-weight: bold;
  text-transform: uppercase;
`;

const LoadingIndicator = styled(ActivityIndicator).attrs(props => ({
  color: props.theme.primary,
  size: 30,
}))`
  align-self: center;
`;

export {ConferenciaNota};
