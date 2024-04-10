import React from 'react';
import {View} from 'react-native';
import styled from 'styled-components/native';
import {FontsDefault} from '../styles/fonts';

// import { Container } from './styles';
interface ItemListProps {
  text: string;
  numberInfo?: number;
  onPress: () => void;
  productWeight: string;
  tarugoWeight: string;
  rePrint: (id: number) => void;
}

const ItemList: React.FC<ItemListProps> = ({
  text,
  numberInfo,
  onPress,
  productWeight,
  tarugoWeight,
  rePrint,
}) => {
  return (
    <ProductCardListContainer>
      <View>
        <ProductCardListTitle>#{text}</ProductCardListTitle>
        <TextPrintWrapper onPress={() => rePrint(Number(text))}>
          <TextPrint>Reimprimir</TextPrint>
        </TextPrintWrapper>
      </View>
      <ProductCardListHeigh>
        {productWeight} kg | T: {tarugoWeight} kg | {numberInfo}
      </ProductCardListHeigh>
    </ProductCardListContainer>
  );
};

const ProductCardListContainer = styled.View`
  border: ${({theme}) => theme.background};
  background-color: ${({theme}) => theme.cardBackGround};
  flex-direction: row;
  align-items: center;
  justify-content: space-between;
  padding: 20px 16px;
  margin: 5px;
  border-radius: 15px;
`;

const ProductCardListTitle = styled.Text`
  color: ${({theme}) => theme.color};
  font-size: ${FontsDefault.medium};
  font-family: ${({theme}) => theme.fontSecondary};
`;

const ProductCardListHeigh = styled.Text`
  color: ${({theme}) => theme.primary};
  font-size: ${FontsDefault.medium};
  font-family: ${({theme}) => theme.fontSecondary};
  font-weight: bold;
`;

const TextPrintWrapper = styled.TouchableOpacity`
  margin-top: 4px;
`;

const TextPrint = styled.Text`
  color: ${({theme}) => theme.red};
  font-size: ${FontsDefault.small};
  font-family: ${({theme}) => theme.fontSecondary};
  font-weight: bold;
`;

export {ItemList};
