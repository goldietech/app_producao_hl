import React from 'react';
import styled from 'styled-components/native';
import {Dimensions, FlatList, View} from 'react-native';
import {FontsDefault} from '../styles/fonts';
import {RoundedButton} from './RoundedButtom';

import {FontAwesomeIcon} from '@fortawesome/react-native-fontawesome';
import {faTimes, faCheckCircle} from '@fortawesome/free-solid-svg-icons';
import {
  ResponseNoteDetail,
  ObjectNoteProduct,
  ObjectNoteProductStock,
} from '../models/NoteProductProps';

// import { Container } from './styles';
interface ProductProp {
  itemsData?: Array<any>;
  data: ObjectNoteProduct;
  status: string;
  active: boolean;
  hasHeigh?: boolean;
  onPress: () => void;
  actionEdit: () => void;
  actionDelete: () => void;
  blocked: boolean;
  arrayStock: Array<ObjectNoteProductStock>;
}
const Product: React.FC<ProductProp> = ({
  itemsData,
  data,
  status,
  active,
  hasHeigh,
  onPress,
  actionEdit,
  actionDelete,
  blocked,
  arrayStock,
}) => {
  const getStatusString = (status: string) => {
    if (status == 'stock_count') {
      return 'em contagem';
    } else if (status == 'conference') {
      return 'conferência';
    } else if (status == 'delivering') {
      return 'em espera';
    } else if (status == 'pre_finish') {
      return 'pronto';
    } else if (status == 'finished') {
      return 'finalizado';
    } else if (status == 'pending') {
      return 'pendente';
    }
  };

  const getVolume = (arrProduct: Array<ObjectNoteProductStock>) => {
    let totalParse = arrProduct.map((product) => {
      if (product != null) {
        return Number(product.total_weight);
      }
    });

    let total = totalParse.reduce((a, b) => Number(a) + Number(b), 0);
    return total;
  };
  return (
    <Container
      disabled={(blocked && status != 'conference') || status == 'finished'}
      status={status}
      onPress={onPress}
      blocked={(blocked && status != 'conference') || status == 'finished'}>
      <Wrapper>
        <ProductArea>
          <Label>Produto</Label>
          <ProductTitle>{data.obj_description}</ProductTitle>
          <ProductId>id: {data.id}</ProductId>
        </ProductArea>
        <Label style={{marginTop: 16}}>Status</Label>
        <ProductStatusTab status={status}>
          <ProductStatusText>{getStatusString(status)}</ProductStatusText>
        </ProductStatusTab>
        <VolumeArea>
          <Label style={{marginTop: 16}}>Volume</Label>
          <VolumeTag type="pct">
            <VolumeTagText>kg</VolumeTagText>
          </VolumeTag>
          <VolumeQtd>{data.total}</VolumeQtd>
        </VolumeArea>
        {/* <PriceArea>
          <Label>Preço</Label>
          <PriceTotal>R$ {data.price}</PriceTotal>
        </PriceArea> */}
      </Wrapper>

      <ListSubItensArea>
        <FlatList
          data={itemsData}
          renderItem={({item, index}) => (
            <SubProduct>
              <SubProductText>{item.obj_description}</SubProductText>
              <IconBtn onPress={() => alert('remover')}>
                <IconRemove icon={faTimes} size={30} />
              </IconBtn>
            </SubProduct>
          )}
        />
      </ListSubItensArea>

      <Divide />

      {arrayStock.length > 0 && (
        <View>
          <Label>
            Total conferido: {arrayStock.length}{' '}
            {arrayStock.length > 1 ? 'itens' : 'item'}
          </Label>

          <Label>Peso total: {getVolume(arrayStock)} kg</Label>
        </View>
      )}

      {status == 'finished' ? (
        <IconChecked icon={faCheckCircle} size={45} />
      ) : (
        <ActionsArea>
          <NotChecked />
        </ActionsArea>
      )}

      {/* {status == 'sent' && !conferenceMode && (
        <ActionsArea>
          <ActionBtn>
            <RoundedButton colorString="yellow" icon="edit" />
          </ActionBtn>

          <ActionBtn>
            <RoundedButton colorString="red" icon="remove" />
          </ActionBtn>
        </ActionsArea>
      )} */}
    </Container>
  );
};

