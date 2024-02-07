import React, {useState, useRef, useContext} from 'react';
import {
  View,
  Dimensions,
  FlatList,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
} from 'react-native';
import {ModalDefault} from './ModalDefault';
import styled from 'styled-components/native';
import {FontsDefault} from '../styles/fonts';
import {ButtonDefault} from './ButtonDefault';
import {SendPrint} from './SendPrint';
import {ItemList} from './ItemList';
import {
  ObjectNoteProduct,
  ResponseNoteDetail,
  ObjectNoteProductStock,
} from '../models/NoteProductProps';
import {Apis} from '../services/api';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {OrderContext} from '../context/OrderContext';

interface ModalConferenceProps {
  itemDetail: ResponseNoteDetail;
  visible: boolean;
  change: () => void;
  confirm: (id: number) => void;
  loadingFinished: boolean;
}

interface PrintProps {
  printList: Array<string>;
  printLink: string;
}

const ModalConference: React.FC<ModalConferenceProps> = ({
  visible,
  change,
  itemDetail,
  confirm,
  loadingFinished,
}) => {
  const context = useContext(OrderContext);
  const [loading, setLoading] = useState(false);
  const [text, setText] = useState('');
  const [prinData, setPrintData] = useState<PrintProps>({
    printLink: '',
    printList: [],
  });
  let refScroll = useRef();

  const handleAddProduct = async () => {
    if (text == '') {
      alert('Campo vazio');
    } else {
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

        context.setNewItemInNote(
          itemDetail.id,
          resNoteAddProduct.data.stockRollData,
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
          setText('');
        }, 1000);
        setLoading(false);
      } catch (error) {
        setLoading(false);
        alert('erro ao adicionar');
      }
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
    <ModalDefault
      visible={visible}
      change={change}
      children={
        <Container>
          <FlatList
            ref={refScroll}
            data={[0]}
            renderItem={({item, index}) => (
              <TouchableOpacity>
                <InfoArea>
                  <InfoProduct>
                    <Label>Dados do produto</Label>
                    <InfoProductTitle>
                      {itemDetail?.purchaseObjData.obj_description}
                    </InfoProductTitle>

                    <InfosRow>
                      <InfoWrapper>
                        <InfoLabel>Id</InfoLabel>
                        <InfoValue>{itemDetail.id}</InfoValue>
                      </InfoWrapper>

                      <InfoWrapper style={{marginLeft: 30}}>
                        <InfoLabel>Volume</InfoLabel>
                        <InfoValue>200</InfoValue>
                      </InfoWrapper>
                    </InfosRow>

                    <DividerHorizontal />

                    <HeightValueToConfirm>
                      {itemDetail.total} kg a conferir
                    </HeightValueToConfirm>
                  </InfoProduct>

                  <InputArea>
                    <InputLabel>Peso unitário</InputLabel>
                    <InputText
                      value={text}
                      onFocus={() => {
                        setTimeout(() => {
                          refScroll.current.scrollToIndex({index: 0});
                        }, 200);
                      }}
                      onChangeText={text => setText(text)}
                      placeholder="digite o peso"
                      keyboardType="phone-pad"
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

                <DividerHorizontal style={{marginVertical: 16}} />

                <ListArea>
                  <FlatList
                    data={itemDetail.stockData}
                    renderItem={({item, index}) => (
                      <ItemList
                        rePrint={id => handleRePrint(id)}
                        text={item.id}
                        productWeight={item.total_weight}
                        numberInfo={item.number}
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
                    <WeightTotal>
                      {getVolume(itemDetail.stockData)} kg
                    </WeightTotal>
                  </CardWeight>

                  {itemDetail.stockData.length > 0 && (
                    <Card>
                      {loadingFinished ? (
                        <LoadingIndicator />
                      ) : (
                        <ButtonDefault
                          text="Finalizar"
                          onPress={() => confirm(itemDetail.id)}
                        />
                      )}
                    </Card>
                  )}
                </ListArea>
              </TouchableOpacity>
            )}
            keyExtractor={(item, index) => index.toString()}
          />

          {prinData.printList.length > 0 && (
            <SendPrint
              print={true}
              printLink={prinData.printLink}
              printList={prinData.printList}
            />
          )}
        </Container>
      }
    />
  );
};

const Container = styled.View`
  flex: 1;
  background-color: ${({theme}) => theme.background};
  border-radius: 12px;
  padding: 30px 16px 10px 16px;
`;

const InfoArea = styled.View`
  width: 100%;
`;

const DividerHorizontal = styled.View`
  width: 95%;
  height: 2px;
  background-color: ${({theme}) => theme.gray};
`;

const ListArea = styled.View`
  width: 100%;
`;

const InfoProduct = styled.View`
  width: 100%;
  padding: 16px;
  background-color: ${({theme}) => theme.cardBackGround};
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
  color: ${({theme}) => theme.color};
`;
const InputText = styled.TextInput.attrs(props => ({
  placeholderTextColor: props.theme.gray,
}))`
  background-color: ${({theme}) => theme.cardBackGround};
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
  margin-top: 26px;
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

const Card = styled.View`
  border-radius: 15px;
  margin: 16px 0;
  padding: 16px;
  background-color: ${({theme}) => theme.cardBackGround};
`;

const LoadingIndicator = styled(ActivityIndicator).attrs(props => ({
  color: props.theme.primary,
  size: 30,
}))`
  align-self: center;
`;

export {ModalConference};
