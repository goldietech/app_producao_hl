import React from 'react';
import styled from 'styled-components/native';
import {Dimensions, View, FlatList} from 'react-native';
import {FontsDefault} from '../styles/fonts';
import {FontAwesomeIcon} from '@fortawesome/react-native-fontawesome';
import {faPlus, faCheckCircle} from '@fortawesome/free-solid-svg-icons';
import {ItemListOrder} from './ItemListOrder';
import {
  ObjectProduct,
  ResponseOrder,
  ObjectSubProduct,
} from '../models/OrderProps';

// import { Container } from './styles';
interface OrderProp {
  productionMode: boolean;
  itemsData: ObjectProduct;
  blocked: boolean;
  volume: string;
  onPress: () => void;
}
const Order: React.FC<OrderProp> = ({
  productionMode,
  itemsData,
  volume,
  onPress,
  blocked,
}) => {
  return (
    <Container
      disabled={
        (blocked && itemsData.status_production != 'production') ||
        itemsData.status_production == 'done'
      }
      status={itemsData.status_production}
      blocked={
        (blocked && itemsData.status_production != 'production') ||
        itemsData.status_production == 'done'
      }
      onPress={() => onPress()}>
      <ProductArea>
        <View>
          <ProductTitle>{itemsData.obj_description}</ProductTitle>
          <ProductId>id: {itemsData.id}</ProductId>
        </View>
      </ProductArea>

      <Divider />

      {/* <FlatList
        data={itemsData.rawObjects}
        renderItem={({item, index}) => (
          <ItemListOrder
            weight="40"
            title={item.obj_description}
            onPress={() => {}}
          />
        )}
        keyExtractor={(item, index) => index.toString()}
      /> */}

      {itemsData.status_production == 'production' && (
        <Footer>
          <BtnAddOrder>
            <IconPlus icon={faPlus} />
            <BtnAddOrderText>Continuar adicionando</BtnAddOrderText>
          </BtnAddOrder>

          {/* <BtnEndOrder onPress={endProduction}>
            <BtnAddOrderText>Finalizar produção</BtnAddOrderText>
          </BtnEndOrder> */}
        </Footer>
      )}

      {itemsData.status_production == 'done' && (
        <Footer>
          <Divider />
          <Row>
            <IconChecked icon={faCheckCircle} size={30} />
            <FinishedText>Produção finalizada</FinishedText>
          </Row>

          {/* <Row style={{marginTop: 20}}>
            <View style={{alignItems: 'center', marginRight: 16}}>
              <FinishedLabel>5000</FinishedLabel>
              <FinishedValue>Volume fabricado</FinishedValue>
            </View>

            <View style={{alignItems: 'center'}}>
              <FinishedLabel>60</FinishedLabel>
              <FinishedValue>KG</FinishedValue>
            </View>
          </Row> */}
        </Footer>
      )}
    </Container>
  );
};

type CardActiveProps = {
  blocked: boolean;
  status: string;
};
const Container = styled.TouchableOpacity<CardActiveProps>`
  box-shadow: 2px 2px 2px #dedede;
  background-color: ${({theme}) => theme.cardBackGround};
  margin: 16px;
  border-radius: 15px;
  padding: 16px;
  width: ${Dimensions.get('screen').width < 520
    ? `${Dimensions.get('screen').height / 2.28}px`
    : `${Dimensions.get('screen').height / 2.2}px`};
  border: 3px solid
    ${({theme, status}) =>
      status == 'done'
        ? theme.green
        : status == 'production'
        ? theme.blue
        : theme.cardBackGround};
`;

const ProductArea = styled.View`
  width: 100%;
  flex-direction: row;
  align-items: center;
  justify-content: space-between;
`;

const ProductTitle = styled.Text`
  font-size: ${FontsDefault.large};
  color: ${({theme}) => theme.color};
  font-family: ${({theme}) => theme.fontSecondary};
  font-weight: bold;
  margin-bottom: 5px;
`;

const ProductId = styled.Text`
  color: ${({theme}) => theme.color};
  font-size: 14px;
  font-family: ${({theme}) => theme.fontSecondary};
`;
type TypeHeightProps = {
  type: 'frd' | 'pct';
};
const VolumeTag = styled.View<TypeHeightProps>`
  background-color: ${props =>
    props.type == 'pct' ? props.theme.darkBlue : props.theme.blue};
  justify-content: center;
  align-items: center;
  width: 120px;
  border-radius: 15px;
  padding: 5px 16px;
  margin-bottom: 5px;
`;

const VolumeTagText = styled.Text`
  font-size: ${FontsDefault.small};
  color: ${({theme}) => theme.background};
  font-family: ${({theme}) => theme.fontSecondary};
`;

const VolumeQtd = styled.Text`
  font-size: ${FontsDefault.medium};
  color: ${({theme}) => theme.color};
  font-family: ${({theme}) => theme.fontSecondary};
`;

const Divider = styled.View`
  height: 2px;
  width: 90%;
  background-color: ${({theme}) => theme.background};
  margin: 16px;
  align-self: center;
`;

interface ProgressProps {
  percent: number;
}
const BarProgressContainer = styled.View`
  height: 12px;
  width: 100%;
  background-color: ${({theme}) => theme.background};
  margin: 16px;
  align-self: center;
  justify-content: center;

  border-radius: 30px;
`;

const BarProgress = styled.View<ProgressProps>`
  height: 6px;
  width: ${({percent}) => `${percent}%`};
  background-color: ${({theme}) => theme.primary};
  border-radius: 30px;
`;

const Footer = styled.View`
  flex-direction: column;
`;

const BtnAddOrder = styled.TouchableOpacity`
  background-color: ${({theme}) => theme.lightBlue};
  flex-direction: row;
  align-self: flex-end;
  align-items: center;
  padding: 5px 10px;
  margin: 16px 0;
  border-radius: 15px;
`;

const BtnEndOrder = styled.TouchableOpacity`
  background-color: ${({theme}) => theme.red};
  flex-direction: row;
  align-items: center;
  justify-content: center;
  padding: 5px 10px;
  margin: 8px 0;
  border-radius: 15px;
`;

const IconPlus = styled(FontAwesomeIcon).attrs(props => ({
  color: props.theme.white,
}))`
  margin-right: 16px;
`;
const BtnAddOrderText = styled.Text`
  color: ${({theme}) => theme.white};
  font-size: ${FontsDefault.medium};
`;
const Row = styled.View`
  width: 100%;
  flex-direction: row;
  align-items: center;
`;

const FinishedText = styled.Text`
  font-size: ${FontsDefault.small};
  color: ${({theme}) => theme.color};
`;

const FinishedLabel = styled.Text`
  font-size: ${FontsDefault.large};
  color: ${({theme}) => theme.color};
  font-weight: bold;
`;
const FinishedValue = styled.Text`
  font-size: ${FontsDefault.small};
  color: ${({theme}) => theme.color};
`;

const ActionsArea = styled.View`
  flex-direction: row;
  align-items: center;
  justify-content: center;
  width: 15%;
`;

const ActionBtn = styled.TouchableOpacity`
  margin: 0 8px;
`;

export const IconChecked = styled(FontAwesomeIcon).attrs(props => ({
  color: props.theme.green,
}))`
  margin-right: 10px;
`;

export {Order};