type ContainerProp = {
  blocked: boolean;
  status: string;
};
type TypeHeightProps = {
  type: 'frd' | 'pct';
};
const Container = styled.TouchableOpacity<ContainerProp>`
  box-shadow: 2px 2px 2px #dedede;
  background-color: ${({theme}) => theme.cardBackGround};
  margin: 16px;
  border-radius: 15px;
  padding: 16px;
  border: 3px solid
    ${({theme, status}) =>
      status == 'finished' || status == 'conference'
        ? theme.green
        : theme.cardBackGround};
`;

const Wrapper = styled.View``;

const ProductArea = styled.View`
  width: 100%;
`;

const Label = styled.Text`
  font-size: ${FontsDefault.large};
  color: ${({theme}) => theme.color};
  font-family: ${({theme}) => theme.fontPrimary};
  margin-bottom: 5px;
`;

const ProductTitle = styled.Text`
  font-size: ${FontsDefault.large};
  color: ${({theme}) => theme.color};
  font-family: ${({theme}) => theme.fontSecondary};
  font-weight: bold;
`;

const ProductId = styled.Text`
  color: #dedede;
  font-size: 14px;
  font-family: ${({theme}) => theme.fontSecondary};
`;

const ProductStatusTab = styled.View<{status: string}>`
  background-color: ${({theme, status}) =>
    status == 'finished' ? theme.green : theme.lightBlue};
  justify-content: center;
  align-items: center;
  width: 100px;
  border-radius: 15px;
  padding: 5px;
  margin: 8px 0;
`;

const ProductStatusText = styled.Text`
  color: ${({theme}) => theme.dark};
  font-family: ${({theme}) => theme.fontSecondary};
`;

const VolumeArea = styled.View`
  width: 100%;
`;

const VolumeTag = styled.View<TypeHeightProps>`
  background-color: ${(props) =>
    props.type == 'pct' ? props.theme.darkBlue : props.theme.blue};
  justify-content: center;
  align-items: center;
  border-radius: 15px;
  padding: 5px;
  width: 100px;
`;

const VolumeTagText = styled.Text`
  font-size: ${FontsDefault.small};
  color: ${({theme}) => theme.white};
  font-family: ${({theme}) => theme.fontSecondary};
`;

const VolumeQtd = styled.Text`
  font-size: ${FontsDefault.medium};
  color: ${({theme}) => theme.color};
  font-family: ${({theme}) => theme.fontSecondary};
`;

const PriceArea = styled.View`
  width: 100%;
  margin: 4px 0;
`;

const PriceUnit = styled.Text`
  color: ${({theme}) => theme.color};
  font-size: ${FontsDefault.small};
  font-family: ${({theme}) => theme.fontSecondary};
`;

const PriceTotal = styled.Text`
  color: ${({theme}) => theme.color};
  font-size: ${FontsDefault.medium};
  font-family: ${({theme}) => theme.fontSecondary};
`;

const ListSubItensArea = styled.View`
  width: 100%;
  background-color: ${({theme}) => theme.cardBackGround};
  margin: 16px 0;
`;

const SubProduct = styled.View`
  flex-direction: row;
  align-items: center;
  justify-content: space-between;
`;

const SubProductText = styled.Text`
  font-size: 14px;
  color: ${({theme}) => theme.color};
`;

export const IconRemove = styled(FontAwesomeIcon).attrs((props) => ({
  color: props.theme.red,
}))``;

const ActionsArea = styled.View`
  flex-direction: row;
  align-items: center;
  justify-content: center;
  width: 100%;
`;

const NotChecked = styled.View`
  height: 45px;
  width: 45px;
  border-radius: 25px;
  border: 1px solid #525354;
`;

const ActionBtn = styled.TouchableOpacity`
  margin: 0 16px;
`;

const IconBtn = styled.TouchableOpacity``;

export const IconChecked = styled(FontAwesomeIcon).attrs((props) => ({
  color: props.theme.green,
}))`
  align-self: center;
`;

const Divide = styled.View`
  height: 1px;
  background-color: ${({theme}) => theme.gray};
  width: 100%;
  margin-bottom: 10px;
  opacity: 0.8;
`;

export {Product};
