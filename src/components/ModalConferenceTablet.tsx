import React, {useState, useRef} from 'react';
import {View, ActivityIndicator, FlatList, ScrollView} from 'react-native';
import {ModalDefault} from './ModalDefault';
import styled from 'styled-components/native';
import {FontsDefault} from '../styles/fonts';
import {ButtonDefault} from './ButtonDefault';
import {SendPrint} from './SendPrint';
import {ItemList} from './ItemList';
import {
  ObjectNoteProduct,
  ResponseNoteDetail,
} from '../models/NoteProductProps';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {Apis} from '../services/api';

interface ItemProps {
  name: string;
  weight: string;
}

interface ModalConferenceTabletProps {
  itemDetail: ResponseNoteDetail;
  visible: boolean;
  change: () => void;
  confirm: (id: number) => void;
}

interface PrintProps {
  printList: Array<string>;
  printLink: string;
}

const ModalConferenceTablet: React.FC<ModalConferenceTabletProps> = ({
  visible,
  change,
  itemDetail,
  confirm,
}) => {
  const [text, setText] = useState('');
  const [active, setActive] = useState(false);
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState<ItemProps[]>([]);
  const [prinData, setPrintData] = useState<PrintProps>({
    printLink: '',
    printList: [],
  });
  let refScroll = useRef();

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
          delivery_obj_id: itemDetail.id,
        },
      );

      if (data?.length == 0) {
        setData([
          {
            name: resNoteAddProduct.data.stockRollData.id,
            weight: text,
          },
        ]);
      } else {
        setData(prev => [
          ...prev,
          {
            name: resNoteAddProduct.data.stockRollData.id,
            weight: text,
          },
        ]);
      }

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
        setLoading(false);
      }, 1000);
    } catch (error) {
      setLoading(false);
      alert('erro ao adicionar');
    }
  };

  const getVolume = (arrProduct: Array<ItemProps>) => {
    let totalParse = arrProduct.map(product => {
      if (product != null) {
        return Number(product.weight);
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
    <ModalDefault
      visible={visible}
      change={change}
      children={
        <ScrollView ref={refScroll}>
          <Card style={{marginBottom: active ? 200 : 0}}>
            <InfoArea>
              <InfoProduct>
                <Label>Dados do produto</Label>
                <InfoProductTitle>
                  {' '}
                  {itemDetail?.purchaseObjData?.obj_description}
                </InfoProductTitle>

                <InfosRow>
                  <InfoWrapper>
                    <InfoLabel>Id</InfoLabel>
                    <InfoValue>
                      {itemDetail?.purchaseObjData?.object_id}
                    </InfoValue>
                  </InfoWrapper>

                  <InfoWrapper style={{marginLeft: 30}}>
                    <InfoLabel>Volume</InfoLabel>
                    <InfoValue>{itemDetail?.quantity}</InfoValue>
                  </InfoWrapper>
                </InfosRow>

                <DividerHorizontal />

                <HeightValueToConfirm>
                  {itemDetail?.quantity} kg a conferir
                </HeightValueToConfirm>
              </InfoProduct>

              <InputArea style={{width: '49%'}}>
                <InputLabel>Bruto</InputLabel>
                <InputText
                  value={text}
                  onBlur={() => {
                    setActive(false);
                  }}
                  onChangeText={text => setText(text)}
                  placeholder="digite o peso"
                  keyboardType="number-pad"
                />
              </InputArea>
              <InputArea style={{width: '49%'}}>
                <InputLabel>Tarugo</InputLabel>
                <InputText
                  value={text}
                  onBlur={() => {
                    setActive(false);
                  }}
                  onChangeText={text => setText(text)}
                  placeholder="digite o peso"
                  keyboardType="number-pad"
                />
              </InputArea>
              <BtnConfirmArea>
                {loading ? (
                  <LoadingIndicator />
                ) : (
                  <ButtonDefault
                    text="Adicionar"
                    onPress={() => handleAddProduct()}
                  />
                )}
              </BtnConfirmArea>
            </InfoArea>

            <DividerArea>
              <Divider />
            </DividerArea>

            <ListArea>
              <FlatList
                data={data}
                renderItem={({item, index}) => (
                  <ItemList
                    rePrint={id => handleRePrint(id)}
                    text={item.name}
                    productWeight={item.weight}
                    onPress={() => {}}
                  />
                )}
                ListEmptyComponent={() => <InputLabel>Lista vazia</InputLabel>}
                keyExtractor={(item, index) => index.toString()}
              />

              <CardWeight>
                <WeightLabel>Conferido</WeightLabel>
                <WeightTotal>{getVolume(data)} kg</WeightTotal>
              </CardWeight>

              {data.length > 0 && (
                <ButtonDefault
                  text="Finalizar"
                  onPress={() => {
                    confirm(itemDetail?.purchaseObjData.id);
                    setData([]);
                  }}
                />
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
        </ScrollView>
      }
    />
  );
};

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
  margin: 16px 0;
`;
const InputLabel = styled.Text`
  margin-bottom: 10px;
  color: ${({theme}) => theme.white};
`;
const InputText = styled.TextInput.attrs(props => ({
  placeholderTextColor: props.theme.gray,
}))`
  background-color: ${({theme}) => theme.background};
  border-radius: 30px;
  padding: 10px;
  width: 100%;
  color: ${({theme}) => theme.color};
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

export {ModalConferenceTablet};
